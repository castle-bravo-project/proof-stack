// Evidence Analysis Engine - Rule-based analysis with AI enhancement
import {
  ComplianceResult,
  Finding,
  LegalRule,
  LegalStandardsEngine,
} from './legalStandards';

export interface EvidenceMetadata {
  fileName?: string;
  fileSize?: number;
  createdDate?: Date;
  modifiedDate?: Date;
  accessedDate?: Date;
  hashMD5?: string;
  hashSHA256?: string;
  digitalSignature?: string;
  gpsCoordinates?: string;
  deviceInfo?: string;
  softwareVersion?: string;
  [key: string]: any;
}

export interface ChainOfCustody {
  entries: CustodyEntry[];
  isComplete: boolean;
  gaps: string[];
}

export interface CustodyEntry {
  timestamp: Date;
  handler: string;
  action: 'collected' | 'transferred' | 'analyzed' | 'stored' | 'accessed';
  location: string;
  purpose: string;
  signature?: string;
  witnessSignature?: string;
}

export interface EvidenceItem {
  id: string;
  name: string;
  type: string;
  description: string;
  metadata: EvidenceMetadata;
  chainOfCustody: ChainOfCustody;
  isOriginal: boolean;
  parentEvidence?: string; // For copies/derivatives
  jurisdiction: 'Federal' | 'Indiana' | 'Both';
}

export interface AnalysisResult {
  evidenceId: string;
  overallScore: number;
  maxScore: number;
  admissibilityLikelihood: 'High' | 'Medium' | 'Low';
  ruleCompliance: ComplianceResult[];
  criticalIssues: Finding[];
  recommendations: string[];
  citations: string[];
  generatedAt: Date;
}

export class EvidenceAnalyzer {
  private legalEngine: LegalStandardsEngine;

  constructor() {
    this.legalEngine = new LegalStandardsEngine();
  }

  async analyzeEvidence(evidence: EvidenceItem): Promise<AnalysisResult> {
    const ruleCompliance: ComplianceResult[] = [];
    const criticalIssues: Finding[] = [];
    const recommendations: string[] = [];

    // 1. Authentication Analysis (FRE/IRE 901-902)
    const authResult = this.analyzeAuthentication(evidence);
    ruleCompliance.push(authResult);

    // 2. Best Evidence Rule Analysis (FRE/IRE 1001-1008)
    const bestEvidenceResult = this.analyzeBestEvidenceRule(evidence);
    ruleCompliance.push(bestEvidenceResult);

    // 3. Relevance Analysis (FRE/IRE 401-403)
    const relevanceResult = this.analyzeRelevance(evidence);
    ruleCompliance.push(relevanceResult);

    // 4. Hearsay Analysis (FRE/IRE 803-804)
    const hearsayResult = this.analyzeHearsay(evidence);
    ruleCompliance.push(hearsayResult);

    // Collect critical issues and recommendations
    ruleCompliance.forEach((result) => {
      criticalIssues.push(
        ...result.findings.filter((f) => f.impact === 'high')
      );
      recommendations.push(...result.recommendations);
    });

    // Calculate overall score
    const totalScore = ruleCompliance.reduce(
      (sum, result) => sum + result.score,
      0
    );
    const maxScore = ruleCompliance.reduce(
      (sum, result) => sum + result.maxScore,
      0
    );
    const overallScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Determine admissibility likelihood
    const admissibilityLikelihood = this.calculateAdmissibilityLikelihood(
      overallScore,
      criticalIssues
    );

    // Generate citations
    const ruleIds = ruleCompliance.map((r) => r.ruleId);
    const citations = this.legalEngine.generateCitations(ruleIds);

    return {
      evidenceId: evidence.id,
      overallScore,
      maxScore,
      admissibilityLikelihood,
      ruleCompliance,
      criticalIssues,
      recommendations: [...new Set(recommendations)], // Remove duplicates
      citations,
      generatedAt: new Date(),
    };
  }

