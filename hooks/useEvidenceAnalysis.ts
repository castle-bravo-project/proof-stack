// Custom hook for evidence analysis with state management
import { useState, useCallback, useEffect } from 'react';
import { OptimizedGeminiService } from '../services/optimizedGeminiService';
import { EnhancedAIAnalysisEngine, EnhancedAnalysisResult } from '../enhancedAIAnalysis';
import { ComplianceAuditSystem } from '../complianceAudit';

export interface EvidenceAnalysisState {
  isLoading: boolean;
  error: string | null;
  analysis: EnhancedAnalysisResult | null;
  progress: number;
  stage: 'idle' | 'rule_analysis' | 'authentication' | 'document_analysis' | 'ai_enhancement' | 'complete';
}

export interface UseEvidenceAnalysisOptions {
  enableCaching?: boolean;
  enableAuditLogging?: boolean;
  userId?: string;
}

export const useEvidenceAnalysis = (options: UseEvidenceAnalysisOptions = {}) => {
  const [state, setState] = useState<EvidenceAnalysisState>({
    isLoading: false,
    error: null,
    analysis: null,
    progress: 0,
    stage: 'idle'
  });

  const [geminiService] = useState(() => new OptimizedGeminiService(import.meta.env.VITE_GEMINI_API_KEY));
  const [analysisEngine] = useState(() => new EnhancedAIAnalysisEngine());
  const [auditSystem] = useState(() => new ComplianceAuditSystem());

  const updateState = useCallback((updates: Partial<EvidenceAnalysisState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const analyzeEvidence = useCallback(async (
    evidenceInfo: any,
    answers: any[],
    documentContent?: string,
    caseContext?: any
  ) => {
    try {
      updateState({ 
        isLoading: true, 
        error: null, 
        progress: 0, 
        stage: 'rule_analysis' 
      });

      // Log analysis start
      if (options.enableAuditLogging && options.userId) {
        await auditSystem.logAction(
          options.userId,
          'attorney',
          'evidence_analyzed',
          { evidenceId: evidenceInfo.id, analysisType: 'comprehensive' }
        );
      }

      // Convert evidenceInfo to EvidenceItem format
      const evidenceItem = {
        id: evidenceInfo.id || `evidence_${Date.now()}`,
        name: evidenceInfo.name,
        type: evidenceInfo.type,
        description: evidenceInfo.description,
        metadata: evidenceInfo.metadata || {},
        chainOfCustody: evidenceInfo.chainOfCustody || { entries: [], isComplete: false, gaps: [] },
        isOriginal: evidenceInfo.isOriginal || false,
        jurisdiction: evidenceInfo.jurisdiction || 'Federal'
      };

      updateState({ progress: 25, stage: 'authentication' });

      // Perform comprehensive analysis
      const result = await analysisEngine.performComprehensiveAnalysis(
        evidenceItem,
        documentContent,
        caseContext,
        options.userId
      );

      updateState({ progress: 75, stage: 'ai_enhancement' });

      // Add AI-enhanced insights if needed
      if (answers.length > 0) {
        const aiInsights = await geminiService.generateLegallyGroundedAnalysis(
          evidenceInfo,
          answers,
          'comprehensive'
        );
        
        // Merge AI insights with rule-based analysis
        result.aiEnhancedAnalysis = {
          ...result.aiEnhancedAnalysis,
          contextualAnalysis: aiInsights.overallConclusion || result.aiEnhancedAnalysis.contextualAnalysis
        };
      }

      updateState({ 
        progress: 100, 
        stage: 'complete',
        analysis: result,
        isLoading: false 
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      updateState({ 
        error: errorMessage, 
        isLoading: false, 
        stage: 'idle',
        progress: 0 
      });
      throw error;
    }
  }, [geminiService, analysisEngine, auditSystem, options, updateState]);

  const getAIAssistance = useCallback(async (
    question: any,
    answer: string,
    type: 'critique' | 'suggestions',
    evidenceContext?: any
  ) => {
    try {
      const legalRules = [
        'FRE 901 - Authentication',
        'FRE 902 - Self-Authentication',
        'FRE 1001-1008 - Best Evidence Rule',
        'FRE 401-403 - Relevance'
      ];

      if (type === 'critique') {
        return await geminiService.getAICritique(question, answer, evidenceContext, legalRules);
      } else {
        return await geminiService.getAIKeyPoints(question, evidenceContext, legalRules);
      }
    } catch (error) {
      throw new Error(`AI assistance failed: ${error.message}`);
    }
  }, [geminiService]);

  const resetAnalysis = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      analysis: null,
      progress: 0,
      stage: 'idle'
    });
  }, []);

  const getUsageStats = useCallback(() => {
    return {
      gemini: geminiService.getUsageStats(),
      cache: geminiService.getCacheStats()
    };
  }, [geminiService]);

  return {
    ...state,
    analyzeEvidence,
    getAIAssistance,
    resetAnalysis,
    getUsageStats
  };
};
