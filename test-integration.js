#!/usr/bin/env node

/**
 * Script de prueba para validar la integración del módulo Statistical Analytics
 * Ejecutar con: node test-integration.js
 */

import axios from 'axios';
import chalk from 'chalk';

const API_BASE_URL = 'http://localhost:3002';

console.log(chalk.blue.bold('\n🧪 TESTING APICINEMA STATISTICAL ANALYTICS INTEGRATION\n'));

// Tests a ejecutar
const tests = [
  {
    name: 'Health Check - Servidor Principal',
    url: `${API_BASE_URL}`,
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Dashboard Overview - Endpoint Principal',
    url: `${API_BASE_URL}/api/v1/dashboard/overview`,
    method: 'GET',
    expectedStatus: 200,
    validateResponse: (data) => {
      return data.success && 
             data.data && 
             data.data.kpis && 
             data.data.charts;
    }
  },
  {
    name: 'Estadísticas Descriptivas',
    url: `${API_BASE_URL}/api/v1/statistics/descriptive`,
    method: 'GET',
    expectedStatus: 200,
    validateResponse: (data) => {
      return data.success && 
             data.data && 
             data.data.amountStats;
    }
  },
  {
    name: 'Distribuciones de Probabilidad',
    url: `${API_BASE_URL}/api/v1/statistics/probability`,
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Business Insights',
    url: `${API_BASE_URL}/api/v1/statistics/business-insights`,
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Dashboard con Filtros',
    url: `${API_BASE_URL}/api/v1/dashboard/overview?period=week`,
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Estadísticas con Rango de Fechas',
    url: `${API_BASE_URL}/api/v1/statistics/descriptive?startDate=2024-01-01&endDate=2024-01-31&limit=100`,
    method: 'GET',
    expectedStatus: 200
  }
];

async function runTest(test) {
  try {
    console.log(chalk.yellow(`⏳ Testing: ${test.name}`));
    
    const response = await axios({
      method: test.method,
      url: test.url,
      timeout: 10000
    });

    // Verificar status code
    if (response.status !== test.expectedStatus) {
      throw new Error(`Expected status ${test.expectedStatus}, got ${response.status}`);
    }

    // Verificar respuesta si hay validador
    if (test.validateResponse && !test.validateResponse(response.data)) {
      throw new Error('Response validation failed');
    }

    console.log(chalk.green(`✅ PASSED: ${test.name}`));
    
    // Mostrar datos de muestra si es el endpoint principal
    if (test.name.includes('Dashboard Overview')) {
      const data = response.data.data;
      console.log(chalk.cyan(`   📊 Sample Data:`));
      console.log(chalk.cyan(`   - Total Orders: ${data.kpis?.totalOrders || 'N/A'}`));
      console.log(chalk.cyan(`   - Revenue: $${data.kpis?.totalRevenue || 'N/A'}`));
      console.log(chalk.cyan(`   - AOV: $${data.kpis?.averageOrderValue || 'N/A'}`));
      console.log(chalk.cyan(`   - Charts Available: ${Object.keys(data.charts || {}).length}`));
    }

    return { success: true, test: test.name };
  } catch (error) {
    console.log(chalk.red(`❌ FAILED: ${test.name}`));
    console.log(chalk.red(`   Error: ${error.message}`));
    
    if (error.code === 'ECONNREFUSED') {
      console.log(chalk.red(`   💡 Server might not be running on ${API_BASE_URL}`));
    }
    
    return { success: false, test: test.name, error: error.message };
  }
}

async function runAllTests() {
  console.log(chalk.blue(`🔍 Running ${tests.length} integration tests...\n`));
  
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
    console.log(''); // Línea en blanco
  }

  // Resumen de resultados
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(chalk.blue.bold('\n📋 TEST RESULTS SUMMARY\n'));
  console.log(chalk.green(`✅ Passed: ${passed}/${tests.length}`));
  console.log(chalk.red(`❌ Failed: ${failed}/${tests.length}`));

  if (failed > 0) {
    console.log(chalk.red('\n🚨 Failed Tests:'));
    results.filter(r => !r.success).forEach(result => {
      console.log(chalk.red(`   - ${result.test}: ${result.error}`));
    });
  }

  // Status final
  if (failed === 0) {
    console.log(chalk.green.bold('\n🎉 ALL TESTS PASSED! Integration is working correctly.'));
    console.log(chalk.green('\n✨ Your Statistical Analytics API is ready for frontend integration!'));
    console.log(chalk.cyan('\n📊 Main endpoint for frontend: ') + chalk.white(`${API_BASE_URL}/api/v1/dashboard/overview`));
  } else {
    console.log(chalk.red.bold('\n⚠️  SOME TESTS FAILED. Please check your server and database connection.'));
  }

  // Instrucciones para el desarrollador
  console.log(chalk.blue.bold('\n📋 NEXT STEPS FOR FRONTEND INTEGRATION:\n'));
  console.log(chalk.white('1. ') + chalk.cyan('Ensure your server is running: ') + chalk.white('npm start or node server.js'));
  console.log(chalk.white('2. ') + chalk.cyan('Test main endpoint: ') + chalk.white(`curl ${API_BASE_URL}/api/v1/dashboard/overview`));
  console.log(chalk.white('3. ') + chalk.cyan('Use the provided frontend prompt: ') + chalk.white('frontend-agent-prompt.md'));
  console.log(chalk.white('4. ') + chalk.cyan('Check integration guide: ') + chalk.white('STATISTICAL_ANALYTICS_INTEGRATION.md'));

  return failed === 0;
}

// Ejecutar tests si el script se ejecuta directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(chalk.red('Unexpected error:', error));
      process.exit(1);
    });
}

export { runAllTests, runTest };
