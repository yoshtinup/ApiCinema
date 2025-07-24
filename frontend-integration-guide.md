# Frontend Integration Guide for Analytics Dashboard

This guide outlines how to integrate the analytics API endpoints with your frontend application.

## Available Endpoints

### 1. Dashboard Analytics
```javascript
// Example: Fetch dashboard data for the last month
async function fetchDashboardData(period = 'month') {
  const response = await fetch(`http://localhost:3002/api/v1/analytics/dashboard?period=${period}`);
  const data = await response.json();
  return data;
}

// Usage in component
useEffect(() => {
  fetchDashboardData(selectedPeriod)
    .then(data => {
      setTotalSales(data.totalSales);
      setOrderCount(data.orderCount);
      setAverageOrderValue(data.averageOrderValue);
      setTopProducts(data.topProducts);
      setSalesTrend(data.salesTrend);
      setConfidenceInterval(data.confidenceInterval);
    })
    .catch(error => {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    });
}, [selectedPeriod]);
```

### 2. Probability Analysis
```javascript
// Example: Fetch probability analysis for sales in the current month
async function fetchProbabilityAnalysis(period = 'month', metric = 'sales') {
  const response = await fetch(`http://localhost:3002/api/v1/analytics/probability?period=${period}&metric=${metric}`);
  const data = await response.json();
  return data;
}

