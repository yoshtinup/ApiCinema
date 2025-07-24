// test-analytics-endpoints.js - Test script for analytics endpoints
import fetch from 'node-fetch';
import signale from 'signale';

const baseUrl = 'http://localhost:3002/api/v1/analytics';

async function testEndpoint(endpoint, params = {}) {
  try {
    // Build query string
    const queryString = Object.keys(params).length > 0 
      ? '?' + Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
      : '';
    
    const url = `${baseUrl}/${endpoint}${queryString}`;
    signale.info(`Testing endpoint: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    signale.success(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
    
    return { success: true, data };
  } catch (error) {
    signale.error(`Error testing endpoint ${endpoint}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  signale.info('Starting analytics endpoint tests...');
  
  // Test dashboard endpoint with different periods
  await testEndpoint('dashboard', { period: 'today' });
  await testEndpoint('dashboard', { period: 'week' });
  await testEndpoint('dashboard', { period: 'month' });
  await testEndpoint('dashboard', { period: 'year' });
  
  // Test probability analysis endpoint
  await testEndpoint('probability', { period: 'month', metric: 'sales' });
  await testEndpoint('probability', { period: 'month', metric: 'orders' });
  
  // Test product performance if implemented
  // await testEndpoint('products/1', { period: 'month' });
  
  signale.complete('All tests completed');
}

// Run all tests
runTests();