  private analyzeAuthentication(evidence: EvidenceItem): ComplianceResult {
    const ruleId = evidence.jurisdiction === 'Indiana' ? 'ire-901' : 'fre-901';
    const findings: Finding[] = [];
    const recommendations: string[] = [];
    let score = 0;
    const maxScore = 100;

    // Chain of Custody Analysis (25 points)
    const custodyScore = this.analyzeChainOfCustody(evidence.chainOfCustody);
    score += custodyScore.score;
    findings.push(...custodyScore.findings);
    recommendations.push(...custodyScore.recommendations);

    // Technical Authentication (25 points)
    const techScore = this.analyzeTechnicalAuthentication(evidence.metadata);
    score += techScore.score;
    findings.push(...techScore.findings);
    recommendations.push(...techScore.recommendations);

    // Metadata Preservation (25 points)
    const metadataScore = this.analyzeMetadataPreservation(evidence.metadata);
    score += metadataScore.score;
    findings.push(...metadataScore.findings);
    recommendations.push(...metadataScore.recommendations);

    // Collection Process (25 points)
    const collectionScore = this.analyzeCollectionProcess(evidence);
    score += collectionScore.score;
    findings.push(...collectionScore.findings);
    recommendations.push(...collectionScore.recommendations);

    return {
      ruleId,
      compliant: score >= 70, // 70% threshold for compliance
      score,
      maxScore,
      findings,
      recommendations,
    };
  }

  private analyzeChainOfCustody(custody: ChainOfCustody): {
    score: number;
    findings: Finding[];
    recommendations: string[];
  } {
    const findings: Finding[] = [];
    const recommendations: string[] = [];
    let score = 0;

    if (custody.isComplete) {
      score += 15;
      findings.push({
        type: 'strength',
        description: 'Complete chain of custody documented',
        impact: 'medium',
        ruleReference: 'FRE 901(b)(1)',
      });
    } else {
      findings.push({
        type: 'weakness',
        description: `Chain of custody gaps identified: ${custody.gaps.join(
          ', '
        )}`,
        impact: 'high',
        ruleReference: 'FRE 901(b)(1)',
      });
      recommendations.push(
        'Document all gaps in chain of custody and provide explanations'
      );
    }

    // Check for required elements in custody entries
    const hasCollection = custody.entries.some((e) => e.action === 'collected');
    const hasSignatures = custody.entries.every((e) => e.signature);
    const hasWitnesses = custody.entries.some((e) => e.witnessSignature);

    if (hasCollection) score += 3;
    if (hasSignatures) score += 4;
    if (hasWitnesses) score += 3;

    if (!hasCollection) {
      recommendations.push('Document initial collection of evidence');
    }
    if (!hasSignatures) {
      recommendations.push('Ensure all custody transfers are signed');
    }

    return { score, findings, recommendations };
  }

