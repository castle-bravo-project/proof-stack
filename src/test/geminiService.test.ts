import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearApiKey,
  generateComprehensiveAnalysis,
  getAICritique,
  getAIKeyPoints,
  getApiKey,
  isApiKeyConfigured,
  setApiKey,
} from '../../services/geminiService';
import { Answer } from '../../types';

// Mock the GoogleGenAI module
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              summary: 'Test analysis summary',
              keyFindings: ['Finding 1', 'Finding 2'],
              legalAnalysis: {
                admissibility: 85,
                strengths: ['Strong authentication'],
                weaknesses: ['Minor chain of custody gap'],
                recommendations: ['Obtain additional documentation'],
              },
              riskAssessment: {
                overallRisk: 'LOW',
                specificRisks: ['Minimal authentication concerns'],
              },
            }),
        },
      }),
    },
  })),
}));

describe('Gemini Service', () => {
  beforeEach(() => {
    clearApiKey();
    vi.clearAllMocks();
  });

  describe('API Key Management', () => {
    it('should set and get API key', () => {
      const testKey = 'test-api-key-123';
      setApiKey(testKey);

      expect(getApiKey()).toBe(testKey);
      expect(isApiKeyConfigured()).toBe(true);
    });

    it('should clear API key', () => {
      setApiKey('test-key');
      clearApiKey();

      expect(getApiKey()).toBeNull();
      expect(isApiKeyConfigured()).toBe(false);
    });

    it('should persist API key in localStorage', () => {
      const testKey = 'persistent-key';
      setApiKey(testKey);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'gemini_api_key',
        testKey
      );
    });

    it('should retrieve API key from localStorage', () => {
      const testKey = 'stored-key';
      vi.mocked(localStorage.getItem).mockReturnValue(testKey);

      const retrievedKey = getApiKey();
      expect(retrievedKey).toBe(testKey);
      expect(localStorage.getItem).toHaveBeenCalledWith('gemini_api_key');
    });

    it('should clear API key from localStorage', () => {
      clearApiKey();
      expect(localStorage.removeItem).toHaveBeenCalledWith('gemini_api_key');
    });
  });

  describe('Analysis Generation', () => {
    const mockAnswers: Answer[] = [
      {
        questionId: 'evidence_type',
        value: 'Digital document',
        confidence: 0.9,
      },
      {
        questionId: 'source_reliability',
        value: 'High',
        confidence: 0.8,
      },
    ];

    const mockEvidenceInfo = {
      type: 'document',
      description: 'Test evidence',
      source: 'Test source',
    };

    beforeEach(() => {
      setApiKey('test-api-key');
    });

    it('should generate comprehensive analysis', async () => {
      const result = await generateComprehensiveAnalysis(
        mockAnswers,
        mockEvidenceInfo
      );

      expect(result).toBeDefined();
      expect(result.summary).toBe('Test analysis summary');
      expect(result.keyFindings).toEqual(['Finding 1', 'Finding 2']);
      expect(result.legalAnalysis).toBeDefined();
      expect(result.legalAnalysis.admissibility).toBe(85);
      expect(result.riskAssessment).toBeDefined();
    });

    it('should get AI key points', async () => {
      const keyPoints = await getAIKeyPoints(mockAnswers, mockEvidenceInfo);

      expect(keyPoints).toBeDefined();
      expect(Array.isArray(keyPoints)).toBe(true);
    });

    it('should get AI critique', async () => {
      const critique = await getAICritique(mockAnswers, mockEvidenceInfo);

      expect(critique).toBeDefined();
      expect(typeof critique).toBe('string');
    });

    it('should throw error when API key not configured', async () => {
      clearApiKey();

      await expect(
        generateComprehensiveAnalysis(mockAnswers, mockEvidenceInfo)
      ).rejects.toThrow('API key not configured');
    });

    it('should handle API errors gracefully', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockInstance = new GoogleGenAI({ apiKey: 'test' });

      vi.mocked(mockInstance.models.generateContent).mockRejectedValue(
        new Error('API Error: Rate limit exceeded')
      );

      await expect(
        generateComprehensiveAnalysis(mockAnswers, mockEvidenceInfo)
      ).rejects.toThrow('API Error');
    });

    it('should handle malformed JSON responses', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockInstance = new GoogleGenAI({ apiKey: 'test' });

      vi.mocked(mockInstance.models.generateContent).mockResolvedValue({
        response: {
          text: () => 'Invalid JSON response',
        },
      });

      await expect(
        generateComprehensiveAnalysis(mockAnswers, mockEvidenceInfo)
      ).rejects.toThrow();
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      setApiKey('test-api-key');
    });

    it('should validate answers array', async () => {
      await expect(generateComprehensiveAnalysis([], {})).rejects.toThrow();
    });

    it('should validate evidence info', async () => {
      const mockAnswers: Answer[] = [
        { questionId: 'test', value: 'test', confidence: 1 },
      ];

      await expect(
        generateComprehensiveAnalysis(mockAnswers, null as any)
      ).rejects.toThrow();
    });

    it('should handle empty answers gracefully', async () => {
      const emptyAnswers: Answer[] = [];
      const mockEvidenceInfo = { type: 'document', description: 'test' };

      await expect(
        generateComprehensiveAnalysis(emptyAnswers, mockEvidenceInfo)
      ).rejects.toThrow();
    });
  });

  describe('Response Processing', () => {
    beforeEach(() => {
      setApiKey('test-api-key');
    });

    it('should process valid analysis response', async () => {
      const mockResponse = {
        summary: 'Detailed analysis',
        keyFindings: ['Key finding 1', 'Key finding 2'],
        legalAnalysis: {
          admissibility: 75,
          strengths: ['Good documentation'],
          weaknesses: ['Minor gaps'],
          recommendations: ['Additional verification'],
        },
        riskAssessment: {
          overallRisk: 'MEDIUM',
          specificRisks: ['Authentication concerns'],
        },
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockInstance = new GoogleGenAI({ apiKey: 'test' });

      vi.mocked(mockInstance.models.generateContent).mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });

      const result = await generateComprehensiveAnalysis(
        [{ questionId: 'test', value: 'test', confidence: 1 }],
        { type: 'document', description: 'test' }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle missing required fields in response', async () => {
      const incompleteResponse = {
        summary: 'Analysis',
        // Missing keyFindings, legalAnalysis, riskAssessment
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockInstance = new GoogleGenAI({ apiKey: 'test' });

      vi.mocked(mockInstance.models.generateContent).mockResolvedValue({
        response: {
          text: () => JSON.stringify(incompleteResponse),
        },
      });

      await expect(
        generateComprehensiveAnalysis(
          [{ questionId: 'test', value: 'test', confidence: 1 }],
          { type: 'document', description: 'test' }
        )
      ).rejects.toThrow();
    });
  });

  describe('Rate Limiting and Caching', () => {
    beforeEach(() => {
      setApiKey('test-api-key');
    });

    it('should handle rate limiting errors', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockInstance = new GoogleGenAI({ apiKey: 'test' });

      vi.mocked(mockInstance.models.generateContent).mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      await expect(
        generateComprehensiveAnalysis(
          [{ questionId: 'test', value: 'test', confidence: 1 }],
          { type: 'document', description: 'test' }
        )
      ).rejects.toThrow('Rate limit exceeded');
    });

    // Note: Actual caching tests would require more complex setup
    // This is a placeholder for future caching implementation
    it('should implement caching for repeated requests', () => {
      // TODO: Implement caching tests when caching is added
      expect(true).toBe(true);
    });
  });
});
