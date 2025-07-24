# Analytics API Documentation

This document outlines the available analytics endpoints, their parameters, and response formats.

## Base URL
```
http://localhost:3002/api/v1/analytics
```

## Available Endpoints

### 1. Dashboard Analytics
Provides key metrics and trends for the dashboard.

**Endpoint:** `/dashboard`

**Method:** `GET`

**Query Parameters:**
- `period`: (Optional) Time period for data aggregation
  - `today` - Current day's data
  - `week` - Last 7 days
  - `month` - Last 30 days 
  - `year` - Last 365 days
  - Default: `month`

**Response Format:**
```json
{
  "totalSales": 12500,
  "orderCount": 43,
  "averageOrderValue": 290.70,
  "topProducts": [
    { "id": 1, "name": "Coca Cola", "quantity": 25, "sales": 2500 },
    { "id": 5, "name": "Doritos", "quantity": 18, "sales": 1800 },
    { "id": 3, "name": "Skwintles", "quantity": 15, "sales": 1500 }
  ],
  "salesTrend": [
    { "date": "2025-01-01", "sales": 850 },
    { "date": "2025-01-02", "sales": 920 },
    // ...additional dates
  ],
  "confidenceInterval": {
    "lowerBound": 10200,
    "upperBound": 14800,
    "confidenceLevel": 0.95
  }
}
```

### 2. Probability Analysis
Provides statistical probability distributions and predictions.

**Endpoint:** `/probability`

**Method:** `GET`

**Query Parameters:**
- `period`: (Optional) Time period for data analysis
  - `today` - Current day's data
  - `week` - Last 7 days
  - `month` - Last 30 days
  - `year` - Last 365 days
  - Default: `month`
- `metric`: (Optional) Metric to analyze
  - `sales` - Total sales amount
  - `orders` - Order count
  - Default: `sales`

**Response Format:**
```json
{
  "descriptiveStatistics": {
    "mean": 290.5,
    "median": 275.0,
    "standardDeviation": 45.2,
    "min": 180.0,
    "max": 420.0,
    "range": 240.0,
    "skewness": 0.45,
    "kurtosis": 2.1
  },
  "probabilityDistributions": {
    "normal": {
      "parameters": {
        "mean": 290.5,
        "standardDeviation": 45.2
      },
      "predictedValue": 285.7,
      "confidenceIntervals": {
        "90": {
          "lowerBound": 220.3,
          "upperBound": 360.7
        },
        "95": {
          "lowerBound": 210.5,
          "upperBound": 370.5
        },
        "99": {
          "lowerBound": 190.1,
          "upperBound": 390.9
        }
      }
    }
  },
  "predictions": {
    "nextPeriod": 298.2,
    "nextPeriodProbability": 0.65,
    "growthRate": 0.03
  }
}
```

### 3. Product Performance
Analyzes the performance of individual products.

**Endpoint:** `/products/:productId`

**Method:** `GET`

**Path Parameters:**
- `productId`: ID of the product to analyze

**Query Parameters:**
- `period`: (Optional) Time period for data aggregation
  - `today` - Current day's data
  - `week` - Last 7 days
  - `month` - Last 30 days
  - `year` - Last 365 days
  - Default: `month`

**Response Format:**
```json
{
  "product": {
    "id": 1,
    "name": "Coca Cola"
  },
  "metrics": {
    "totalSales": 2500,
    "totalQuantity": 25,
    "averagePrice": 100.0,
    "percentageOfTotalSales": 20.0,
    "trend": [
      { "date": "2025-01-01", "sales": 300 },
      { "date": "2025-01-02", "sales": 200 },
      // ...additional dates
    ]
  },
  "statistics": {
    "standardDeviation": 50.2,
    "confidenceInterval": {
      "lowerBound": 2100,
      "upperBound": 2900,
      "confidenceLevel": 0.95
    }
  }
}
```

## Error Responses

All endpoints return the following error format:

```json
{
  "error": true,
  "message": "Description of the error",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `INVALID_PARAMETER` - Invalid query parameter
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `INSUFFICIENT_DATA` - Not enough data for statistical analysis
- `INTERNAL_SERVER_ERROR` - Unexpected server error

## Best Practices for Frontend Integration

1. **Caching**: Cache dashboard results for at least 5 minutes to reduce server load
2. **Loading States**: Show proper loading indicators during data fetching
3. **Error Handling**: Display user-friendly error messages
4. **Data Visualization**: Use appropriate charts for different metrics:
   - Line charts for trends
   - Bar charts for product comparisons
   - Gauge charts for KPIs with confidence intervals
5. **Responsive Design**: Ensure analytics display well on mobile devices