  private analyzeTechnicalAuthentication(metadata: EvidenceMetadata): {
    score: number;
    findings: Finding[];
    recommendations: string[];
  } {
    const findings: Finding[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Hash verification (10 points)
    if (metadata.hashSHA256 || metadata.hashMD5) {
      score += 10;
      findings.push({
        type: 'strength',
        description:
          'Cryptographic hash values present for integrity verification',
        impact: 'medium',
        ruleReference: 'FRE 901(b)(9)',
      });
    } else {
      findings.push({
        type: 'missing',
        description: 'No cryptographic hash values for integrity verification',
        impact: 'high',
        ruleReference: 'FRE 901(b)(9)',
      });
      recommendations.push(
        'Generate and document SHA-256 hash values for all digital evidence'
      );
    }

    // Digital signatures (8 points)
    if (metadata.digitalSignature) {
      score += 8;
      findings.push({
        type: 'strength',
        description: 'Digital signature present',
        impact: 'medium',
        ruleReference: 'FRE 902(14)',
      });
    } else {
      recommendations.push(
        'Consider implementing digital signatures for evidence authentication'
      );
    }

    // Timestamps (7 points)
    if (metadata.createdDate && metadata.modifiedDate) {
      score += 7;
      findings.push({
        type: 'strength',
        description: 'Creation and modification timestamps preserved',
        impact: 'low',
        ruleReference: 'FRE 901(b)(4)',
      });
    } else {
      recommendations.push('Preserve all available timestamp information');
    }

    return { score, findings, recommendations };
  }

  private analyzeMetadataPreservation(metadata: EvidenceMetadata): {
    score: number;
    findings: Finding[];
    recommendations: string[];
  } {
    const findings: Finding[] = [];
    const recommendations: string[] = [];
    let score = 0;

    const requiredFields = [
      'fileName',
      'fileSize',
      'createdDate',
      'modifiedDate',
    ];
    const presentFields = requiredFields.filter(
      (field) => metadata[field] !== undefined
    );

    score = (presentFields.length / requiredFields.length) * 25;

    if (score >= 20) {
      findings.push({
        type: 'strength',
        description: 'Essential metadata fields preserved',
        impact: 'medium',
        ruleReference: 'FRE 901(b)(4)',
      });
    } else {
      findings.push({
        type: 'weakness',
        description: 'Missing essential metadata fields',
        impact: 'medium',
        ruleReference: 'FRE 901(b)(4)',
      });
      recommendations.push(
        'Preserve all available metadata during evidence collection'
      );
    }

    return { score, findings, recommendations };
  }

  private analyzeCollectionProcess(evidence: EvidenceItem): {
    score: number;
    findings: Finding[];
    recommendations: string[];
  } {
    const findings: Finding[] = [];
    const recommendations: string[] = [];
    let score = 15; // Base score for having collection documentation

    // Check for device information
    if (evidence.metadata.deviceInfo) {
      score += 5;
      findings.push({
        type: 'strength',
        description: 'Device information documented',
        impact: 'low',
        ruleReference: 'FRE 901(b)(9)',
      });
    }

    // Check for software version
    if (evidence.metadata.softwareVersion) {
      score += 5;
      findings.push({
        type: 'strength',
        description: 'Collection software version documented',
        impact: 'low',
        ruleReference: 'FRE 901(b)(9)',
      });
    }

    return { score, findings, recommendations };
  }

  private analyzeBestEvidenceRule(evidence: EvidenceItem): ComplianceResult {
    const ruleId = 'fre-1001';
    const findings: Finding[] = [];
    const recommendations: string[] = [];
    let score = 0;
    const maxScore = 100;

    if (evidence.isOriginal) {
      score = 100;
      findings.push({
        type: 'strength',
        description: 'Original evidence presented',
        impact: 'high',
        ruleReference: 'FRE 1002',
      });
    } else {
      score = 60; // Copies can still be admissible
      findings.push({
        type: 'concern',
        description:
          'Copy of evidence presented - original required unless exception applies',
        impact: 'medium',
        ruleReference: 'FRE 1002',
      });
      recommendations.push(
        'Document reason why original is not available or provide original if possible'
      );
    }

    return {
      ruleId,
      compliant: score >= 60,
      score,
      maxScore,
      findings,
      recommendations,
    };
  }

  private analyzeRelevance(evidence: EvidenceItem): ComplianceResult {
    // This would typically require case-specific information
    // For now, providing a framework
    const ruleId = 'fre-401';
    const findings: Finding[] = [];
    const recommendations: string[] = [];

    findings.push({
      type: 'concern',
      description: 'Relevance analysis requires case-specific context',
      impact: 'medium',
      ruleReference: 'FRE 401',
    });

    recommendations.push(
      'Provide detailed explanation of how evidence relates to facts in issue'
    );
    recommendations.push(
      'Consider FRE 403 balancing test for probative value vs. prejudicial effect'
    );

    return {
      ruleId,
      compliant: true, // Assume relevant unless proven otherwise
      score: 80,
      maxScore: 100,
      findings,
      recommendations,
    };
  }

  private analyzeHearsay(evidence: EvidenceItem): ComplianceResult {
    const ruleId = 'fre-803';
    const findings: Finding[] = [];
    const recommendations: string[] = [];

    // Basic hearsay analysis framework
    findings.push({
      type: 'concern',
      description:
        'Hearsay analysis requires examination of specific statements within evidence',
      impact: 'medium',
      ruleReference: 'FRE 801',
    });

    recommendations.push(
      'Identify any out-of-court statements offered for truth of matter asserted'
    );
    recommendations.push(
      'Determine if any hearsay exceptions apply (FRE 803, 804, 807)'
    );

    return {
      ruleId,
      compliant: true, // Framework only
      score: 75,
      maxScore: 100,
      findings,
      recommendations,
    };
  }

  private calculateAdmissibilityLikelihood(
    score: number,
    criticalIssues: Finding[]
  ): 'High' | 'Medium' | 'Low' {
    const highImpactIssues = criticalIssues.filter(
      (issue) => issue.impact === 'high'
    ).length;

    if (score >= 85 && highImpactIssues === 0) return 'High';
    if (score >= 70 && highImpactIssues <= 1) return 'Medium';
    return 'Low';
  }

  // Generate structured prompts for AI analysis that include legal context
  generateLegallyGroundedPrompt(
    evidence: EvidenceItem,
    analysisType: 'critique' | 'suggestions'
  ): string {
    const relevantRules = this.getRelevantRules(evidence);
    const ruleContext = relevantRules
      .map(
        (rule) =>
          `${rule.ruleNumber}: ${rule.title}\n${
            rule.description
          }\nRequirements: ${rule.requirements.join(', ')}`
      )
      .join('\n\n');

    if (analysisType === 'critique') {
      return `As a legal expert specializing in evidence law, analyze the following evidence submission for compliance with Federal Rules of Evidence and Indiana Rules of Evidence.

RELEVANT LEGAL STANDARDS:
${ruleContext}

EVIDENCE DETAILS:
Type: ${evidence.type}
Description: ${evidence.description}
Jurisdiction: ${evidence.jurisdiction}
Is Original: ${evidence.isOriginal}

CHAIN OF CUSTODY STATUS:
Complete: ${evidence.chainOfCustody.isComplete}
Entries: ${evidence.chainOfCustody.entries.length}
${
  evidence.chainOfCustody.gaps.length > 0
    ? `Gaps: ${evidence.chainOfCustody.gaps.join(', ')}`
    : ''
}

METADATA AVAILABLE:
${Object.keys(evidence.metadata)
  .filter((key) => evidence.metadata[key])
  .join(', ')}

Please provide a detailed analysis focusing on:
1. Specific rule compliance issues
2. Authentication challenges under FRE/IRE 901-902
3. Best Evidence Rule considerations under FRE/IRE 1001-1008
4. Chain of custody concerns
5. Technical authentication requirements
6. Specific recommendations with rule citations

Format your response as JSON with sections for strengths, weaknesses, and recommendations, each with specific rule citations.`;
    } else {
      return `As a legal expert, provide specific suggestions for strengthening this evidence submission for court admissibility.

RELEVANT LEGAL STANDARDS:
${ruleContext}

EVIDENCE TYPE: ${evidence.type}
JURISDICTION: ${evidence.jurisdiction}

Focus on actionable steps that address:
1. Authentication requirements (FRE/IRE 901-902)
2. Chain of custody documentation
3. Technical verification methods
4. Metadata preservation
5. Best Evidence Rule compliance

Provide specific, practical recommendations with rule citations.`;
    }
  }

  private getRelevantRules(evidence: EvidenceItem): LegalRule[] {
    const rules: LegalRule[] = [];

    // Always include authentication rules
    rules.push(...this.legalEngine.getRulesByCategory('Authentication'));

    // Include Best Evidence Rule for documents/digital evidence
    if (
      ['Computer', 'Hard Drive', 'USB Drive', 'Email', 'Social Media'].includes(
        evidence.type
      )
    ) {
      rules.push(...this.legalEngine.getRulesByCategory('BestEvidence'));
    }

    // Include relevance rules
    rules.push(...this.legalEngine.getRulesByCategory('Relevance'));

    // Filter by jurisdiction
    return rules.filter(
      (rule) =>
        rule.jurisdiction === 'Both' ||
        rule.jurisdiction === evidence.jurisdiction
    );
  }
}
