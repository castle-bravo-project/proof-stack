import { beforeEach, describe, expect, it } from 'vitest';
import { LegalStandardsEngine } from '../../legalStandards';
import { EvidenceItem } from '../../types';

describe('LegalStandardsEngine', () => {
  let engine: LegalStandardsEngine;
  let mockEvidence: EvidenceItem;

  beforeEach(() => {
    engine = new LegalStandardsEngine();
    mockEvidence = {
      id: 'test-1',
      type: 'document',
      description: 'Test document evidence',
      source: 'Test source',
      dateCollected: new Date('2024-01-01'),
      metadata: {
        fileType: 'pdf',
        size: 1024,
        hash: 'abc123',
      },
    };
  });

  describe('FRE 901 - Authentication Requirements', () => {
    it('should evaluate authentication requirements correctly', () => {
      const result = engine.evaluateRule('FRE_901', mockEvidence);

      expect(result).toBeDefined();
      expect(result.ruleId).toBe('FRE_901');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.findings).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should require proper authentication for digital evidence', () => {
      const digitalEvidence: EvidenceItem = {
        ...mockEvidence,
        type: 'digital',
        metadata: {
          ...mockEvidence.metadata,
          digitalSignature: undefined,
          chainOfCustody: [],
        },
      };

      const result = engine.evaluateRule('FRE_901', digitalEvidence);
      expect(result.score).toBeLessThan(70); // Should flag missing authentication
      expect(result.findings.some((f) => f.description.includes('authentication'))).toBe(
        true
      );
    });

    it('should score higher with proper digital authentication', () => {
      const authenticatedEvidence: EvidenceItem = {
        ...mockEvidence,
        type: 'digital',
        metadata: {
          ...mockEvidence.metadata,
          digitalSignature: 'valid-signature',
          chainOfCustody: [
            {
              handler: 'Officer Smith',
              timestamp: new Date(),
              action: 'collected',
            },
          ],
        },
      };

      const result = engine.evaluateRule('FRE_901', authenticatedEvidence);
      expect(result.score).toBeGreaterThan(70);
    });
  });

  describe('FRE 902 - Self-Authentication', () => {
    it('should recognize self-authenticating documents', () => {
      const publicDocument: EvidenceItem = {
        ...mockEvidence,
        type: 'document',
        metadata: {
          ...mockEvidence.metadata,
          documentType: 'public_record',
          issuingAuthority: 'Federal Court',
        },
      };

      const result = engine.evaluateRule('FRE_902', publicDocument);
      expect(result.score).toBeGreaterThan(80);
      expect(
        result.findings.some((f) => f.description.includes('self-authenticating'))
      ).toBe(true);
    });

    it('should require additional authentication for non-public documents', () => {
      const privateDocument: EvidenceItem = {
        ...mockEvidence,
        metadata: {
          ...mockEvidence.metadata,
          documentType: 'private_correspondence',
        },
      };

      const result = engine.evaluateRule('FRE_902', privateDocument);
      expect(result.score).toBeLessThan(60);
    });
  });

  describe('FRE 1001-1008 - Best Evidence Rule', () => {
    it('should prefer original documents', () => {
      const originalDocument: EvidenceItem = {
        ...mockEvidence,
        metadata: {
          ...mockEvidence.metadata,
          isOriginal: true,
        },
      };

      const result = engine.evaluateRule('FRE_1002', originalDocument);
      expect(result.score).toBeGreaterThan(85);
    });

    it('should flag copies without proper justification', () => {
      const copyDocument: EvidenceItem = {
        ...mockEvidence,
        metadata: {
          ...mockEvidence.metadata,
          isOriginal: false,
          copyJustification: undefined,
        },
      };

      const result = engine.evaluateRule('FRE_1002', copyDocument);
      expect(result.score).toBeLessThan(60);
      expect(result.findings.some((f) => f.description.includes('original'))).toBe(true);
    });

    it('should accept copies with proper justification', () => {
      const justifiedCopy: EvidenceItem = {
        ...mockEvidence,
        metadata: {
          ...mockEvidence.metadata,
          isOriginal: false,
          copyJustification: 'Original destroyed in fire',
        },
      };

      const result = engine.evaluateRule('FRE_1002', justifiedCopy);
      expect(result.score).toBeGreaterThan(70);
    });
  });

  describe('FRE 803/804 - Hearsay Exceptions', () => {
    it('should identify business records exception', () => {
      const businessRecord: EvidenceItem = {
        ...mockEvidence,
        metadata: {
          ...mockEvidence.metadata,
          documentType: 'business_record',
          recordKeeper: 'Company ABC',
          regularCourse: true,
        },
      };

      const result = engine.evaluateRule('FRE_803_6', businessRecord);
      expect(result.score).toBeGreaterThan(75);
      expect(result.findings.some((f) => f.description.includes('business record'))).toBe(
        true
      );
    });

    it('should flag hearsay without exception', () => {
      const hearsayEvidence: EvidenceItem = {
        ...mockEvidence,
        type: 'statement',
        metadata: {
          ...mockEvidence.metadata,
          isHearsay: true,
          hearsayException: undefined,
        },
      };

      const result = engine.evaluateRule('FRE_803_6', hearsayEvidence);
      expect(result.score).toBeLessThan(50);
    });
  });

  describe('FRE 401-403 - Relevance', () => {
    it('should evaluate relevance properly', () => {
      const relevantEvidence: EvidenceItem = {
        ...mockEvidence,
        metadata: {
          ...mockEvidence.metadata,
          relevanceScore: 85,
          probativeValue: 'high',
        },
      };

      const result = engine.evaluateRule('FRE_401', relevantEvidence);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should flag prejudicial evidence', () => {
      const prejudicialEvidence: EvidenceItem = {
        ...mockEvidence,
        metadata: {
          ...mockEvidence.metadata,
          relevanceScore: 60,
          probativeValue: 'medium',
          prejudicialRisk: 'high',
        },
      };

      const result = engine.evaluateRule('FRE_403', prejudicialEvidence);
      expect(result.score).toBeLessThan(60);
      expect(result.findings.some((f) => f.description.includes('prejudicial'))).toBe(true);
    });
  });

  describe('Comprehensive Analysis', () => {
    it('should analyze all applicable rules', () => {
      const results = engine.analyzeEvidence(mockEvidence);

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);

      results.forEach((result) => {
        expect(result.ruleId).toBeDefined();
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.findings).toBeInstanceOf(Array);
        expect(result.recommendations).toBeInstanceOf(Array);
      });
    });

    it('should calculate overall compliance score', () => {
      const overallScore = engine.calculateOverallCompliance(mockEvidence);

      expect(overallScore).toBeGreaterThanOrEqual(0);
      expect(overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid rule IDs gracefully', () => {
      expect(() => {
        engine.evaluateRule('INVALID_RULE', mockEvidence);
      }).toThrow('Unknown rule');
    });

    it('should handle missing evidence metadata', () => {
      const incompleteEvidence: EvidenceItem = {
        ...mockEvidence,
        metadata: {},
      };

      const result = engine.evaluateRule('FRE_901', incompleteEvidence);
      expect(result.score).toBeLessThan(50);
      expect(
        result.findings.some(
          (f) => f.includes('missing') || f.includes('incomplete')
        )
      ).toBe(true);
    });
  });
});
