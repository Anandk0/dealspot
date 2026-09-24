export interface CategoryItem {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  gradient?: string;
  image?: string;
  parentId?: string;
}

// ── Top-level categories (fallback if API is unavailable) ──────────
// Subcategories are loaded dynamically from the API
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
    nameEn: 'Livestock',
    icon: '🐄',
    color: 'bg-amber-100',
    gradient: 'from-amber-500 to-yellow-400',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'pets',
    name: 'ಸಾಕು ಪ್ರಾಣಿಗಳು',
    nameEn: 'Pets',
    icon: '🐕',
    color: 'bg-pink-100',
    gradient: 'from-pink-500 to-rose-400',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'vehicle-rent',
    name: 'ಬಾಡಿಗೆ ವಾಹನ',
    nameEn: 'Vehicle for Rent',
    icon: '🚗',
    color: 'bg-orange-100',
    gradient: 'from-orange-500 to-amber-400',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'services',
    name: 'ಇತರ ಸೇವೆಗಳು',
    nameEn: 'Other Services',
    icon: '🔧',
    color: 'bg-red-100',
    gradient: 'from-rose-500 to-red-400',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80',
  },
];

export const topLevelCategories = categories.filter((c) => !c.parentId);

export function getSubcategories(parentId: string): CategoryItem[] {
  return categories.filter((c) => c.parentId === parentId);
}

export function getCategoryIcon(catId?: string): string {
  if (!catId) return '📦';
  const found = categories.find((c) => c.id === catId);
  if (found) return found.icon;
  const legacyMap: Record<string, string> = {
    'property': '🏠',
    'property-sales': '🏠',
    'property-sales-house': '🏠',
    'property-sales-plots': '📐',
    'property-sales-agri-land': '🌾',
    'property-sales-shop': '🏪',
    'property-rent': '🏢',
    'property-rent-house': '🏠',
    'property-rent-shop': '🏪',
    'property-rent-pg': '🛏️',
    'agriculture-equipment': '🚜',
    'agri-tractor': '🚜',
    'agri-rotavator': '⚙️',
    'agri-cultivator': '🌱',
    'agri-seeder': '🌾',
    'agri-sprayer': '💧',
    'agri-trailer': '🚛',
    'agri-water-pump': '🚰',
    'danakarugalu': '🐄',
    'livestock-dairy': '🥛',
    'livestock-sheep': '🐑',
    'livestock-goat': '🐐',
    'livestock-buffalo': '🐃',
    'livestock-cow': '🐄',
    'livestock-bull': '🐂',
    'pets': '🐕',
    'pets-dog': '🐕',
    'pets-cat': '🐈',
    'vehicle-rent': '🚗',
    'vehicle-rent-car': '🚗',
    'vehicle-rent-auto': '🛺',
    'vehicle-rent-tempo': '🚐',
    'vehicle-rent-mini-truck': '🚚',
    'services': '🔧',
    'services-electrician': '⚡',
    'services-plumber': '🔧',
    'services-carpenter': '🪚',
    'services-painter': '🎨',
    'services-cctv': '📷',
    'agents': '🤝',
    'agent': '🤝',
    'agricultural-products': '🌾',
    'livestock': '🐄',
    'farm-equipment': '🚜',
    'tractor-rental': '🚜',
    'vehicle-rental': '🚗',
    'labor': '👨‍🌾',
    'land': '🏞️',
    'animals-pets': '🐕',
  };
  return legacyMap[catId] || '📦';
}

export default categories;
