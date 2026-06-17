export const categories = [
  { id: 'agricultural-products', name: 'ಕೃಷಿ ಉತ್ಪನ್ನಗಳು', nameEn: 'Agricultural Products', icon: '🌾', color: 'bg-amber-100' },
  { id: 'livestock', name: 'ಜಾನುವಾರು', nameEn: 'Livestock', icon: '🐄', color: 'bg-green-100' },
  { id: 'farm-equipment', name: 'ಕೃಷಿ ಉಪಕರಣ', nameEn: 'Farm Equipment', icon: '🚜', color: 'bg-blue-100' },
  { id: 'tractor-rental', name: 'ಟ್ರ್ಯಾಕ್ಟರ್ ಬಾಡಿಗೆ', nameEn: 'Tractor Rental', icon: '🚜', color: 'bg-orange-100' },
  { id: 'vehicle-rental', name: 'ವಾಹನ ಬಾಡಿಗೆ', nameEn: 'Vehicle Rental', icon: '🚗', color: 'bg-purple-100' },
  { id: 'labor', name: 'ಕೂಲಿ ಮಾರುಕಟ್ಟೆ', nameEn: 'Labor Marketplace', icon: '👨‍🌾', color: 'bg-teal-100' },
  { id: 'land', name: 'ಕೃಷಿ ಭೂಮಿ', nameEn: 'Agricultural Land', icon: '🏞️', color: 'bg-emerald-100' },
  { id: 'services', name: 'ಸ್ಥಳೀಯ ಸೇವೆಗಳು', nameEn: 'Local Services', icon: '🔧', color: 'bg-red-100' },
];

