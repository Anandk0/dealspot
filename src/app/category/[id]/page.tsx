"use client";
import { useParams } from "next/navigation";
import { Plus, Heart, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  categories, agriculturalProducts, livestock,
  farmEquipment, tractors, vehicles, laborers, lands, services
} from "@/lib/mock-data";

export default function CategoryPage() {
  const params = useParams();
  const id = params.id as string;
  const category = categories.find((c) => c.id === id);

  const getItems = () => {
    switch (id) {
      case "agricultural-products": return agriculturalProducts.map(p => ({ id: p.id, title: p.name, subtitle: p.nameEn, price: `₹${p.price.toLocaleString()}/${p.unit}`, location: p.location, icon: "🌾" }));
      case "livestock": return livestock.map(p => ({ id: p.id, title: p.name, subtitle: `${p.breed} | ${p.age}`, price: `₹${p.price.toLocaleString()}`, location: p.location, icon: "🐄" }));
      case "farm-equipment": return farmEquipment.map(p => ({ id: p.id, title: p.name, subtitle: p.condition, price: `₹${p.price.toLocaleString()}`, location: p.location, icon: "🚜" }));
      case "tractor-rental": return tractors.map(p => ({ id: p.id, title: p.name, subtitle: p.hp, price: p.rate, location: p.location, icon: "🚜" }));
      case "vehicle-rental": return vehicles.map(p => ({ id: p.id, title: p.name, subtitle: p.nameEn, price: p.rate, location: p.location, icon: "🚗" }));
      case "labor": return laborers.map(p => ({ id: p.id, title: p.name, subtitle: p.skill, price: p.wage, location: p.location, icon: "👨‍🌾" }));
      case "land": return lands.map(p => ({ id: p.id, title: `${p.area} - ${p.village}`, subtitle: p.district, price: `₹${p.price.toLocaleString()}`, location: p.village, icon: "🏞️" }));
      case "services": return services.map(p => ({ id: p.id, title: p.name, subtitle: p.provider, price: p.rate, location: p.location, icon: "🔧" }));
      default: return [];
    }
  };

  const items = getItems();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{category?.name}</h1>
            <p className="text-sm text-gray-500">{category?.nameEn} • {items.length} ಜಾಹೀರಾತುಗಳು</p>
          </div>
          <Link href={`/category/${id}/create`}>
            <Button className="bg-primary">
              <Plus size={16} className="mr-2" /> ಹೊಸ ಜಾಹೀರಾತು
            </Button>
          </Link>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/category/${id}/${item.id}`}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-4xl shrink-0 group-hover:bg-primary/5 transition-colors">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                    </div>
                    <button className="text-gray-300 hover:text-red-400 transition-colors" onClick={(e) => e.preventDefault()}>
                      <Heart size={18} />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-primary mt-2">{item.price}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <MapPin size={12} />
                    <span>{item.location}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
