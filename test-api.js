// Simple test script to verify the API is working
const API_URL = 'https://speech-to-text-apps.onrender.com';

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    console.log('API Response:', data);
    console.log('✅ Backend API is working!');
  })
  .catch(error => {
    console.error('❌ API Error:', error);
  });
