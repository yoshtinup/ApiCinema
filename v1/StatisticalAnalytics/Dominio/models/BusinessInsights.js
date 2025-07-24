/**
 * Modelo de dominio para insights comerciales
 * Representa conclusiones y recomendaciones basadas en análisis estadístico
 */
export class BusinessInsights {
  constructor({
    keyFindings = [],
    recommendations = [],
    riskFactors = [],
    opportunities = [],
    metrics = {},
    predictions = {},
    confidence = 0,
    analysisDate = new Date(),
    dataSource = '',
    methodology = ''
  } = {}) {
    this.keyFindings = keyFindings;
    this.recommendations = recommendations;
    this.riskFactors = riskFactors;
    this.opportunities = opportunities;
    this.metrics = metrics;
    this.predictions = predictions;
    this.confidence = confidence;
    this.analysisDate = analysisDate;
    this.dataSource = dataSource;
    this.methodology = methodology;
  }

  /**
   * Agrega un hallazgo clave
   */
  addKeyFinding(finding) {
    this.keyFindings.push({
      id: this.keyFindings.length + 1,
      finding,
      timestamp: new Date(),
      priority: this.calculatePriority(finding)
    });
  }

  /**
   * Agrega una recomendación
   */
  addRecommendation(recommendation, impact = 'medium') {
    this.recommendations.push({
      id: this.recommendations.length + 1,
      recommendation,
      impact,
      feasibility: this.assessFeasibility(recommendation),
      timestamp: new Date()
    });
  }

  /**
   * Agrega un factor de riesgo
   */
  addRiskFactor(risk, probability = 'medium') {
    this.riskFactors.push({
      id: this.riskFactors.length + 1,
      risk,
      probability,
      impact: this.assessRiskImpact(risk),
      mitigation: this.suggestMitigation(risk),
      timestamp: new Date()
    });
  }

  /**
   * Agrega una oportunidad
   */
  addOpportunity(opportunity, potential = 'medium') {
    this.opportunities.push({
      id: this.opportunities.length + 1,
      opportunity,
      potential,
      requirements: this.assessRequirements(opportunity),
      timeline: this.estimateTimeline(opportunity),
      timestamp: new Date()
    });
  }

  /**
   * Calcula la prioridad de un hallazgo
   */
  calculatePriority(finding) {
    // Lógica simple para determinar prioridad
    const highPriorityKeywords = ['crítico', 'urgente', 'pérdida', 'riesgo'];
    const lowPriorityKeywords = ['mejora', 'optimización', 'eventual'];
    
    const text = finding.toLowerCase();
    
    if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    if (lowPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'low';
    }
    return 'medium';
  }

  /**
   * Evalúa la factibilidad de una recomendación
   */
  assessFeasibility(recommendation) {
    // Lógica simple para evaluar factibilidad
    const easyKeywords = ['monitoreo', 'reporte', 'análisis'];
    const hardKeywords = ['cambio', 'implementación', 'sistema'];
    
    const text = recommendation.toLowerCase();
    
    if (easyKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    if (hardKeywords.some(keyword => text.includes(keyword))) {
      return 'low';
    }
    return 'medium';
  }

  /**
   * Evalúa el impacto de un riesgo
   */
  assessRiskImpact(risk) {
    return 'medium'; // Implementación simplificada
  }

  /**
   * Sugiere mitigación para un riesgo
   */
  suggestMitigation(risk) {
    return 'Monitoreo continuo y análisis de tendencias';
  }

  /**
   * Evalúa requerimientos de una oportunidad
   */
  assessRequirements(opportunity) {
    return ['Análisis detallado', 'Recursos adicionales'];
  }

  /**
   * Estima timeline de una oportunidad
   */
  estimateTimeline(opportunity) {
    return '1-3 meses';
  }

  /**
   * Obtiene resumen ejecutivo
   */
  getExecutiveSummary() {
    return {
      totalFindings: this.keyFindings.length,
      highPriorityFindings: this.keyFindings.filter(f => f.priority === 'high').length,
      totalRecommendations: this.recommendations.length,
      highImpactRecommendations: this.recommendations.filter(r => r.impact === 'high').length,
      riskLevel: this.calculateOverallRiskLevel(),
      opportunityScore: this.calculateOpportunityScore(),
      confidence: this.confidence,
      analysisDate: this.analysisDate
    };
  }

  /**
   * Calcula nivel de riesgo general
   */
  calculateOverallRiskLevel() {
    if (this.riskFactors.length === 0) return 'low';
    
    const highRisks = this.riskFactors.filter(r => r.probability === 'high').length;
    const totalRisks = this.riskFactors.length;
    
    if (highRisks / totalRisks > 0.5) return 'high';
    if (highRisks / totalRisks > 0.2) return 'medium';
    return 'low';
  }

  /**
   * Calcula score de oportunidades
   */
  calculateOpportunityScore() {
    if (this.opportunities.length === 0) return 0;
    
    const weights = { high: 3, medium: 2, low: 1 };
    const totalScore = this.opportunities.reduce((sum, opp) => {
      return sum + (weights[opp.potential] || 1);
    }, 0);
    
    return Math.round((totalScore / (this.opportunities.length * 3)) * 100);
  }

  /**
   * Resumen completo de insights
   */
  getFullReport() {
    return {
      executiveSummary: this.getExecutiveSummary(),
      keyFindings: this.keyFindings,
      recommendations: this.recommendations,
      riskFactors: this.riskFactors,
      opportunities: this.opportunities,
      metrics: this.metrics,
      predictions: this.predictions,
      metadata: {
        confidence: this.confidence,
        analysisDate: this.analysisDate,
        dataSource: this.dataSource,
        methodology: this.methodology
      }
    };
  }
}
