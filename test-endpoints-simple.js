console.log('Testing analytics endpoint...');

// Simple HTTP test
const http = require('http');

function testEndpoint(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3002${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`✅ ${path} - Status: ${res.statusCode}`);
                    console.log('📊 Response:', JSON.stringify(json, null, 2));
                    resolve(json);
                } catch (error) {
                    console.log(`✅ ${path} - Status: ${res.statusCode}`);
                    console.log('📄 Raw response:', data);
                    resolve({ raw: data, status: res.statusCode });
                }
            });
        });
        
        req.on('error', err => {
            console.log(`❌ ${path} - Error:`, err.message);
            reject(err);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function runTest() {
    console.log('🚀 Starting endpoint tests...\n');
    
    try {
        await testEndpoint('/api/v1/analytics/health');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await testEndpoint('/api/v1/statistics/dashboard');
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
    
    console.log('\n✅ Tests completed');
}

runTest();
