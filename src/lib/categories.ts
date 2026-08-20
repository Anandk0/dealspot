export interface CategoryItem {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  gradient?: string;
  image?: string;
}

export const categories: CategoryItem[] = [
  {
    id: 'property-sales',
    name: 'ಆಸ್ತಿ ಮಾರಾಟ & ಖರೀದಿ',
    nameEn: 'Property Sales and Purchases',
    icon: '🏠',
    color: 'bg-blue-100',
    gradient: 'from-blue-500 to-cyan-400',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'property-rent',
    name: 'ಆಸ್ತಿ ಬಾಡಿಗೆ & ಲೀಸ್',
    nameEn: 'Property Rent and Lease',
    icon: '🏢',
    color: 'bg-sky-100',
    gradient: 'from-sky-500 to-blue-400',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'agriculture-equipment',
    name: 'ಕೃಷಿ ಉಪಕರಣ',
    nameEn: 'Agriculture Equipment',
    icon: '🚜',
    color: 'bg-green-100',
    gradient: 'from-green-500 to-emerald-400',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'agents',
    name: 'ಏಜೆಂಟರು',
    nameEn: 'Agents',
    icon: '🤝',
    color: 'bg-purple-100',
    gradient: 'from-purple-500 to-fuchsia-400',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'danakarugalu',
    name: 'ದನಕರುಗಳು',
    nameEn: 'Danakarugalu',
    icon: '🐄',
    color: 'bg-amber-100',
    gradient: 'from-amber-500 to-yellow-400',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'pets',
    name: 'ಸಾಕು ಪ್ರಾಣಿಗಳು & ಪೆಟ್ಸ್',
    nameEn: 'Pets',
    icon: '🐕',
    color: 'bg-pink-100',
    gradient: 'from-pink-500 to-rose-400',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'vehicle-rent',
    name: 'ಕಾರು & ಆಟೋ ಬಾಡಿಗೆ',
    nameEn: 'Car and Auto Rent',
    icon: '🚗',
    color: 'bg-orange-100',
    gradient: 'from-orange-500 to-amber-400',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'services',
    name: 'ಇತರ ಸೇವೆಗಳು',
    nameEn: 'Others Service',
    icon: '🔧',
    color: 'bg-red-100',
    gradient: 'from-rose-500 to-red-400',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80',
  },
];

export function getCategoryIcon(catId?: string): string {
  if (!catId) return '📦';
  const found = categories.find((c) => c.id === catId);
  if (found) return found.icon;
  const legacyMap: Record<string, string> = {
    'property': '🏠',
    'property-sales': '🏠',
    'property-rent': '🏢',
    'agricultural-products': '🌾',
    'livestock': '🐄',
    'farm-equipment': '🚜',
    'tractor-rental': '🚜',
    'vehicle-rental': '🚗',
    'vehicle-rent': '🚗',
    'labor': '👨‍🌾',
    'land': '🏞️',
    'agents': '🤝',
    'agent': '🤝',
    'danakarugalu': '🐄',
    'pets': '🐕',
    'animals-pets': '🐕',
    'services': '🔧',
  };
  return legacyMap[catId] || '📦';
}

export default categories;


