// Route configuration for the application
// All routes are now centralized and environment-based

// API Base URL from environment variable with fallback
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

// Debug logging
console.log('Environment REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);
console.log('Comics endpoint:', `${API_BASE_URL}/comics`);

// API Endpoints
export const API_ENDPOINTS = {
  SEARCH: `${API_BASE_URL}/search`,
  SUGGEST: `${API_BASE_URL}/suggest`,
  COMICS: `${API_BASE_URL}/comics`,
};

// Frontend Routes
export const ROUTES = {
  HOME: '/',
  GALLERY: '/gallery',
  COMIC: (id) => `/comic/${encodeURIComponent(id)}`,
};

// Helper function to get image URL
export const getImageUrl = (image) => {
  console.log('getImageUrl called with:', image);
  
  if (!image) {
    console.log('No image provided, returning placeholder');
    return '/placeholder-comic.png';
  }
  
  // Handle MongoDB format: { url: "/api/images/...", id: "...", ... }
  if (typeof image === 'object' && image.url) {
    const fullUrl = `${API_BASE_URL}${image.url}`;
    console.log('MongoDB format detected (url property), returning:', fullUrl);
    return fullUrl;
  }
  
  // Handle MongoDB scene format: { image_url: "/api/images/...", ... }
  if (typeof image === 'object' && image.image_url) {
    const fullUrl = `${API_BASE_URL}${image.image_url}`;
    console.log('MongoDB scene format detected (image_url property), returning:', fullUrl);
    return fullUrl;
  }
  
  // Handle string URLs
  if (typeof image === 'string') {
    if (image.startsWith('http')) {
      console.log('Full URL detected, returning:', image);
      return image;
    }
    // Encode spaces and special characters
    const fullUrl = `${API_BASE_URL}${encodeURI(image)}`;
    console.log('String URL detected, returning:', fullUrl);
    return fullUrl;
  }
  
  // Fallback
  console.log('Fallback case, returning placeholder');
  return '/placeholder-comic.png';
}; 