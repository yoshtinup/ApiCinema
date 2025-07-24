// Quick test for analytics endpoint
console.log('Testing analytics endpoint...');

fetch('http://localhost:3002/api/v1/analytics/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Analytics Health Response:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.log('❌ Analytics Health Error:', error.message);
  });

fetch('http://localhost:3002/api/v1/statistics/dashboard')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Dashboard Response:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.log('❌ Dashboard Error:', error.message);
  });
