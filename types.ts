export interface Question {
  id: string;
  section: string;
  factor: string;
  title: string;
  text: string;
}

export interface Answer {
  questionId: string;
  value: string;
}

export interface FactorAnalysis {
  factor: string;
  summary: string;
  admissibilityConfidence: 'High' | 'Medium' | 'Low';
  strengths: string[];
  weaknesses: string[];
  actionableRecommendations: string[];
  crossExaminationQuestions: string[];
  recommendedSuppressionText: string[];
}

export interface AnalysisSection {
  sectionTitle: string;
  sectionSummary: string;
  factorAnalyses: FactorAnalysis[];
}

export interface ExecutiveSummary {
    overallConfidence: 'High' | 'Medium' | 'Low';
    confidenceBreakdown: {
        high: number;
        medium: number;
        low: number;
    };
    topRecommendations: string[];
}


export interface AnalysisResult {
  executiveSummary: ExecutiveSummary;
  overallConclusion: string;
  analysisSections: AnalysisSection[];
}