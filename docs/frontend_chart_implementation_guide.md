# Guía de Implementación Frontend para Gráficos Analytics

Esta guía explica cómo utilizar los datos devueltos por los endpoints de analytics para implementar gráficos en el frontend.

## Estructura Básica de la API

Los endpoints de analytics devuelven datos en un formato estandarizado especialmente diseñado para facilitar su visualización:

```javascript
// Ejemplo de respuesta de un endpoint de analytics
{
  "success": true,
  "period": "month",
  "generatedAt": "2025-07-24T14:30:00Z",
  // ...otros datos específicos del endpoint
  "visualization": {
    "charts": {
      "barChart": { ... },
      "lineChart": { ... },
      "pieChart": { ... },
      // ...otros tipos de gráficos
    }
  }
}
```

## Implementación con Chart.js

A continuación se muestra cómo implementar cada tipo de gráfico utilizando Chart.js:

### 1. Gráfico de Barras (Bar Chart)

```javascript
// Función para crear gráfico de barras a partir de los datos de la API
function createBarChart(chartData, containerId) {
  const ctx = document.getElementById(containerId).getContext('2d');
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets.map(dataset => ({
        label: dataset.name,
        data: dataset.data,
        backgroundColor: dataset.color,
        borderColor: dataset.color,
        borderWidth: 1
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: chartData.options?.yAxisTitle || ''
          }
        },
        x: {
          title: {
            display: true,
            text: chartData.options?.xAxisTitle || ''
          }
        }
      }
    }
  });
}

// Ejemplo de uso:
fetch('http://localhost:3002/api/v1/analytics/dashboard?period=month')
  .then(response => response.json())
  .then(data => {
    const barChartData = data.visualization.charts.barChart;
    createBarChart(barChartData, 'barChartContainer');
  });
```

### 2. Gráfico de Líneas (Line Chart)

```javascript
function createLineChart(chartData, containerId) {
  const ctx = document.getElementById(containerId).getContext('2d');
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets.map(dataset => ({
        label: dataset.name,
        data: dataset.data,
        borderColor: dataset.color,
        backgroundColor: `${dataset.color}33`, // Color con transparencia
        tension: 0.1,
        fill: false
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: chartData.options?.yAxisTitle || ''
          }
        },
        x: {
          title: {
            display: true,
            text: chartData.options?.xAxisTitle || ''
          }
        }
      }
    }
  });
}

// Ejemplo de uso:
fetch('http://localhost:3002/api/v1/analytics/dashboard?period=month')
  .then(response => response.json())
  .then(data => {
    const lineChartData = data.visualization.charts.lineChart;
    createLineChart(lineChartData, 'lineChartContainer');
  });
```

### 3. Gráfico Circular (Pie Chart)

```javascript
function createPieChart(chartData, containerId) {
  const ctx = document.getElementById(containerId).getContext('2d');
  
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: chartData.datasets[0].name,
        data: chartData.datasets[0].data,
        backgroundColor: chartData.datasets[0].colors || [
          '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff'
        ],
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Ejemplo de uso:
fetch('http://localhost:3002/api/v1/analytics/dashboard?period=month')
  .then(response => response.json())
  .then(data => {
    const pieChartData = data.visualization.charts.pieChart;
    createPieChart(pieChartData, 'pieChartContainer');
  });
```

## Implementación con React y Chart.js

Si estás utilizando React, puedes crear componentes reutilizables para tus gráficos:

