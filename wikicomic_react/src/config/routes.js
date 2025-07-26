// Route configuration for the application
// All routes are now centralized and environment-based

// API Base URL from environment variable
// export const API_BASE_URL = process.env.REACT_APP_API_URL;

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

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
  if (!image) return '/placeholder-comic.png';
  if (image.startsWith('http')) return image;
  // Encode spaces and special characters
  return `${API_BASE_URL}${encodeURI(image)}`;
}; 