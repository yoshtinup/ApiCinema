/**
 * Datos de ejemplo para el Dashboard de Analytics
 * Este archivo contiene una estructura de datos de ejemplo que se espera
 * que devuelva la API para diferentes períodos.
 * Puedes usarlo para probar el frontend sin necesidad de conectarte al backend.
 */

const sampleDashboardData = {
  // Datos de ejemplo para el período "Hoy"
  today: {
    salesSummary: {
      totalRevenue: 4500,
      totalSales: 90,
      averageOrderValue: 50,
      growthPercentage: 5
    },
    visualization: {
      charts: {
        barChart: {
          labels: ["9:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"],
          datasets: [
            {
              name: "Ventas por hora",
              data: [200, 350, 800, 600, 900, 1100, 550],
              color: "#4e73df"
            }
          ],
          options: {
            xAxisTitle: "Hora del día",
            yAxisTitle: "Pesos (MXN)"
          }
        },
        lineChart: {
          labels: ["9:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"],
          datasets: [
            {
              name: "Ventas de hoy",
              data: [200, 350, 800, 600, 900, 1100, 550],
              color: "#36b9cc"
            },
            {
              name: "Ventas promedio",
              data: [180, 300, 750, 580, 850, 1050, 500],
              color: "#1cc88a"
            }
          ],
          options: {
            xAxisTitle: "Hora del día",
            yAxisTitle: "Ventas (MXN)"
          }
        },
        pieChart: {
          labels: ["Palomitas", "Nachos", "Refrescos", "Dulces", "Combos"],
          datasets: [
            {
              name: "Productos vendidos hoy",
              data: [40, 25, 15, 10, 10],
              colors: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"]
            }
          ]
        },
        dispenserPieChart: {
          labels: ["Dispensador 1", "Dispensador 2", "Dispensador 3"],
          datasets: [
            {
              name: "Uso de dispensadores hoy",
              data: [45, 35, 20],
              colors: ["#4e73df", "#1cc88a", "#36b9cc"]
            }
          ]
        }
      }
    },
    recommendations: [
      {
        type: "opportunity",
        message: "El dispensador 1 está siendo muy utilizado hoy - considera redirigir clientes a otros dispensadores"
      },
      {
        type: "warning",
        message: "Las ventas de dulces están por debajo del promedio diario"
      }
    ]
  },

  // Datos de ejemplo para el período "Semana"
  week: {
    salesSummary: {
      totalRevenue: 28500,
      totalSales: 570,
      averageOrderValue: 50,
      growthPercentage: 8
    },
    visualization: {
      charts: {
        barChart: {
          labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
          datasets: [
            {
              name: "Ventas diarias",
              data: [3200, 2900, 3500, 3800, 4200, 5500, 5400],
              color: "#4e73df"
            }
          ],
          options: {
            xAxisTitle: "Día de la semana",
            yAxisTitle: "Pesos (MXN)"
          }
        },
        lineChart: {
          labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
          datasets: [
            {
              name: "Esta semana",
              data: [3200, 2900, 3500, 3800, 4200, 5500, 5400],
              color: "#36b9cc"
            },
            {
              name: "Semana anterior",
              data: [3000, 2700, 3300, 3600, 4000, 5200, 5100],
              color: "#1cc88a"
            }
          ],
          options: {
            xAxisTitle: "Día de la semana",
            yAxisTitle: "Ventas (MXN)"
          }
        },
        pieChart: {
          labels: ["Palomitas", "Nachos", "Refrescos", "Dulces", "Combos"],
          datasets: [
            {
              name: "Productos populares de la semana",
              data: [35, 25, 20, 10, 10],
              colors: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"]
            }
          ]
        },
        dispenserPieChart: {
          labels: ["Dispensador 1", "Dispensador 2", "Dispensador 3"],
          datasets: [
            {
              name: "Uso semanal de dispensadores",
              data: [40, 35, 25],
              colors: ["#4e73df", "#1cc88a", "#36b9cc"]
            }
          ]
        }
      }
    },
    recommendations: [
      {
        type: "opportunity",
        message: "Las ventas de fin de semana son 40% mayores - considera aumentar el personal en esos días"
      },
      {
        type: "prediction",
        message: "Basado en las tendencias, se espera un aumento del 10% en ventas la próxima semana"
      }
    ]
  },

  // Datos de ejemplo para el período "Mes"
  month: {
    salesSummary: {
      totalRevenue: 125000,
      totalSales: 2500,
      averageOrderValue: 50,
      growthPercentage: 15
    },
    visualization: {
      charts: {
        barChart: {
          labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
          datasets: [
            {
              name: "Ventas semanales",
              data: [28500, 30200, 32500, 33800],
              color: "#4e73df"
            }
          ],
          options: {
            xAxisTitle: "Semana del mes",
            yAxisTitle: "Pesos (MXN)"
          }
        },
        lineChart: {
          labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
          datasets: [
            {
              name: "Este mes",
              data: [28500, 30200, 32500, 33800],
              color: "#36b9cc"
            },
            {
              name: "Mes anterior",
              data: [26000, 27500, 28900, 30600],
              color: "#1cc88a"
            }
          ],
          options: {
            xAxisTitle: "Semana del mes",
            yAxisTitle: "Ventas (MXN)"
          }
        },
        pieChart: {
          labels: ["Palomitas", "Nachos", "Refrescos", "Dulces", "Combos"],
          datasets: [
            {
              name: "Productos populares del mes",
              data: [35, 25, 20, 10, 10],
              colors: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"]
            }
          ]
        },
        dispenserPieChart: {
          labels: ["Dispensador 1", "Dispensador 2", "Dispensador 3"],
          datasets: [
            {
              name: "Uso mensual de dispensadores",
              data: [45, 30, 25],
              colors: ["#4e73df", "#1cc88a", "#36b9cc"]
            }
          ]
        }
      }
    },
    recommendations: [
      {
        type: "opportunity",
        message: "Las ventas de combos han aumentado un 15% - considera crear más opciones de combos"
      },
      {
        type: "warning",
        message: "El dispensador 2 muestra baja actividad - verifica su funcionamiento"
      },
      {
        type: "prediction",
        message: "Se espera un aumento del 20% en ventas el próximo fin de semana basado en tendencias históricas"
      }
    ]
  },

  // Datos de ejemplo para el período "Año"
  year: {
    salesSummary: {
      totalRevenue: 1450000,
      totalSales: 29000,
      averageOrderValue: 50,
      growthPercentage: 25
    },
    visualization: {
      charts: {
        barChart: {
          labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
          datasets: [
            {
              name: "Ventas mensuales",
              data: [95000, 98000, 105000, 115000, 125000, 130000, 135000, 138000, 142000, 145000, 155000, 167000],
              color: "#4e73df"
            }
          ],
          options: {
            xAxisTitle: "Mes",
            yAxisTitle: "Pesos (MXN)"
          }
        },
        lineChart: {
          labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
          datasets: [
            {
              name: "Este año",
              data: [95000, 98000, 105000, 115000, 125000, 130000, 135000, 138000, 142000, 145000, 155000, 167000],
              color: "#36b9cc"
            },
            {
              name: "Año anterior",
              data: [85000, 87000, 94000, 100000, 105000, 112000, 118000, 121000, 125000, 128000, 135000, 145000],
              color: "#1cc88a"
            }
          ],
          options: {
            xAxisTitle: "Mes",
            yAxisTitle: "Ventas (MXN)"
          }
        },
        pieChart: {
          labels: ["Palomitas", "Nachos", "Refrescos", "Dulces", "Combos"],
          datasets: [
            {
              name: "Productos populares del año",
              data: [32, 24, 22, 12, 10],
              colors: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"]
            }
          ]
        },
        dispenserPieChart: {
          labels: ["Dispensador 1", "Dispensador 2", "Dispensador 3"],
          datasets: [
            {
              name: "Uso anual de dispensadores",
              data: [42, 33, 25],
              colors: ["#4e73df", "#1cc88a", "#36b9cc"]
            }
          ]
        }
      }
    },
    recommendations: [
      {
        type: "opportunity",
        message: "Las ventas muestran un crecimiento constante - considera expandir el negocio"
      },
      {
        type: "warning",
        message: "Los meses de febrero y enero muestran ventas por debajo del promedio - considera promociones especiales"
      },
      {
        type: "prediction",
        message: "Basado en el crecimiento anual, se proyecta un aumento del 25% para el próximo año"
      }
    ]
  }
};

// Exportar los datos para uso en modo de desarrollo
if (typeof module !== 'undefined') {
  module.exports = sampleDashboardData;
}
