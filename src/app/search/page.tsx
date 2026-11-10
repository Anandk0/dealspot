"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Mic, X, MapPin, Tag, Package, Clock } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { api, ListingData, SearchSuggestion } from "@/lib/api";
import { getCategoryLucideIcon } from "@/lib/category-icons";
import { useLang } from "@/lib/lang-context";

const RECENT_KEY = "dealspot_recent_searches";
const RECENT_MAX = 8;
const SUGGEST_DEBOUNCE = 250;
const RESULTS_DEBOUNCE = 400;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string").slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function storeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

// One selectable row in the dropdown.
interface Row {
  key: string;
  icon: "recent" | "category" | "listing" | "query";
  label: string;
  secondary?: string;
  onSelect: () => void;
}

export default function SearchPage() {
  const { lang } = useLang();
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [popular, setPopular] = useState<SearchSuggestion[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [didYouMean, setDidYouMean] = useState<{ forQuery: string; text: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchSeq = useRef(0);
  const suggestSeq = useRef(0);

  const en = lang === "en";

  useEffect(() => {
    setRecent(loadRecent());
    api
      .searchSuggest("", 8)
      .then((r) => setPopular(r.suggestions.filter((s) => s.type === "category")))
      .catch(() => {});
  }, []);

  const saveRecent = useCallback((q: string) => {
    const t = q.trim();
    if (t.length < 2) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((s) => s.toLowerCase() !== t.toLowerCase())].slice(0, RECENT_MAX);
      storeRecent(next);
      return next;
    });
  }, []);

  const clearRecent = () => {
    setRecent([]);
    storeRecent([]);
  };

  const runSearch = useCallback(async (q: string) => {
    const seq = ++searchSeq.current;
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.search(q.trim());
      if (seq === searchSeq.current) setResults(res.content);
    } catch {
      if (seq === searchSeq.current) setResults([]);
    } finally {
      if (seq === searchSeq.current) setLoading(false);
    }
  }, []);

  // Live results while typing.
  useEffect(() => {
    const t = setTimeout(() => runSearch(query), RESULTS_DEBOUNCE);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  // Suggestions while typing.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      suggestSeq.current++;
      setSuggestions([]);
      setDidYouMean(null);
      return;
    }
    const t = setTimeout(async () => {
      const seq = ++suggestSeq.current;
      try {
        const r = await api.searchSuggest(q, 8);
        if (seq !== suggestSeq.current) return;
        setSuggestions(r.suggestions ?? []);
        setDidYouMean(r.didYouMean ? { forQuery: q, text: r.didYouMean } : null);
      } catch {
        if (seq !== suggestSeq.current) return;
        setSuggestions([]);
        setDidYouMean(null);
      }
    }, SUGGEST_DEBOUNCE);
    return () => clearTimeout(t);
  }, [query]);

  // Click outside closes the dropdown.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const submit = (q: string) => {
    setQuery(q);
    setOpen(false);
    setActive(-1);
    saveRecent(q);
    runSearch(q);
  };

  const trimmed = query.trim();
  const showingIdle = trimmed.length < 2;

  const categoryRow = (s: Extract<SearchSuggestion, { type: "category" }>): Row => ({
    key: `c-${s.slug}`,
    icon: "category",
    label: en ? s.textEn : s.text,
    secondary: [en ? s.text : s.textEn, s.parent ? (en ? `in ${s.parent}` : `${s.parent} ನಲ್ಲಿ`) : null]
      .filter((x) => x && x !== (en ? s.textEn : s.text))
      .join(" · "),
    onSelect: () => {
      if (!showingIdle) saveRecent(query);
      setOpen(false);
      router.push(`/category/${s.slug}`);
    },
  });

  const rows: Row[] = showingIdle
    ? [
        ...recent.map<Row>((r) => ({ key: `r-${r}`, icon: "recent", label: r, onSelect: () => submit(r) })),
        ...popular.map((s) => categoryRow(s as Extract<SearchSuggestion, { type: "category" }>)),
      ]
    : suggestions.map<Row>((s, i) => {
        if (s.type === "category") return categoryRow(s);
        if (s.type === "listing") {
          return {
            key: `l-${s.id}-${i}`,
            icon: "listing",
            label: s.text,
            onSelect: () => {
              saveRecent(query);
              setOpen(false);
              router.push(`/category/${s.category}/${s.id}`);
            },
          };
        }
        return { key: `q-${s.text}-${i}`, icon: "query", label: s.text, onSelect: () => submit(s.text) };
      });

  const expanded = open && rows.length > 0;
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      if (rows.length) setActive((a) => (a + 1) % rows.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (rows.length) setActive((a) => (a <= 0 ? rows.length - 1 : a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (expanded && active >= 0 && rows[active]) rows[active].onSelect();
      else submit(query);
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setActive(-1);
      }
    }
  };

  const iconFor = (k: Row["icon"]) => {
    const p = { size: 16, strokeWidth: 1.5, className: "text-muted-foreground shrink-0", "aria-hidden": true as const };
    if (k === "category") return <Tag {...p} />;
    if (k === "listing") return <Package {...p} />;
    if (k === "recent") return <Clock {...p} />;
    return <SearchIcon {...p} />;
  };

  const sectionOf = (i: number): string | null => {
    if (!showingIdle) return null;
    const firstPopular = recent.length;
    if (i === 0 && recent.length > 0) return en ? "Recent searches" : "ಇತ್ತೀಚಿನ ಹುಡುಕಾಟಗಳು";
    if (i === firstPopular && popular.length > 0) return en ? "Popular categories" : "ಜನಪ್ರಿಯ ವರ್ಗಗಳು";
    return null;
  };

  const dym = didYouMean && didYouMean.forQuery === trimmed ? didYouMean.text : null;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Search Input */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 relative" ref={wrapRef}>
            <SearchIcon size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              role="combobox"
              aria-expanded={expanded}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
              aria-label={en ? "Search" : "ಹುಡುಕಿ"}
              autoComplete="off"
              placeholder={en ? "Search products, animals, services" : "ಉತ್ಪನ್ನ, ಪ್ರಾಣಿ, ಸೇವೆ ಹುಡುಕಿ"}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(-1);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              className="pl-11 pr-10 h-12 rounded-xl bg-card border-border text-base"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setSearched(false);
                  setActive(-1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={en ? "Clear search" : "ಹುಡುಕಾಟ ತೆರವುಗೊಳಿಸಿ"}
              >
                <X size={16} strokeWidth={1.5} className="text-muted-foreground" />
              </button>
            )}

            {expanded && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {showingIdle && recent.length > 0 && (
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <span className="text-xs font-medium text-muted-foreground">{en ? "Recent searches" : "ಇತ್ತೀಚಿನ ಹುಡುಕಾಟಗಳು"}</span>
                    <button
                      type="button"
                      onClick={clearRecent}
                      className="text-xs font-medium text-primary rounded-md px-1 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {en ? "Clear all" : "ಎಲ್ಲಾ ತೆರವುಗೊಳಿಸಿ"}
                    </button>
                  </div>
                )}
                <ul id={listId} role="listbox" aria-label={en ? "Search suggestions" : "ಹುಡುಕಾಟ ಸಲಹೆಗಳು"} className="max-h-96 overflow-y-auto py-1">
                  {rows.map((row, i) => {
                    const section = sectionOf(i);
                    return (
                      <li key={row.key} role="presentation">
                        {section && i !== 0 && (
                          <div className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground">{section}</div>
                        )}
                        <div
                          id={optionId(i)}
                          role="option"
                          aria-selected={i === active}
                          onMouseEnter={() => setActive(i)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={row.onSelect}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm ${i === active ? "bg-accent" : ""}`}
                        >
                          {iconFor(row.icon)}
                          <span className="text-foreground truncate">{row.label}</span>
                          {row.secondary && <span className="text-xs text-muted-foreground truncate">{row.secondary}</span>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          <button
            className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center hover:bg-accent transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={en ? "Voice search" : "ಧ್ವನಿ ಹುಡುಕಾಟ"}
          >
            <Mic size={18} strokeWidth={1.5} className="text-foreground" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : searched && results.length > 0 ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {en ? `${results.length} results` : `${results.length} ಫಲಿತಾಂಶಗಳು`}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {results.map((item) => {
                const ItemIcon = getCategoryLucideIcon(item.category);
                return (
                  <Link
                    key={item.id}
                    href={`/category/${item.category}/${item.id}`}
                    onClick={() => saveRecent(query)}
                    className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-shadow duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ItemIcon size={24} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground">{item.title}</p>
                      <p className="text-sm text-primary font-medium mt-1">
                        {item.price ? `₹${item.price.toLocaleString()}` : item.rateInfo || ""}
                      </p>
                      {(item.taluk || item.district) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin size={12} strokeWidth={1.5} aria-hidden="true" />
                          <span>{[item.taluk, item.district].filter(Boolean).join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : searched ? (
          <div className="text-center py-16">
            <SearchIcon size={32} strokeWidth={1.5} className="mx-auto text-muted-foreground mb-4" aria-hidden="true" />
            <p className="text-foreground font-medium">
              {en ? "No results found" : "ಯಾವುದೇ ಫಲಿತಾಂಶ ಸಿಗಲಿಲ್ಲ"}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {en ? <>Nothing matched &quot;{query}&quot;</> : <>&quot;{query}&quot; ಗೆ ಹೊಂದುವ ಫಲಿತಾಂಶ ಇಲ್ಲ</>}
            </p>
            {dym && (
              <p className="text-sm mt-3 text-muted-foreground">
                {en ? "Did you mean " : "ನೀವು ಹೇಳಿದ್ದು "}
                <button
                  type="button"
                  onClick={() => submit(dym)}
                  className="text-primary font-medium underline underline-offset-2 rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {dym}
                </button>
                {en ? "?" : "?"}
              </p>
            )}
            <ul className="text-sm text-muted-foreground mt-6 space-y-1">
              <li>{en ? "Check the spelling or try fewer words" : "ಕಾಗುಣಿತ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಕಡಿಮೆ ಪದಗಳನ್ನು ಬಳಸಿ"}</li>
              <li>{en ? "Try a general word, like the kind of item" : "ವಸ್ತುವಿನ ಸಾಮಾನ್ಯ ಹೆಸರನ್ನು ಪ್ರಯತ್ನಿಸಿ"}</li>
              <li>{en ? "You can search in Kannada or English" : "ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಹುಡುಕಬಹುದು"}</li>
            </ul>
            {popular.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-medium text-muted-foreground mb-2">{en ? "Browse popular categories" : "ಜನಪ್ರಿಯ ವರ್ಗಗಳನ್ನು ನೋಡಿ"}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {popular.map((s) =>
                    s.type === "category" ? (
                      <Link
                        key={s.slug}
                        href={`/category/${s.slug}`}
                        className="px-3 py-1.5 rounded-full border border-border bg-card text-sm text-foreground hover:bg-accent transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {en ? s.textEn : s.text}
                      </Link>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchIcon size={32} strokeWidth={1.5} className="mx-auto text-muted-foreground mb-4" aria-hidden="true" />
            <p className="text-muted-foreground">{en ? "Type to search" : "ಹುಡುಕಲು ಟೈಪ್ ಮಾಡಿ"}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
