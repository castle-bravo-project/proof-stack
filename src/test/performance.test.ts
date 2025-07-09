import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LegalStandardsEngine } from '../../legalStandards';
import { generateComprehensiveAnalysis } from '../../services/geminiService';
import { Answer, EvidenceItem } from '../../types';

// Mock the Gemini service for performance tests
vi.mock('../../services/geminiService', () => ({
  generateComprehensiveAnalysis: vi.fn().mockResolvedValue({
    summary: 'Performance test analysis',
    keyFindings: ['Finding 1', 'Finding 2'],
    legalAnalysis: {
      admissibility: 85,
      strengths: ['Strong authentication'],
      weaknesses: ['Minor gaps'],
      recommendations: ['Additional documentation'],
    },
    riskAssessment: {
      overallRisk: 'LOW',
      specificRisks: ['Minimal concerns'],
    },
  }),
  setApiKey: vi.fn(),
  isApiKeyConfigured: vi.fn().mockReturnValue(true),
}));

describe('Performance Tests', () => {
  let engine: LegalStandardsEngine;

  beforeEach(() => {
    engine = new LegalStandardsEngine();
    vi.clearAllMocks();
  });

  describe('Legal Standards Engine Performance', () => {
    const createMockEvidence = (id: string): EvidenceItem => ({
      id,
      type: 'document',
      description: `Test evidence ${id}`,
      source: `Test source ${id}`,
      dateCollected: new Date(),
      metadata: {
        fileType: 'pdf',
        size: 1024,
        hash: `hash-${id}`,
        isOriginal: true,
        digitalSignature: 'valid-signature',
        chainOfCustody: [
          {
            handler: 'Officer Smith',
            timestamp: new Date(),
            action: 'collected',
          },
        ],
      },
    });

    it('should analyze single evidence item quickly', () => {
      const evidence = createMockEvidence('perf-1');

      const startTime = performance.now();
      const results = engine.analyzeEvidence(evidence);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle multiple evidence items efficiently', () => {
      const evidenceItems = Array.from({ length: 100 }, (_, i) =>
        createMockEvidence(`perf-${i}`)
      );

      const startTime = performance.now();

      const allResults = evidenceItems.map((evidence) =>
        engine.analyzeEvidence(evidence)
      );

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete 100 items in under 1 second
      expect(allResults).toHaveLength(100);
      allResults.forEach((results) => {
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBeGreaterThan(0);
      });
    });

    it('should calculate compliance scores efficiently for large datasets', () => {
      const evidenceItems = Array.from({ length: 500 }, (_, i) =>
        createMockEvidence(`compliance-${i}`)
      );

      const startTime = performance.now();

      const scores = evidenceItems.map((evidence) =>
        engine.calculateOverallCompliance(evidence)
      );

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete 500 items in under 2 seconds
      expect(scores).toHaveLength(500);
      scores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('should handle complex evidence metadata without performance degradation', () => {
      const complexEvidence: EvidenceItem = {
        id: 'complex-evidence',
        type: 'digital',
        description: 'Complex evidence with extensive metadata',
        source: 'Multi-source collection',
        dateCollected: new Date(),
        metadata: {
          fileType: 'pdf',
          size: 10485760, // 10MB
          hash: 'complex-hash-with-long-string-' + 'x'.repeat(1000),
          isOriginal: false,
          copyJustification: 'Original destroyed in incident',
          digitalSignature: 'complex-signature-' + 'y'.repeat(500),
          chainOfCustody: Array.from({ length: 50 }, (_, i) => ({
            handler: `Handler ${i}`,
            timestamp: new Date(Date.now() - i * 86400000),
            action: `Action ${i}`,
            notes: `Detailed notes for action ${i} `.repeat(10),
          })),
          documentType: 'business_record',
          recordKeeper: 'Large Corporation Inc.',
          regularCourse: true,
          relevanceScore: 85,
          probativeValue: 'high',
          prejudicialRisk: 'low',
          hearsayException: 'business_records',
          additionalMetadata: Object.fromEntries(
            Array.from({ length: 100 }, (_, i) => [
              `field${i}`,
              `value${i}`.repeat(10),
            ])
          ),
        },
      };

      const startTime = performance.now();
      const results = engine.analyzeEvidence(complexEvidence);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should handle complex data in under 100ms
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('AI Service Performance', () => {
    const createMockAnswers = (count: number): Answer[] =>
      Array.from({ length: count }, (_, i) => ({
        questionId: `question-${i}`,
        value: `Answer ${i}`,
        confidence: 0.8 + (i % 3) * 0.1,
      }));

    const mockEvidenceInfo = {
      type: 'document',
      description: 'Performance test evidence',
      source: 'Test source',
    };

    it('should generate analysis within reasonable time', async () => {
      const answers = createMockAnswers(20);

      const startTime = performance.now();
      const result = await generateComprehensiveAnalysis(
        answers,
        mockEvidenceInfo
      );
      const endTime = performance.now();

      // Note: This is mocked, so it should be very fast
      // In real scenarios, this would test actual API response times
      expect(endTime - startTime).toBeLessThan(100);
      expect(result).toBeDefined();
    });

    it('should handle large answer sets efficiently', async () => {
      const largeAnswerSet = createMockAnswers(100);

      const startTime = performance.now();
      const result = await generateComprehensiveAnalysis(
        largeAnswerSet,
        mockEvidenceInfo
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
      expect(result).toBeDefined();
    });

    it('should process concurrent requests efficiently', async () => {
      const answers = createMockAnswers(10);
      const concurrentRequests = 10;

      const startTime = performance.now();

      const promises = Array.from({ length: concurrentRequests }, () =>
        generateComprehensiveAnalysis(answers, mockEvidenceInfo)
      );

      const results = await Promise.all(promises);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500); // All 10 requests in under 500ms
      expect(results).toHaveLength(concurrentRequests);
      results.forEach((result) => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during repeated operations', () => {
      const evidence = {
        id: 'memory-test',
        type: 'document' as const,
        description: 'Memory test evidence',
        source: 'Test source',
        dateCollected: new Date(),
        metadata: {
          fileType: 'pdf',
          size: 1024,
          hash: 'test-hash',
        },
      };

      // Perform many operations to test for memory leaks
      for (let i = 0; i < 1000; i++) {
        const results = engine.analyzeEvidence(evidence);
        const score = engine.calculateOverallCompliance(evidence);

        // Verify operations complete successfully
        expect(results).toBeInstanceOf(Array);
        expect(score).toBeGreaterThanOrEqual(0);

        // Clear references to help GC
        results.length = 0;
      }

      // If we get here without running out of memory, the test passes
      expect(true).toBe(true);
    });

    it('should handle large data structures efficiently', () => {
      const largeEvidence: EvidenceItem = {
        id: 'large-evidence',
        type: 'digital',
        description: 'Large evidence item',
        source: 'Large source',
        dateCollected: new Date(),
        metadata: {
          fileType: 'pdf',
          size: 104857600, // 100MB
          hash: 'large-hash',
          chainOfCustody: Array.from({ length: 10000 }, (_, i) => ({
            handler: `Handler ${i}`,
            timestamp: new Date(),
            action: `Action ${i}`,
          })),
          additionalMetadata: Object.fromEntries(
            Array.from({ length: 10000 }, (_, i) => [`field${i}`, `value${i}`])
          ),
        },
      };

      const startTime = performance.now();
      const results = engine.analyzeEvidence(largeEvidence);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500); // Should handle large data in under 500ms
      expect(results).toBeInstanceOf(Array);
    });
  });

  describe('Scalability', () => {
    it('should maintain performance with increasing rule complexity', () => {
      const evidence = {
        id: 'scalability-test',
        type: 'document' as const,
        description: 'Scalability test evidence',
        source: 'Test source',
        dateCollected: new Date(),
        metadata: {
          fileType: 'pdf',
          size: 1024,
          hash: 'test-hash',
          // Add metadata that triggers multiple rules
          isOriginal: false,
          copyJustification: 'Original lost',
          documentType: 'business_record',
          recordKeeper: 'Test Corp',
          regularCourse: true,
          isHearsay: true,
          hearsayException: 'business_records',
          relevanceScore: 75,
          probativeValue: 'medium',
          prejudicialRisk: 'low',
          digitalSignature: 'valid',
          chainOfCustody: [
            {
              handler: 'Officer 1',
              timestamp: new Date(),
              action: 'collected',
            },
            {
              handler: 'Officer 2',
              timestamp: new Date(),
              action: 'transferred',
            },
          ],
        },
      };

      const startTime = performance.now();
      const results = engine.analyzeEvidence(evidence);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(results.length).toBeGreaterThan(5); // Should trigger multiple rules
    });

    it('should handle batch processing efficiently', () => {
      const batchSize = 1000;
      const evidenceBatch = Array.from({ length: batchSize }, (_, i) => ({
        id: `batch-${i}`,
        type: 'document' as const,
        description: `Batch evidence ${i}`,
        source: `Source ${i}`,
        dateCollected: new Date(),
        metadata: {
          fileType: 'pdf',
          size: 1024 + i,
          hash: `hash-${i}`,
        },
      }));

      const startTime = performance.now();

      const batchResults = evidenceBatch.map((evidence) => ({
        evidence: evidence.id,
        analysis: engine.analyzeEvidence(evidence),
        compliance: engine.calculateOverallCompliance(evidence),
      }));

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(5000); // 1000 items in under 5 seconds
      expect(batchResults).toHaveLength(batchSize);

      batchResults.forEach((result) => {
        expect(result.analysis).toBeInstanceOf(Array);
        expect(result.compliance).toBeGreaterThanOrEqual(0);
        expect(result.compliance).toBeLessThanOrEqual(100);
      });
    });
  });
});