```jsx
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Componente para gráfico de barras
function BarChartComponent({ chartData }) {
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map(dataset => ({
      label: dataset.name,
      data: dataset.data,
      backgroundColor: dataset.color,
      borderColor: dataset.color,
      borderWidth: 1
    }))
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: chartData.options?.yAxisTitle || ''
        }
      },
      x: {
        title: {
          display: true,
          text: chartData.options?.xAxisTitle || ''
        }
      }
    }
  };
  
  return (
    <div className="chart-container">
      <Bar data={data} options={options} />
    </div>
  );
}

// Componente para gráfico de líneas
function LineChartComponent({ chartData }) {
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map(dataset => ({
      label: dataset.name,
      data: dataset.data,
      borderColor: dataset.color,
      backgroundColor: `${dataset.color}33`,
      tension: 0.1,
      fill: false
    }))
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: chartData.options?.yAxisTitle || ''
        }
      },
      x: {
        title: {
          display: true,
          text: chartData.options?.xAxisTitle || ''
        }
      }
    }
  };
  
  return (
    <div className="chart-container">
      <Line data={data} options={options} />
    </div>
  );
}

// Componente para gráfico circular
function PieChartComponent({ chartData }) {
  const data = {
    labels: chartData.labels,
    datasets: [{
      label: chartData.datasets[0].name,
      data: chartData.datasets[0].data,
      backgroundColor: chartData.datasets[0].colors || [
        '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff'
      ],
      hoverOffset: 4
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false
  };
  
  return (
    <div className="chart-container">
      <Pie data={data} options={options} />
    </div>
  );
}

// Uso de los componentes en un Dashboard
function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  
  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:3002/api/v1/analytics/dashboard?period=${period}`)
      .then(response => response.json())
      .then(data => {
        setDashboardData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      });
  }, [period]);
  
  if (isLoading) return <div>Cargando...</div>;
  if (!dashboardData) return <div>No hay datos disponibles</div>;
  
  return (
    <div className="dashboard">
      <h1>Dashboard Analytics</h1>
      
      <div className="period-selector">
        <button onClick={() => setPeriod('today')}>Hoy</button>
        <button onClick={() => setPeriod('week')}>Semana</button>
        <button onClick={() => setPeriod('month')}>Mes</button>
        <button onClick={() => setPeriod('year')}>Año</button>
      </div>
      
      <div className="chart-row">
        <div className="chart-col">
          <h2>Ingresos por Período</h2>
          <BarChartComponent 
            chartData={dashboardData.visualization.charts.barChart} 
          />
        </div>
      </div>
      
      <div className="chart-row">
        <div className="chart-col">
          <h2>Tendencia de Ventas</h2>
          <LineChartComponent 
            chartData={dashboardData.visualization.charts.lineChart} 
          />
        </div>
        <div className="chart-col">
          <h2>Productos Populares</h2>
          <PieChartComponent 
            chartData={dashboardData.visualization.charts.pieChart} 
          />
        </div>
      </div>
    </div>
  );
}
```

## Implementación con Vue y Chart.js

Si prefieres Vue.js, aquí tienes un ejemplo:

```vue
<template>
  <div class="chart-container">
    <canvas :id="chartId"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  props: {
    chartData: {
      type: Object,
      required: true
    },
    chartType: {
      type: String,
      required: true
    },
    chartId: {
      type: String,
      default: 'chart'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      const ctx = document.getElementById(this.chartId).getContext('2d');
      
      // Crear configuración según tipo de gráfico
      let config = {
        type: this.chartType,
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      };
      
      // Adaptar datos según tipo de gráfico
      if (this.chartType === 'bar' || this.chartType === 'line') {
        config.data = {
          labels: this.chartData.labels,
          datasets: this.chartData.datasets.map(dataset => ({
            label: dataset.name,
            data: dataset.data,
            backgroundColor: dataset.color,
            borderColor: this.chartType === 'line' ? dataset.color : undefined,
            fill: this.chartType === 'line' ? false : undefined
          }))
        };
        
        // Añadir opciones específicas
        config.options.scales = {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.chartData.options?.yAxisTitle || ''
            }
          },
          x: {
            title: {
              display: true,
              text: this.chartData.options?.xAxisTitle || ''
            }
          }
        };
      } 
      else if (this.chartType === 'pie' || this.chartType === 'doughnut') {
        config.data = {
          labels: this.chartData.labels,
          datasets: [{
            label: this.chartData.datasets[0].name,
            data: this.chartData.datasets[0].data,
            backgroundColor: this.chartData.datasets[0].colors || [
              '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff'
            ]
          }]
        };
      }
      
      // Crear el gráfico
      this.chart = new Chart(ctx, config);
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        // Destruir y recrear el gráfico si los datos cambian
        if (this.chart) {
          this.chart.destroy();
        }
        this.renderChart();
      }
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
</script>
```

## Ejemplos de HTML Completos

### Ejemplo Completo de Dashboard

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Analytics</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    .chart-container {
      position: relative;
      height: 300px;
      margin-bottom: 30px;
    }
    .chart-row {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }
    .chart-col {
      flex: 1;
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .period-selector {
      margin-bottom: 20px;
    }
    .period-selector button {
      padding: 8px 16px;
      margin-right: 10px;
      border: 1px solid #ddd;
      background-color: #f5f5f5;
      border-radius: 4px;
      cursor: pointer;
    }
    .period-selector button.active {
      background-color: #4bc0c0;
      color: white;
      border-color: #4bc0c0;
    }
    h1, h2 {
      color: #333;
    }
    h2 {
      margin-top: 0;
      font-size: 18px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="dashboard">
    <h1>Dashboard Analytics</h1>
    
    <div class="period-selector">
      <button id="period-today">Hoy</button>
      <button id="period-week">Semana</button>
      <button id="period-month" class="active">Mes</button>
      <button id="period-year">Año</button>
    </div>
    
    <div class="chart-row">
      <div class="chart-col">
        <h2>Ingresos por Período</h2>
        <div class="chart-container">
          <canvas id="barChartContainer"></canvas>
        </div>
      </div>
    </div>
    
    <div class="chart-row">
      <div class="chart-col">
        <h2>Tendencia de Ventas</h2>
        <div class="chart-container">
          <canvas id="lineChartContainer"></canvas>
        </div>
      </div>
      <div class="chart-col">
        <h2>Productos Populares</h2>
        <div class="chart-container">
          <canvas id="pieChartContainer"></canvas>
        </div>
      </div>
    </div>
    
    <div class="chart-row">
      <div class="chart-col">
        <h2>Dispensadores</h2>
        <div class="chart-container">
          <canvas id="dispenserChartContainer"></canvas>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Almacén para gráficos activos
    const charts = {};
    let currentPeriod = 'month';
    
    // Funciones para crear gráficos
    function createBarChart(chartData, containerId) {
      const ctx = document.getElementById(containerId).getContext('2d');
      
      // Destruir gráfico anterior si existe
      if (charts[containerId]) {
        charts[containerId].destroy();
      }
      
      charts[containerId] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: chartData.datasets.map(dataset => ({
            label: dataset.name,
            data: dataset.data,
            backgroundColor: dataset.color,
            borderColor: dataset.color,
            borderWidth: 1
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: chartData.options?.yAxisTitle || ''
              }
            },
            x: {
              title: {
                display: true,
                text: chartData.options?.xAxisTitle || ''
              }
            }
          }
        }
      });
    }
    
    function createLineChart(chartData, containerId) {
      const ctx = document.getElementById(containerId).getContext('2d');
      
      // Destruir gráfico anterior si existe
      if (charts[containerId]) {
        charts[containerId].destroy();
      }
      
      charts[containerId] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: chartData.datasets.map(dataset => ({
            label: dataset.name,
            data: dataset.data,
            borderColor: dataset.color,
            backgroundColor: `${dataset.color}33`,
            tension: 0.1,
            fill: false
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: chartData.options?.yAxisTitle || ''
              }
            },
            x: {
              title: {
                display: true,
                text: chartData.options?.xAxisTitle || ''
              }
            }
          }
        }
      });
    }
    
    function createPieChart(chartData, containerId) {
      const ctx = document.getElementById(containerId).getContext('2d');
      
      // Destruir gráfico anterior si existe
      if (charts[containerId]) {
        charts[containerId].destroy();
      }
      
      charts[containerId] = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: chartData.datasets[0].name,
            data: chartData.datasets[0].data,
            backgroundColor: chartData.datasets[0].colors || [
              '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff'
            ],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
    
    // Función para cargar datos del dashboard
    function loadDashboardData(period) {
      fetch(`http://localhost:3002/api/v1/analytics/dashboard?period=${period}`)
        .then(response => response.json())
        .then(data => {
          // Actualizar gráficos con los datos recibidos
          if (data.visualization && data.visualization.charts) {
            const { barChart, lineChart, pieChart, dispenserPieChart } = data.visualization.charts;
            
            if (barChart) {
              createBarChart(barChart, 'barChartContainer');
            }
            
            if (lineChart) {
              createLineChart(lineChart, 'lineChartContainer');
            }
            
            if (pieChart) {
              createPieChart(pieChart, 'pieChartContainer');
            }
            
            if (dispenserPieChart) {
              createPieChart(dispenserPieChart, 'dispenserChartContainer');
            }
          }
        })
        .catch(error => {
          console.error('Error fetching dashboard data:', error);
        });
    }
    
    // Configurar selectores de período
    document.querySelectorAll('.period-selector button').forEach(button => {
      button.addEventListener('click', function() {
        // Actualizar estado activo
        document.querySelectorAll('.period-selector button').forEach(btn => {
          btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // Extraer período del ID del botón
        currentPeriod = this.id.split('-')[1];
        
        // Cargar datos para el nuevo período
        loadDashboardData(currentPeriod);
      });
    });
    
    // Cargar datos iniciales
    loadDashboardData(currentPeriod);
  </script>
</body>
</html>
```

Esta guía te proporciona todo lo necesario para implementar correctamente los gráficos en tu frontend utilizando los datos estructurados que devuelven los endpoints de analytics.