// Usage in component
useEffect(() => {
  fetchProbabilityAnalysis(selectedPeriod, selectedMetric)
    .then(data => {
      setDescriptiveStats(data.descriptiveStatistics);
      setProbabilityDistributions(data.probabilityDistributions);
      setPredictions(data.predictions);
      
      // Create chart data
      const confidenceIntervals = data.probabilityDistributions.normal.confidenceIntervals;
      setChartData({
        labels: ['90%', '95%', '99%'],
        datasets: [{
          label: 'Confidence Intervals',
          data: [
            [confidenceIntervals['90'].lowerBound, confidenceIntervals['90'].upperBound],
            [confidenceIntervals['95'].lowerBound, confidenceIntervals['95'].upperBound],
            [confidenceIntervals['99'].lowerBound, confidenceIntervals['99'].upperBound]
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
        }]
      });
    })
    .catch(error => {
      console.error('Error fetching probability analysis:', error);
      setError('Failed to load probability analysis');
    });
}, [selectedPeriod, selectedMetric]);
```

## UI Components

### 1. Period Selector
```jsx
function PeriodSelector({ value, onChange }) {
  return (
    <div className="period-selector">
      <label>Time Period:</label>
      <select value={value} onChange={e => onChange(e.target.value)}>
        <option value="today">Today</option>
        <option value="week">Last 7 Days</option>
        <option value="month">Last 30 Days</option>
        <option value="year">Last 365 Days</option>
      </select>
    </div>
  );
}
```

### 2. Dashboard KPI Cards
```jsx
function KPICard({ title, value, previousValue, trend, confidenceInterval }) {
  const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  
  return (
    <div className="kpi-card">
      <h3>{title}</h3>
      <div className="kpi-value">{formatValue(value)}</div>
      
      {previousValue && (
        <div className={`kpi-trend ${percentChange >= 0 ? 'positive' : 'negative'}`}>
          {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
        </div>
      )}
      
      {confidenceInterval && (
        <div className="confidence-interval">
          95% CI: {formatValue(confidenceInterval.lowerBound)} - {formatValue(confidenceInterval.upperBound)}
        </div>
      )}
    </div>
  );
}
```

### 3. Sales Trend Chart (using Chart.js)
```jsx
import { Line } from 'react-chartjs-2';

function SalesTrendChart({ data }) {
  const chartData = {
    labels: data.map(item => formatDate(item.date)),
    datasets: [{
      label: 'Sales',
      data: data.map(item => item.sales),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };
  
  return (
    <div className="chart-container">
      <h3>Sales Trend</h3>
      <Line data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }} />
    </div>
  );
}
```

### 4. Probability Distribution Chart
```jsx
import { Chart } from 'react-chartjs-2';

function ProbabilityDistributionChart({ distribution }) {
  const { mean, standardDeviation } = distribution.parameters;
  
  // Generate normal distribution curve points
  const points = [];
  const min = mean - standardDeviation * 3;
  const max = mean + standardDeviation * 3;
  const step = (max - min) / 100;
  
  for (let x = min; x <= max; x += step) {
    const y = (1 / (standardDeviation * Math.sqrt(2 * Math.PI))) * 
              Math.exp(-0.5 * Math.pow((x - mean) / standardDeviation, 2));
    points.push({ x, y });
  }
  
  const chartData = {
    datasets: [{
      label: 'Normal Distribution',
      data: points,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      pointRadius: 0,
      showLine: true
    }]
  };
  
  return (
    <div className="chart-container">
      <h3>Probability Distribution</h3>
      <Chart type="scatter" data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Value'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Probability'
            },
            beginAtZero: true
          }
        }
      }} />
    </div>
  );
}
```

## Error Handling

```jsx
function ErrorDisplay({ error }) {
  if (!error) return null;
  
  return (
    <div className="error-display">
      <p><strong>Error:</strong> {error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );
}
```

## Loading State

```jsx
function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading analytics data...</p>
    </div>
  );
}
```

## Example Dashboard Page

```jsx
function AnalyticsDashboard() {
  const [period, setPeriod] = useState('month');
  const [metric, setMetric] = useState('sales');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [probabilityData, setProbabilityData] = useState(null);
  
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    Promise.all([
      fetchDashboardData(period),
      fetchProbabilityAnalysis(period, metric)
    ])
      .then(([dashboard, probability]) => {
        setDashboardData(dashboard);
        setProbabilityData(probability);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
        setIsLoading(false);
      });
  }, [period, metric]);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div className="analytics-dashboard">
      <h1>Sales Analytics Dashboard</h1>
      
      <div className="controls">
        <PeriodSelector value={period} onChange={setPeriod} />
        <MetricSelector value={metric} onChange={setMetric} />
      </div>
      
      <div className="kpi-section">
        <KPICard 
          title="Total Sales" 
          value={dashboardData.totalSales} 
          confidenceInterval={dashboardData.confidenceInterval}
        />
        <KPICard 
          title="Orders" 
          value={dashboardData.orderCount} 
        />
        <KPICard 
          title="Average Order Value" 
          value={dashboardData.averageOrderValue} 
        />
      </div>
      
      <div className="chart-section">
        <SalesTrendChart data={dashboardData.salesTrend} />
        <ProductRankingChart products={dashboardData.topProducts} />
      </div>
      
      <div className="probability-section">
        <h2>Statistical Analysis</h2>
        <div className="stats-grid">
          <StatCard 
            title="Mean" 
            value={probabilityData.descriptiveStatistics.mean} 
          />
          <StatCard 
            title="Standard Deviation" 
            value={probabilityData.descriptiveStatistics.standardDeviation} 
          />
          <StatCard 
            title="Predicted Next Period" 
            value={probabilityData.predictions.nextPeriod} 
          />
        </div>
        <ProbabilityDistributionChart 
          distribution={probabilityData.probabilityDistributions.normal} 
        />
      </div>
    </div>
  );
}
```

## Implementation Tips

1. **Data Caching**: Implement caching for analytics data to avoid frequent API calls
2. **State Management**: Use Redux or Context API for state management across components
3. **Error Handling**: Implement robust error handling with user-friendly messages
4. **Lazy Loading**: Load charts and complex components lazily to improve initial load time
5. **Responsive Design**: Ensure dashboard looks good on all screen sizes
6. **Animations**: Add subtle animations for transitions between data periods
7. **Accessibility**: Ensure all components are keyboard navigable and screen reader friendly

For any questions or assistance, please contact the backend team.
