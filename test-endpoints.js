import http from 'http';

function testEndpoint(path, description) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testing ${description}...`);
        console.log(`📡 GET http://localhost:3002${path}`);
        
        const req = http.get(`http://localhost:3002${path}`, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`✅ Status: ${res.statusCode}`);
                    console.log(`📊 Response:`, JSON.stringify(jsonData, null, 2));
                    resolve({ success: true, status: res.statusCode, data: jsonData });
                } catch (error) {
                    console.log(`✅ Status: ${res.statusCode}`);
                    console.log(`📄 Response:`, data);
                    resolve({ success: true, status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ Error:`, error.message);
            resolve({ success: false, error: error.message });
        });
        
        req.setTimeout(10000, () => {
            console.log(`⏰ Request timeout`);
            req.destroy();
            resolve({ success: false, error: 'Timeout' });
        });
    });
}

async function runTests() {
    console.log('🚀 Starting API endpoints test...\n');
    
    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const tests = [
        { path: '/api/v1/analytics/health', description: 'Analytics Health Check' },
        { path: '/api/v1/statistics/dashboard', description: 'Statistical Dashboard' },
        { path: '/api/v1/analytics/top-products', description: 'Top Products Analytics' }
    ];
    
    for (const test of tests) {
        await testEndpoint(test.path, test.description);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between requests
    }
    
    console.log('\n✅ Tests completed!');
    process.exit(0);
}

runTests().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