export const agriculturalProducts = [
  { id: '1', name: 'ರಾಗಿ', nameEn: 'Ragi', price: 2800, unit: 'ಕ್ವಿಂಟಾಲ್', location: 'ಮಂಡ್ಯ', image: '/placeholder.jpg', seller: 'ರಾಮಣ್ಣ', quantity: '50 ಕ್ವಿಂಟಾಲ್' },
  { id: '2', name: 'ಅಕ್ಕಿ', nameEn: 'Rice', price: 3500, unit: 'ಕ್ವಿಂಟಾಲ್', location: 'ರಾಯಚೂರು', image: '/placeholder.jpg', seller: 'ಕೃಷ್ಣಪ್ಪ', quantity: '100 ಕ್ವಿಂಟಾಲ್' },
  { id: '3', name: 'ಮೆಕ್ಕೆ ಜೋಳ', nameEn: 'Maize', price: 2200, unit: 'ಕ್ವಿಂಟಾಲ್', location: 'ದಾವಣಗೆರೆ', image: '/placeholder.jpg', seller: 'ಮಹೇಶ್', quantity: '30 ಕ್ವಿಂಟಾಲ್' },
  { id: '4', name: 'ಕಬ್ಬು', nameEn: 'Sugarcane', price: 3200, unit: 'ಟನ್', location: 'ಬೆಳಗಾವಿ', image: '/placeholder.jpg', seller: 'ಬಸವರಾಜ', quantity: '20 ಟನ್' },
  { id: '5', name: 'ತರಕಾರಿ', nameEn: 'Vegetables', price: 40, unit: 'ಕೆಜಿ', location: 'ಕೋಲಾರ', image: '/placeholder.jpg', seller: 'ಲಕ್ಷ್ಮಿ', quantity: '500 ಕೆಜಿ' },
  { id: '6', name: 'ಟೊಮ್ಯಾಟೋ', nameEn: 'Tomato', price: 25, unit: 'ಕೆಜಿ', location: 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ', image: '/placeholder.jpg', seller: 'ವೆಂಕಟೇಶ್', quantity: '200 ಕೆಜಿ' },
];

export const livestock = [
  { id: '1', name: 'ಹಸು', nameEn: 'Cow', breed: 'ಜರ್ಸಿ', age: '4 ವರ್ಷ', price: 65000, location: 'ಹಾಸನ', image: '/placeholder.jpg', seller: 'ನಾಗೇಶ', description: 'ಉತ್ತಮ ಹಾಲು ಕೊಡುವ ಹಸು, ದಿನಕ್ಕೆ 12 ಲೀಟರ್' },
  { id: '2', name: 'ಎಮ್ಮೆ', nameEn: 'Buffalo', breed: 'ಮುರ್ರಾ', age: '5 ವರ್ಷ', price: 85000, location: 'ಶಿಮೋಗ', image: '/placeholder.jpg', seller: 'ಸಿದ್ದಪ್ಪ', description: 'ಆರೋಗ್ಯವಾದ ಮುರ್ರಾ ಎಮ್ಮೆ' },
  { id: '3', name: 'ಮೇಕೆ', nameEn: 'Goat', breed: 'ಜಮನಾಪರಿ', age: '2 ವರ್ಷ', price: 15000, location: 'ತುಮಕೂರು', image: '/placeholder.jpg', seller: 'ಹನುಮಂತ', description: '3 ಮೇಕೆಗಳು ಮಾರಾಟಕ್ಕೆ' },
  { id: '4', name: 'ಕುರಿ', nameEn: 'Sheep', breed: 'ಬಂಡೂರ್', age: '1.5 ವರ್ಷ', price: 12000, location: 'ಬಳ್ಳಾರಿ', image: '/placeholder.jpg', seller: 'ಮಲ್ಲೇಶ', description: 'ಆರೋಗ್ಯವಾದ ಕುರಿ' },
];

export const farmEquipment = [
  { id: '1', name: 'ರೋಟವೇಟರ್', nameEn: 'Rotavator', price: 125000, condition: 'ಹೊಸದು', location: 'ಮೈಸೂರು', image: '/placeholder.jpg', seller: 'ಕೃಷಿ ಟ್ರೇಡರ್ಸ್' },
  { id: '2', name: 'ಕಲ್ಟಿವೇಟರ್', nameEn: 'Cultivator', price: 45000, condition: 'ಬಳಸಿದ', location: 'ಹುಬ್ಬಳ್ಳಿ', image: '/placeholder.jpg', seller: 'ಮಹೇಂದ್ರ ಅಗ್ರಿ' },
  { id: '3', name: 'ಸ್ಪ್ರೇಯರ್', nameEn: 'Sprayer', price: 8500, condition: 'ಹೊಸದು', location: 'ಧಾರವಾಡ', image: '/placeholder.jpg', seller: 'ಅಗ್ರಿ ಸ್ಟೋರ್' },
  { id: '4', name: 'ವಾಟರ್ ಪಂಪ್', nameEn: 'Water Pump', price: 15000, condition: 'ಹೊಸದು', location: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', image: '/placeholder.jpg', seller: 'ಪಂಪ್ ವರ್ಲ್ಡ್' },
];

export const tractors = [
  { id: '1', name: 'John Deere 5310', hp: '55 HP', rate: '₹800/ಗಂಟೆ', location: 'ಮಂಡ್ಯ', image: '/placeholder.jpg', owner: 'ರವಿ' },
  { id: '2', name: 'Mahindra 575 DI', hp: '45 HP', rate: '₹700/ಗಂಟೆ', location: 'ಮೈಸೂರು', image: '/placeholder.jpg', owner: 'ಕುಮಾರ್' },
  { id: '3', name: 'Sonalika DI 750', hp: '50 HP', rate: '₹750/ಗಂಟೆ', location: 'ತುಮಕೂರು', image: '/placeholder.jpg', owner: 'ಶಿವಣ್ಣ' },
  { id: '4', name: 'Mahindra 265 DI', hp: '35 HP', rate: '₹600/ಗಂಟೆ', location: 'ಹಾಸನ', image: '/placeholder.jpg', owner: 'ಗಿರೀಶ' },
];

export const vehicles = [
  { id: '1', name: 'ಆಟೋ', nameEn: 'Auto', rate: '₹15/ಕಿಮೀ', location: 'ಮಂಡ್ಯ', image: '/placeholder.jpg', owner: 'ಸುರೇಶ', type: 'Auto' },
  { id: '2', name: 'ಕಾರು', nameEn: 'Car', rate: '₹12/ಕಿಮೀ', location: 'ಮೈಸೂರು', image: '/placeholder.jpg', owner: 'ಪ್ರಕಾಶ', type: 'Car' },
  { id: '3', name: 'ಟೆಂಪೋ', nameEn: 'Tempo', rate: '₹20/ಕಿಮೀ', location: 'ಬೆಂಗಳೂರು', image: '/placeholder.jpg', owner: 'ಮಂಜುನಾಥ', type: 'Tempo' },
  { id: '4', name: 'ಮಿನಿ ಟ್ರಕ್', nameEn: 'Mini Truck', rate: '₹25/ಕಿಮೀ', location: 'ದಾವಣಗೆರೆ', image: '/placeholder.jpg', owner: 'ಚಂದ್ರಶೇಖರ', type: 'Mini Truck' },
];

export const laborers = [
  { id: '1', name: 'ರಾಜು', nameEn: 'Raju', age: 35, experience: '10 ವರ್ಷ', wage: '₹500/ದಿನ', skill: 'ಕೃಷಿ ಕೆಲಸ', location: 'ಮಂಡ್ಯ', image: '/placeholder.jpg' },
  { id: '2', name: 'ಮಾರಿ', nameEn: 'Mari', age: 28, experience: '5 ವರ್ಷ', wage: '₹450/ದಿನ', skill: 'ನಾಟಿ ಕೆಲಸ', location: 'ಮೈಸೂರು', image: '/placeholder.jpg' },
  { id: '3', name: 'ಲಕ್ಷ್ಮಮ್ಮ', nameEn: 'Lakshmamma', age: 40, experience: '15 ವರ್ಷ', wage: '₹400/ದಿನ', skill: 'ಕಳೆ ಕೀಳುವುದು', location: 'ಚಾಮರಾಜನಗರ', image: '/placeholder.jpg' },
  { id: '4', name: 'ಸಿದ್ದು', nameEn: 'Siddu', age: 25, experience: '3 ವರ್ಷ', wage: '₹550/ದಿನ', skill: 'ಟ್ರ್ಯಾಕ್ಟರ್ ಚಾಲನೆ', location: 'ತುಮಕೂರು', image: '/placeholder.jpg' },
];

export const lands = [
  { id: '1', area: '5 ಎಕರೆ', price: 2500000, village: 'ಕೆ.ಆರ್.ಪೇಟೆ', district: 'ಮಂಡ್ಯ', image: '/placeholder.jpg', description: 'ನೀರಾವರಿ ಭೂಮಿ, ಕಾಲುವೆ ನೀರು ಲಭ್ಯ', seller: 'ಶಂಕರಪ್ಪ' },
  { id: '2', area: '3 ಎಕರೆ', price: 1800000, village: 'ಹೊಳೆನರಸೀಪುರ', district: 'ಹಾಸನ', image: '/placeholder.jpg', description: 'ತೋಟದ ಭೂಮಿ, ಬೋರ್‌ವೆಲ್ ಇದೆ', seller: 'ಚನ್ನಬಸಪ್ಪ' },
  { id: '3', area: '10 ಎಕರೆ', price: 5000000, village: 'ನಂಜನಗೂಡು', district: 'ಮೈಸೂರು', image: '/placeholder.jpg', description: 'ಒಣ ಭೂಮಿ, ರಸ್ತೆ ಪಕ್ಕದಲ್ಲಿ', seller: 'ಮಹಾದೇವಪ್ಪ' },
  { id: '4', area: '2 ಎಕರೆ', price: 3200000, village: 'ಚನ್ನಪಟ್ಟಣ', district: 'ರಾಮನಗರ', image: '/placeholder.jpg', description: 'ಬೆಂಗಳೂರಿಗೆ ಹತ್ತಿರ, ವಾಣಿಜ್ಯ ಬಳಕೆಗೆ', seller: 'ಪ್ರಕಾಶ' },
];

export const services = [
  { id: '1', name: 'ಎಲೆಕ್ಟ್ರಿಷಿಯನ್', nameEn: 'Electrician', provider: 'ಮಂಜುನಾಥ', rate: '₹300/ಗಂಟೆ', location: 'ಮಂಡ್ಯ', rating: 4.5, image: '/placeholder.jpg' },
  { id: '2', name: 'ಪ್ಲಂಬರ್', nameEn: 'Plumber', provider: 'ರಮೇಶ', rate: '₹350/ಗಂಟೆ', location: 'ಮೈಸೂರು', rating: 4.2, image: '/placeholder.jpg' },
  { id: '3', name: 'ಕಾರ್ಪೆಂಟರ್', nameEn: 'Carpenter', provider: 'ಸಿದ್ದಣ್ಣ', rate: '₹500/ದಿನ', location: 'ಹಾಸನ', rating: 4.8, image: '/placeholder.jpg' },
  { id: '4', name: 'ಪೇಂಟರ್', nameEn: 'Painter', provider: 'ಅನಿಲ್', rate: '₹400/ದಿನ', location: 'ತುಮಕೂರು', rating: 4.0, image: '/placeholder.jpg' },
  { id: '5', name: 'ಮೇಸನ್', nameEn: 'Mason', provider: 'ಕಾಳಪ್ಪ', rate: '₹600/ದಿನ', location: 'ಬೆಂಗಳೂರು', rating: 4.6, image: '/placeholder.jpg' },
  { id: '6', name: 'CCTV ರಿಪೇರಿ', nameEn: 'CCTV Repair', provider: 'ಟೆಕ್ ಸರ್ವೀಸ್', rate: '₹500/ವಿಸಿಟ್', location: 'ಮಂಡ್ಯ', rating: 4.3, image: '/placeholder.jpg' },
];

export const notifications = [
  { id: '1', title: 'ಹೊಸ ಆಫರ್!', message: 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಹೊಸ ಟ್ರ್ಯಾಕ್ಟರ್ ಬಾಡಿಗೆ ಲಭ್ಯ', time: '2 ಗಂಟೆ ಹಿಂದೆ', read: false },
  { id: '2', title: 'ಲಿಸ್ಟಿಂಗ್ ಅನುಮೋದನೆ', message: 'ನಿಮ್ಮ ರಾಗಿ ಲಿಸ್ಟಿಂಗ್ ಅನುಮೋದಿಸಲಾಗಿದೆ', time: '5 ಗಂಟೆ ಹಿಂದೆ', read: false },
  { id: '3', title: 'ಕಾಂಟ್ಯಾಕ್ಟ್ ಅನ್‌ಲಾಕ್', message: 'ಯಾರೋ ನಿಮ್ಮ ಕಾಂಟ್ಯಾಕ್ಟ್ ನೋಡಿದ್ದಾರೆ', time: '1 ದಿನ ಹಿಂದೆ', read: true },
  { id: '4', title: 'ಬೆಲೆ ಕಡಿತ', message: 'ಮೈಸೂರಿನಲ್ಲಿ ಅಕ್ಕಿ ಬೆಲೆ ₹200 ಕಡಿಮೆಯಾಗಿದೆ', time: '2 ದಿನ ಹಿಂದೆ', read: true },
];

export const banners = [
  { id: '1', title: 'ಉಚಿತ ಲಿಸ್ಟಿಂಗ್!', subtitle: 'ಮೊದಲ 3 ಜಾಹೀರಾತು ಉಚಿತ', color: 'from-green-500 to-green-700' },
  { id: '2', title: 'ಟ್ರ್ಯಾಕ್ಟರ್ ಮೇಲೆ 20% ರಿಯಾಯಿತಿ', subtitle: 'ಈ ವಾರ ಮಾತ್ರ', color: 'from-orange-500 to-orange-700' },
  { id: '3', title: 'ಕೂಲಿ ಕಾರ್ಮಿಕರು ಲಭ್ಯ', subtitle: 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ 50+ ಕಾರ್ಮಿಕರು', color: 'from-blue-500 to-blue-700' },
];
