"use client";
import { useParams } from "next/navigation";
import { Share2, Heart, MapPin, ShieldAlert, Flag, CheckCircle2, User, Phone, MessageCircle, Lock, Eye, SearchX } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import ContactUnlockModal from "@/components/ContactUnlockModal";
import PropertyDetails from "@/components/PropertyDetails";
import ListingDetails from "@/components/ListingDetails";
import ImageGallery from "@/components/ImageGallery";
import { api, ListingData } from "@/lib/api";
import { getCategoryLucideIcon } from "@/lib/category-icons";
import { useLang } from "@/lib/lang-context";
import { useLocation } from "@/lib/location-context";
import { useAuth } from "@/lib/auth-context";
import { hasMinimumRole } from "@/lib/useAdminGuard";
import { haversineKm, formatDistance } from "@/lib/distance";
import { districtCentroid } from "@/lib/districtCentroids";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function ItemDetailPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const itemId = params.itemId as string;

  const { lang } = useLang();
  const t = (kn: string, en: string) => (lang === "en" ? en : kn);
  const { coords } = useLocation();
  const { user } = useAuth();
  const isModerator = hasMinimumRole(user?.role, "CHECKER");
  const [item, setItem] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [takingDown, setTakingDown] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Unlock state + revealed contact, lifted here so the full Contact and
  // Address cards can render in the left column (Housing.com style) after unlock.
  const [unlocked, setUnlocked] = useState(false);
  const [contact, setContact] = useState<{ name?: string | null; mobile?: string | null; whatsapp?: string | null; fullAddress?: string | null } | null>(null);

  // Re-fetch the listing + unlock status (used after an unlock so the now-
  // revealed paid fields, exact location and contact appear without a reload).
  const refetchListing = () => {
    const id = parseInt(itemId);
    if (isNaN(id)) return;
    // The user just unlocked (free click or paid) → reveal the full cards.
    setUnlocked(true);
    api.getListingById(id).then(setItem).catch(() => {});
    if (api.getToken()) {
      api.checkUnlock(id)
        .then((r) => setContact(r.contact || null))
        .catch(() => {});
    }
  };

  useEffect(() => {
    const id = parseInt(itemId);
    if (isNaN(id)) {
      setLoading(false);
      return;
    }
    api.getListingById(id)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));

    // Check if this listing is already in favorites
    if (api.getToken()) {
      api.getFavorites(0, 100)
        .then((res) => setIsFavorited(res.content.some((f) => f.id === id)))
        .catch(() => {});

      // Reveal the full cards on load if the user has a SAVED unlock record
      // (paid, or a free unlock they clicked earlier). Free listings not yet
      // clicked stay locked until the user clicks "Unlock for Free".
      api.checkUnlock(id)
        .then((r) => {
          if (r.recorded) {
            setUnlocked(true);
            setContact(r.contact || null);
          }
        })
        .catch(() => {});
    }
  }, [itemId]);

  const toggleFavorite = async () => {
    if (!item) return;
    if (!api.getToken()) {
      toast.error(t("ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ", "Please log in first"));
      return;
    }
    setFavLoading(true);
    try {
      if (isFavorited) {
        await api.removeFavorite(item.id);
        setIsFavorited(false);
        toast.success(t("ಇಷ್ಟಪಟ್ಟಿಯಿಂದ ತೆಗೆಯಲಾಗಿದೆ", "Removed from favorites"));
      } else {
        await api.addFavorite(item.id);
        setIsFavorited(true);
        toast.success(t("ಇಷ್ಟಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ", "Added to favorites"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("ವಿಫಲವಾಗಿದೆ", "Something went wrong"));
    } finally {
      setFavLoading(false);
    }
  };

  const handleReport = async () => {
    if (!item) return;
    if (!api.getToken()) {
      toast.error(t("ವರದಿ ಮಾಡಲು ಲಾಗಿನ್ ಮಾಡಿ", "Please log in to report"));
      return;
    }
    const reason = window.prompt(
      t(
        "ಈ ಜಾಹೀರಾತನ್ನು ವರದಿ ಮಾಡಲು ಕಾರಣ\n\nಉದಾ: ಸ್ಪ್ಯಾಮ್, ವಂಚನೆ, ಅನುಚಿತ, ನಕಲು, ಇತರೆ",
        "Why are you reporting this ad?\n\ne.g. Spam, Fraud, Inappropriate, Duplicate, Other"
      )
    );
    if (reason == null) return;
    if (!reason.trim()) {
      toast.error(t("ಕಾರಣ ಅಗತ್ಯ", "A reason is required"));
      return;
    }
    try {
      await api.reportListing(item.id, reason.trim());
      toast.success(t("ವರದಿ ಸಲ್ಲಿಸಲಾಗಿದೆ, ಧನ್ಯವಾದಗಳು", "Report submitted, thank you"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("ವರದಿ ಸಲ್ಲಿಸಲಾಗಲಿಲ್ಲ", "Could not submit the report");
      // Backend blocks duplicate reports from the same user.
      toast.error(msg.includes("already") ? t("ನೀವು ಈಗಾಗಲೇ ವರದಿ ಮಾಡಿದ್ದೀರಿ", "You already reported this") : msg);
    }
  };

  const handleTakeDown = async () => {
    if (!item) return;
    const reason = window.prompt(
      t("ಈ ಜಾಹೀರಾತನ್ನು ತೆಗೆದುಹಾಕಲು ಕಾರಣ ನಮೂದಿಸಿ:", "Reason for taking down this listing:")
    );
    if (reason == null) return; // cancelled
    if (!reason.trim()) {
      toast.error(t("ಕಾರಣ ಅಗತ್ಯ", "A reason is required"));
      return;
    }
    setTakingDown(true);
    try {
      await api.adminTakeDownListing(item.id, reason.trim());
      toast.success(t("ಜಾಹೀರಾತು ತೆಗೆದುಹಾಕಲಾಗಿದೆ", "Listing taken down"));
      setItem({ ...item, status: "REJECTED" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("ಜಾಹೀರಾತು ತೆಗೆದುಹಾಕಲಾಗಲಿಲ್ಲ", "Could not take down the listing"));
    } finally {
      setTakingDown(false);
    }
  };

  const handleRestore = async () => {
    if (!item) return;
    setRestoring(true);
    try {
      await api.adminRestoreListing(item.id);
      toast.success(t("ಜಾಹೀರಾತು ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ", "Listing restored"));
      setItem({ ...item, status: "ACTIVE" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("ಮರುಸ್ಥಾಪಿಸಲಾಗಲಿಲ್ಲ", "Could not restore the listing"));
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="h-80 bg-muted rounded-xl mb-6" />
          <div className="h-8 bg-muted rounded w-1/2 mb-3" />
          <div className="h-6 bg-muted rounded w-1/4" />
        </div>
      </AppLayout>
    );
  }

  if (!item) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto p-6 text-center py-20">
          <SearchX size={32} strokeWidth={1.5} className="mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-foreground text-lg font-medium">{t("ಜಾಹೀರಾತು ಕಂಡುಬಂದಿಲ್ಲ", "Listing not found")}</p>
          <Link href={`/category/${categoryId}`} className="text-primary mt-4 inline-block hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            {t("ಹಿಂದೆ ಹೋಗಿ", "Go back")}
          </Link>
        </div>
      </AppLayout>
    );
  }

  const details = [
    item.breed && `${t("ತಳಿ", "Breed")}: ${item.breed}`,
    item.age && `${t("ವಯಸ್ಸು", "Age")}: ${item.age}`,
    item.condition && `${t("ಸ್ಥಿತಿ", "Condition")}: ${item.condition}`,
    item.hp && `${t("ಪವರ್", "Power")}: ${item.hp}`,
    item.area && `${t("ವಿಸ್ತೀರ್ಣ", "Area")}: ${item.area}`,
    item.skill && `${t("ಕೌಶಲ", "Skill")}: ${item.skill}`,
    item.experience && `${t("ಅನುಭವ", "Experience")}: ${item.experience}`,
    item.vehicleType && `${t("ವಿಧ", "Type")}: ${item.vehicleType}`,
    item.rateInfo && `${t("ದರ", "Rate")}: ${item.rateInfo}`,
    // Only the general area is free: district + taluk. The exact location
    // (item.location) is withheld by the backend until the buyer unlocks.
    item.district && `${t("ಜಿಲ್ಲೆ", "District")}: ${item.district}`,
    item.taluk && `${t("ತಾಲೂಕು", "Taluk")}: ${item.taluk}`,
  ].filter(Boolean) as string[];

  // Free, general location label: "Taluk, District" (exact address is paid).
  const generalLocation = [item.taluk, item.district].filter(Boolean).join(", ");

  // Property SALES use PropertyDetails (its schema); rent/lease + others use
  // the generic ListingDetails which matches the keys those forms actually save.
  const isPropertySales =
    item.category.startsWith("property-sales") || categoryId.startsWith("property-sales") ||
    item.category === "property-sales" || categoryId === "property-sales";

  const FallbackIcon = getCategoryLucideIcon(item.category);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/home" className="hover:text-primary transition-colors duration-200 ease-out">{t("ಹೋಮ್", "Home")}</Link>
          <span>/</span>
          <Link href={`/category/${categoryId}`} className="hover:text-primary transition-colors duration-200 ease-out">{categoryId.replace(/-/g, " ")}</Link>
          <span>/</span>
          <span className="text-foreground">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Images */}
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery
              images={item.images || []}
              alt={item.title}
              fallback={<FallbackIcon size={64} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />}
              overlay={
                (() => {
                  const c = districtCentroid(item.district);
                  if (!coords || !c) return null;
                  return (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full pointer-events-none">
                      <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
                      {formatDistance(haversineKm(coords.lat, coords.lng, c.lat, c.lng))}
                    </span>
                  );
                })()
              }
            />

            {/* Property SALES use the sales-schema renderer (propertyArea, docs,
                etc.). Property RENT/LEASE store a different schema (propertyType,
                bhk, furnishing, facilities, houseRules...) so they use the
                generic ListingDetails which renders those keys correctly. */}
            {item.details && isPropertySales && (
              <PropertyDetails detailsJson={item.details} />
            )}

            {/* Rich details for rent/lease + all non-property categories. */}
            {item.details && !isPropertySales && (
              <ListingDetails detailsJson={item.details} />
            )}

            {/* Flat-column fallback — shown only when there's no rich details JSON. */}
            {details.length > 0 && !item.details && !isPropertySales && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-base font-medium text-foreground mb-4">{t("ವಿವರಗಳು", "Details")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {details.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <span className="text-sm text-card-foreground">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── After-unlock reveal cards (Housing.com style) — full location
                 and contact shown below the details once unlocked. ── */}
            {unlocked && (item.location || contact) && (
              <div className="bg-card rounded-xl p-6 border border-border space-y-4">
                <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                  <CheckCircle2 size={18} strokeWidth={1.5} className="text-primary" aria-hidden="true" /> {t("ಅನ್‌ಲಾಕ್ ಆದ ವಿವರಗಳು", "Unlocked details")}
                </h3>

                {/* Exact location / address */}
                {(item.location || item.latitude != null) && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{t("ನಿಖರ ವಿಳಾಸ", "Address and location")}</p>
                    {item.location && (
                      <p className="text-sm font-medium text-foreground flex items-start gap-2">
                        <MapPin size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" /> {item.location}
                      </p>
                    )}
                    {item.latitude != null && item.longitude != null && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <MapPin size={16} strokeWidth={1.5} aria-hidden="true" /> {t("ಗೂಗಲ್ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ", "Open in Maps")}
                      </a>
                    )}
                  </div>
                )}

                {/* Contact */}
                {contact && (contact.name || contact.mobile || contact.whatsapp) && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">{t("ಸಂಪರ್ಕ", "Contact")}</p>
                    {contact.name && (
                      <p className="text-sm text-foreground flex items-center gap-2"><User size={16} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" /> {contact.name}</p>
                    )}
                    {contact.mobile && (
                      <a href={`tel:${contact.mobile}`} className="text-sm font-medium text-primary flex items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-ring"><Phone size={16} strokeWidth={1.5} aria-hidden="true" /> {contact.mobile}</a>
                    )}
                    {contact.whatsapp && (
                      <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary flex items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-ring"><MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" /> WhatsApp: {contact.whatsapp}</a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-base font-medium text-foreground mb-2">{t("ವಿವರಣೆ", "Description")}</h3>
                <p className="text-sm text-card-foreground whitespace-pre-line">{item.description}</p>
              </div>
            )}

            {/* Map placeholder for land */}
            {categoryId === "land" && (
              <div className="bg-muted rounded-xl h-64 flex items-center justify-center border border-border">
                <div className="text-center text-muted-foreground">
                  <MapPin size={32} strokeWidth={1.5} className="mx-auto mb-2" aria-hidden="true" />
                  <p className="text-sm">{t("ನಕ್ಷೆ", "Map")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right - Sidebar */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex justify-between items-start gap-2 mb-4">
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{item.title}</h1>
                  {item.titleEn && <p className="text-sm text-muted-foreground mt-1">{item.titleEn}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    disabled={favLoading}
                    className="p-2 rounded-full hover:bg-muted transition-colors duration-200 ease-out disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      size={20}
                      strokeWidth={1.5}
                      className={isFavorited ? "text-destructive fill-destructive" : "text-muted-foreground"}
                    />
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: item.title, url: window.location.href }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success(t("ಲಿಂಕ್ ಕಾಪಿ ಆಗಿದೆ", "Link copied"));
                      }
                    }}
                    className="p-2 rounded-full hover:bg-muted transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={t("ಹಂಚಿಕೊಳ್ಳಿ", "Share")}
                  >
                    <Share2 size={20} strokeWidth={1.5} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              <p className="text-3xl font-semibold text-primary">
                {item.price ? `₹${item.price.toLocaleString()}${item.priceUnit ? '/' + item.priceUnit : ''}` : item.rateInfo || ""}
              </p>
              {generalLocation && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
                  <span>{generalLocation}</span>
                </div>
              )}
              {!item.location && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Lock size={12} strokeWidth={1.5} aria-hidden="true" /> {t("ನಿಖರ ವಿಳಾಸ ಅನ್‌ಲಾಕ್ ನಂತರ", "Exact address shown after unlock")}
                </p>
              )}

              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Eye size={14} strokeWidth={1.5} aria-hidden="true" /> {lang === "en" ? `${item.viewCount} views` : `${item.viewCount} ವೀಕ್ಷಣೆ`}
                </p>
                <button
                  onClick={handleReport}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors duration-200 ease-out rounded-md focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Flag size={14} strokeWidth={1.5} aria-hidden="true" /> {t("ವರದಿ ಮಾಡಿ", "Report")}
                </button>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-sm font-medium text-foreground mb-4">{t("ಮಾರಾಟಗಾರ", "Seller")}</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <User size={20} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium">{item.sellerName || t("ಮಾರಾಟಗಾರ", "Seller")}</p>
                  <p className="text-xs text-muted-foreground">{item.sellerLocation || generalLocation}</p>
                </div>
              </div>
              <ContactUnlockModal listingId={item.id} onUnlocked={refetchListing} />
            </div>

            {/* Moderator action — take down this listing */}
            {isModerator && (
              <div className="bg-card rounded-xl p-4 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <ShieldAlert size={16} strokeWidth={1.5} aria-hidden="true" /> {t("ಮಾಡರೇಟರ್", "Moderator")}
                </p>
                {item.status === "REJECTED" ? (
                  <div className="space-y-2">
                    <p className="text-sm text-destructive font-medium">
                      {t("ಈ ಜಾಹೀರಾತು ತೆಗೆದುಹಾಕಲಾಗಿದೆ", "This listing has been taken down")}
                    </p>
                    {item.imagesPurged ? (
                      <p className="text-xs text-muted-foreground">
                        {t("ಚಿತ್ರಗಳು ಅಳಿಸಲಾಗಿದೆ, ಮರುಸ್ಥಾಪನೆ ಅವಧಿ ಮುಗಿದಿದೆ", "Images purged, restore window expired")}
                      </p>
                    ) : (
                      <button
                        onClick={handleRestore}
                        disabled={restoring}
                        className="flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-border text-foreground hover:bg-muted transition-colors duration-200 ease-out text-sm font-medium disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <ShieldAlert size={16} strokeWidth={1.5} aria-hidden="true" />
                        {restoring ? t("ಮರುಸ್ಥಾಪಿಸಲಾಗುತ್ತಿದೆ...", "Restoring...") : t("ಮರುಸ್ಥಾಪಿಸಿ", "Restore")}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleTakeDown}
                    disabled={takingDown}
                    className="flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors duration-200 ease-out text-sm font-medium disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ShieldAlert size={16} strokeWidth={1.5} aria-hidden="true" />
                    {takingDown ? t("ತೆಗೆದುಹಾಕಲಾಗುತ್ತಿದೆ...", "Taking down...") : t("ಜಾಹೀರಾತು ತೆಗೆದುಹಾಕಿ", "Take down")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
