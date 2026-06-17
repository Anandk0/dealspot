"use client";
import { Mic, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { categories, banners } from "@/lib/mock-data";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Banner Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              className={`bg-gradient-to-r ${banner.color} rounded-2xl p-6 text-white transition-all duration-500 ${
                i === currentBanner ? "ring-2 ring-offset-2 ring-primary/50 scale-[1.02]" : ""
              }`}
            >
              <h3 className="text-lg font-bold">{banner.title}</h3>
              <p className="text-sm text-white/80 mt-1">{banner.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              ವಿಭಾಗಗಳು (Categories)
            </h2>
            <span className="text-sm text-primary cursor-pointer hover:underline">ಎಲ್ಲಾ ನೋಡಿ →</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className={`flex items-center gap-4 p-4 rounded-xl ${cat.color} border border-transparent hover:border-primary/30 hover:shadow-md transition-all group`}
              >
                <div className="text-3xl">{cat.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-500">{cat.nameEn}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Listings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              <TrendingUp size={18} className="inline mr-2 text-primary" />
              ಇತ್ತೀಚಿನ ಜಾಹೀರಾತುಗಳು (Recent Listings)
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "ರಾಗಿ 50 ಕ್ವಿಂಟಾಲ್", price: "₹2,800/ಕ್ವಿ", loc: "ಮಂಡ್ಯ", icon: "🌾", cat: "agricultural-products", id: "1" },
              { title: "ಜರ್ಸಿ ಹಸು", price: "₹65,000", loc: "ಹಾಸನ", icon: "🐄", cat: "livestock", id: "1" },
              { title: "ರೋಟವೇಟರ್", price: "₹1,25,000", loc: "ಮೈಸೂರು", icon: "🚜", cat: "farm-equipment", id: "1" },
              { title: "5 ಎಕರೆ ಭೂಮಿ", price: "₹25,00,000", loc: "ಮಂಡ್ಯ", icon: "🏞️", cat: "land", id: "1" },
              { title: "John Deere 5310", price: "₹800/ಗಂಟೆ", loc: "ಮಂಡ್ಯ", icon: "🚜", cat: "tractor-rental", id: "1" },
              { title: "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್", price: "₹300/ಗಂಟೆ", loc: "ಮಂಡ್ಯ", icon: "🔧", cat: "services", id: "1" },
              { title: "ಆಟೋ ಬಾಡಿಗೆ", price: "₹15/ಕಿಮೀ", loc: "ಮಂಡ್ಯ", icon: "🚗", cat: "vehicle-rental", id: "1" },
              { title: "ಕೂಲಿ ಕಾರ್ಮಿಕ", price: "₹500/ದಿನ", loc: "ಮಂಡ್ಯ", icon: "👨‍🌾", cat: "labor", id: "1" },
            ].map((item, i) => (
              <Link
                key={i}
                href={`/category/${item.cat}/${item.id}`}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-4xl group-hover:bg-primary/5 transition-colors">
                  {item.icon}
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                <p className="text-base font-bold text-primary mt-1">{item.price}</p>
                <p className="text-xs text-gray-500 mt-0.5">📍 {item.loc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
