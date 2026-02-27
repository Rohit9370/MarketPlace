// Default placeholder images for the app

export const DefaultImages = {
  // User/Profile placeholders
  userAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
  
  // Shop/Business placeholders
  shopLogo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop',
  shopBanner: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&h=400&fit=crop',
  
  // Service category placeholders
  plumbing: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop',
  electrician: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop',
  carpenter: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop',
  painter: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop',
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
  pestControl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop',
  applianceRepair: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
  homeSalon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
  gardening: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
  carWash: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop',
  
  // General service placeholder
  defaultService: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop',
  
  // Empty states
  noImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
  emptyState: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&h=600&fit=crop',
};

// Helper function to get default image based on category
export const getDefaultImageByCategory = (category) => {
  const categoryMap = {
    'Plumbing': DefaultImages.plumbing,
    'Electrician': DefaultImages.electrician,
    'Carpenter': DefaultImages.carpenter,
    'Painter': DefaultImages.painter,
    'Cleaning': DefaultImages.cleaning,
    'Pest Control': DefaultImages.pestControl,
    'Appliance Repair': DefaultImages.applianceRepair,
    'Home Salon': DefaultImages.homeSalon,
    'Gardening': DefaultImages.gardening,
    'Car Wash': DefaultImages.carWash,
  };
  
  return categoryMap[category] || DefaultImages.defaultService;
};

// Helper function to get image with fallback
export const getImageWithFallback = (imageUrl, fallbackType = 'userAvatar') => {
  if (imageUrl && imageUrl.trim() !== '' && !imageUrl.includes('placeholder')) {
    return imageUrl;
  }
  return DefaultImages[fallbackType] || DefaultImages.noImage;
};

export default DefaultImages;
