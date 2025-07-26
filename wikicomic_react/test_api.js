// Simple test to verify API connection
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('Testing API connection...');
console.log('API_BASE_URL:', API_BASE_URL);

fetch(`${API_BASE_URL}/comics`)
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    return response.json();
  })
  .then(data => {
    console.log('Response data:', data);
    console.log('Data type:', typeof data);
    console.log('Data keys:', Object.keys(data || {}));
    console.log('Comics array exists:', !!data?.comics);
    console.log('Comics array length:', data?.comics?.length);
    
    if (data && data.comics) {
      console.log('✅ API is working correctly!');
      console.log('First comic:', data.comics[0]?.title);
    } else {
      console.log('❌ Invalid response format');
    }
  })
  .catch(error => {
    console.error('❌ API request failed:', error);
  }); 