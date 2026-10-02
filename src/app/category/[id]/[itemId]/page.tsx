"use client";
import { useParams } from "next/navigation";
import { Share2, Heart, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import ContactUnlockModal from "@/components/ContactUnlockModal";
import { api, ListingData } from "@/lib/api";
import { getCategoryIcon } from "@/lib/categories";
import { useLocation } from "@/lib/location-context";
import { haversineKm, formatDistance } from "@/lib/distance";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function ItemDetailPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const itemId = params.itemId as string;

  const { coords } = useLocation();
  const [item, setItem] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

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
    }
  }, [itemId]);

  const toggleFavorite = async () => {
    if (!item) return;
    if (!api.getToken()) {
      toast.error("ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ (Please login first)");
      return;
    }
    setFavLoading(true);
    try {
      if (isFavorited) {
        await api.removeFavorite(item.id);
        setIsFavorited(false);
        toast.success("ಇಷ್ಟಪಟ್ಟಿಯಿಂದ ತೆಗೆಯಲಾಗಿದೆ (Removed from favorites)");
      } else {
        await api.addFavorite(item.id);
        setIsFavorited(true);
        toast.success("ಇಷ್ಟಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ! (Added to favorites)");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setFavLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto p-6 animate-pulse">
          <div className="h-80 bg-muted rounded-2xl mb-6" />
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
          <p className="text-5xl mb-4">😔</p>
          <p className="text-muted-foreground text-lg">ಜಾಹೀರಾತು ಕಂಡುಬಂದಿಲ್ಲ (Listing not found)</p>
          <Link href={`/category/${categoryId}`} className="text-primary mt-4 inline-block hover:underline">
            ← ಹಿಂದೆ ಹೋಗಿ
          </Link>
        </div>
      </AppLayout>
    );
  }

  const details = [
    item.breed && `ತಳಿ: ${item.breed}`,
    item.age && `ವಯಸ್ಸು: ${item.age}`,
    item.condition && `ಸ್ಥಿತಿ: ${item.condition}`,
    item.hp && `ಪವರ್: ${item.hp}`,
    item.area && `ವಿಸ್ತೀರ್ಣ: ${item.area}`,
    item.skill && `ಕೌಶಲ: ${item.skill}`,
    item.experience && `ಅನುಭವ: ${item.experience}`,
    item.vehicleType && `ವಿಧ: ${item.vehicleType}`,
    item.rateInfo && `ದರ: ${item.rateInfo}`,
    item.location && `ಸ್ಥಳ: ${item.location}`,
    item.district && `ಜಿಲ್ಲೆ: ${item.district}`,
  ].filter(Boolean) as string[];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/home" className="hover:text-primary">ಹೋಮ್</Link>
          <span>/</span>
          <Link href={`/category/${categoryId}`} className="hover:text-primary">{categoryId.replace(/-/g, " ")}</Link>
          <span>/</span>
          <span className="text-foreground">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Images */}
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full h-80 bg-muted rounded-2xl flex items-center justify-center overflow-hidden">
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">{getCategoryIcon(item.category)}</span>
              )}
            </div>

            {/* More images */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {item.images.slice(1).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-24 h-24 rounded-lg object-cover border border-border" />
                ))}
              </div>
            )}

            {/* Details */}
            {details.length > 0 && (
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="text-base font-semibold text-foreground mb-4">ವಿವರಗಳು (Details)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {details.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <span className="text-sm text-card-foreground">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="text-base font-semibold text-foreground mb-2">ವಿವರಣೆ (Description)</h3>
                <p className="text-sm text-card-foreground whitespace-pre-line">{item.description}</p>
              </div>
            )}

            {/* Map placeholder for land */}
            {categoryId === "land" && (
              <div className="bg-muted rounded-2xl h-64 flex items-center justify-center border border-border">
                <div className="text-center text-muted-foreground">
                  <MapPin size={40} className="mx-auto mb-2" />
                  <p className="text-sm">ನಕ್ಷೆ (Map Placeholder)</p>
                </div>
              </div>
            )}
          </div>

          {/* Right - Sidebar */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">{item.title}</h1>
                  {item.titleEn && <p className="text-sm text-muted-foreground">{item.titleEn}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    disabled={favLoading}
                    className="p-2 rounded-full hover:bg-muted transition disabled:opacity-50"
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      size={20}
                      className={isFavorited ? "text-red-500 fill-red-500" : "text-muted-foreground"}
                    />
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: item.title, url: window.location.href }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("ಲಿಂಕ್ ಕಾಪಿ ಆಗಿದೆ!");
                      }
                    }}
                    className="p-2 rounded-full hover:bg-muted"
                  >
                    <Share2 size={20} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary">
                {item.price ? `₹${item.price.toLocaleString()}${item.priceUnit ? '/' + item.priceUnit : ''}` : item.rateInfo || ""}
              </p>
              {item.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <MapPin size={14} />
                  <span>{item.location}</span>
                </div>
              )}
              {coords && item.latitude != null && item.longitude != null && (
                <div className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full mt-2">
                  <MapPin size={12} />
                  {formatDistance(haversineKm(coords.lat, coords.lng, item.latitude, item.longitude))} ನಿಮ್ಮಿಂದ (away)
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">👁 {item.viewCount} ವೀಕ್ಷಣೆ</p>
            </div>

            {/* Seller Card */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">ಮಾರಾಟಗಾರ (Seller)</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl">👤</div>
                <div>
                  <p className="font-medium">{item.sellerName || "Seller"}</p>
                  <p className="text-xs text-muted-foreground">{item.sellerLocation || item.location}</p>
                </div>
              </div>
              <ContactUnlockModal listingId={item.id} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
