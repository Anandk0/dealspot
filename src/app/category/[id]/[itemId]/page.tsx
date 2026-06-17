"use client";
import { useParams } from "next/navigation";
import { ArrowLeft, Share2, Heart, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import ContactUnlockModal from "@/components/ContactUnlockModal";
import { toast } from "sonner";
import {
  agriculturalProducts, livestock, farmEquipment,
  tractors, vehicles, laborers, lands, services
} from "@/lib/mock-data";

export default function ItemDetailPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const itemId = params.itemId as string;

  const getItem = () => {
    switch (categoryId) {
      case "agricultural-products": {
        const p = agriculturalProducts.find(i => i.id === itemId);
        if (!p) return null;
        return { title: p.name, subtitle: p.nameEn, price: `₹${p.price.toLocaleString()}/${p.unit}`, location: p.location, seller: p.seller, icon: "🌾", details: [`ಪ್ರಮಾಣ: ${p.quantity}`, `ಸ್ಥಳ: ${p.location}`] };
      }
      case "livestock": {
        const p = livestock.find(i => i.id === itemId);
        if (!p) return null;
        return { title: p.name, subtitle: p.nameEn, price: `₹${p.price.toLocaleString()}`, location: p.location, seller: p.seller, icon: "🐄", details: [`ತಳಿ: ${p.breed}`, `ವಯಸ್ಸು: ${p.age}`, p.description] };
      }
      case "farm-equipment": {
        const p = farmEquipment.find(i => i.id === itemId);
        if (!p) return null;
        return { title: p.name, subtitle: p.nameEn, price: `₹${p.price.toLocaleString()}`, location: p.location, seller: p.seller, icon: "🚜", details: [`ಸ್ಥಿತಿ: ${p.condition}`, `ಸ್ಥಳ: ${p.location}`] };
      }
      case "tractor-rental": {
        const p = tractors.find(i => i.id === itemId);
        if (!p) return null;
        return { title: p.name, subtitle: p.hp, price: p.rate, location: p.location, seller: p.owner, icon: "🚜", details: [`ಪವರ್: ${p.hp}`, `ದರ: ${p.rate}`, `ಸ್ಥಳ: ${p.location}`] };
      }
      case "vehicle-rental": {
        const p = vehicles.find(i => i.id === itemId);
        if (!p) return null;
        return { title: p.name, subtitle: p.nameEn, price: p.rate, location: p.location, seller: p.owner, icon: "🚗", details: [`ವಿಧ: ${p.type}`, `ದರ: ${p.rate}`, `ಸ್ಥಳ: ${p.location}`] };
      }
      case "labor": {
        const p = laborers.find(i => i.id === itemId);
        if (!p) return null;
        return { title: p.name, subtitle: p.skill, price: p.wage, location: p.location, seller: p.name, icon: "👨‍🌾", details: [`ಕೌಶಲ: ${p.skill}`, `ಅನುಭವ: ${p.experience}`, `ವಯಸ್ಸು: ${p.age}`] };
      }
      case "land": {
        const p = lands.find(i => i.id === itemId);
        if (!p) return null;
        return { title: `${p.area} - ${p.village}`, subtitle: p.district, price: `₹${p.price.toLocaleString()}`, location: p.village, seller: p.seller, icon: "🏞️", details: [`ವಿಸ್ತೀರ್ಣ: ${p.area}`, p.description, `ಜಿಲ್ಲೆ: ${p.district}`] };
      }
      case "services": {
        const p = services.find(i => i.id === itemId);
        if (!p) return null;
        return { title: p.name, subtitle: p.nameEn, price: p.rate, location: p.location, seller: p.provider, icon: "🔧", details: [`ದರ: ${p.rate}`, `ರೇಟಿಂಗ್: ⭐ ${p.rating}`, `ಸ್ಥಳ: ${p.location}`] };
      }
      default: return null;
    }
  };

  const item = getItem();
  if (!item) return <AppLayout><div className="p-8 text-center">Item not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/home" className="hover:text-primary">ಹೋಮ್</Link>
          <span>/</span>
          <Link href={`/category/${categoryId}`} className="hover:text-primary">
            {categoryId.replace(/-/g, " ")}
          </Link>
          <span>/</span>
          <span className="text-gray-800">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Image */}
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full h-80 bg-gray-100 rounded-2xl flex items-center justify-center text-8xl">
              {item.icon}
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-700 mb-4">ವಿವರಗಳು (Details)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.details.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder for land */}
            {categoryId === "land" && (
              <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center border border-gray-200">
                <div className="text-center text-gray-400">
                  <MapPin size={40} className="mx-auto mb-2" />
                  <p className="text-sm">ನಕ್ಷೆ (Map Placeholder)</p>
                </div>
              </div>
            )}
          </div>

          {/* Right - Sidebar Info */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{item.title}</h1>
                  <p className="text-sm text-gray-500">{item.subtitle}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.success("ಇಷ್ಟಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ!")}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <Heart size={20} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => toast.success("ಲಿಂಕ್ ಕಾಪಿ ಆಗಿದೆ!")}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <Share2 size={20} className="text-gray-400" />
                  </button>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary">{item.price}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                <MapPin size={14} />
                <span>{item.location}</span>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">ಮಾರಾಟಗಾರ (Seller)</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                  👤
                </div>
                <div>
                  <p className="font-medium">{item.seller}</p>
                  <p className="text-xs text-gray-500">{item.location}</p>
                </div>
              </div>
              <ContactUnlockModal />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
