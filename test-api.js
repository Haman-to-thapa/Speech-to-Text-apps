// Simple test script to verify the API is working
fetch('http://localhost:3001')
  .then(response => response.json())
  .then(data => {
    console.log('API Response:', data);
    console.log('✅ Backend API is working!');
  })
  .catch(error => {
    console.error('❌ API Error:', error);
  });
