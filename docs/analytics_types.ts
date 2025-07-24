/**
 * Tipos TypeScript para la API de Analytics
 * Estos tipos definen la estructura de datos esperada desde el endpoint
 * /api/v1/analytics/dashboard
 */

export interface SalesSummary {
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  growthPercentage: number;
}

export interface ChartDataset {
  name: string;
  data: number[];
  color?: string;
  colors?: string[];
}

export interface ChartOptions {
  xAxisTitle?: string;
  yAxisTitle?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  options?: ChartOptions;
}

export interface VisualizationCharts {
  barChart?: ChartData;
  lineChart?: ChartData;
  pieChart?: ChartData;
  dispenserPieChart?: ChartData;
}

export interface Visualization {
  charts: VisualizationCharts;
}

export interface Recommendation {
  type: 'opportunity' | 'warning' | 'prediction';
  message: string;
}

export interface CentralTendency {
  mean: number;
  median: number;
  mode: number | null;
}

export interface Dispersion {
  standardDeviation: number;
  variance: number;
  range: number;
  coefficientOfVariation: number;
}

export interface Shape {
  skewness: number;
  skewnessInterpretation: string;
  kurtosis: number;
  kurtosisInterpretation: string;
}

export interface Percentiles {
  [key: string]: number; // Permite acceder a percentiles como "25", "50", etc.
  25: number;
  50: number;
  75: number;
  90: number;
  95: number;
  99: number;
}

export interface BasicStats {
  count: number;
  sum: number;
  min: number;
  max: number;
}

export interface Statistics {
  centralTendency: CentralTendency;
  dispersion: Dispersion;
  shape: Shape;
  percentiles: Percentiles;
  basic: BasicStats;
}

/**
 * Interfaz principal para la respuesta completa de la API
 */
export interface DashboardData {
  salesSummary: SalesSummary;
  visualization: Visualization;
  recommendations?: Recommendation[];
  statistics?: Statistics;
}

/**
 * Tipo para los períodos de tiempo disponibles
 */
export type Period = 'today' | 'week' | 'month' | 'year';

/**
 * Interfaz para parámetros de la solicitud
 */
export interface DashboardParams {
  period: Period;
}
