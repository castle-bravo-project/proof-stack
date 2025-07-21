// Document Analysis Engine
// Automated analysis for original vs copy determination, hearsay identification, relevance scoring, and privilege detection

export interface DocumentAnalysisResult {
  documentId: string;
  originalityAnalysis: OriginalityAnalysis;
  hearsayAnalysis: HearsayAnalysis;
  relevanceAnalysis: RelevanceAnalysis;
  privilegeAnalysis: PrivilegeAnalysis;
  overallScore: number;
  recommendations: string[];
  legalCitations: string[];
  analysisTimestamp: Date;
}

export interface OriginalityAnalysis {
  isOriginal: boolean;
  confidence: number; // 0-100
  indicators: OriginalityIndicator[];
  bestEvidenceCompliance: 'compliant' | 'exception_applies' | 'non_compliant';
  recommendations: string[];
}

export interface OriginalityIndicator {
  type: 'metadata' | 'digital_signature' | 'creation_method' | 'file_properties' | 'chain_custody';
  description: string;
  supportsOriginality: boolean;
  weight: number; // 1-10
}

export interface HearsayAnalysis {
  containsHearsay: boolean;
  hearsayStatements: HearsayStatement[];
  applicableExceptions: HearsayException[];
  overallAdmissibility: 'admissible' | 'partially_admissible' | 'inadmissible';
  recommendations: string[];
}

export interface HearsayStatement {
  id: string;
  text: string;
  location: string; // page, line, etc.
  declarant: string;
  isOutOfCourt: boolean;
  offeredForTruth: boolean;
  hearsayLevel: number; // 1 = direct hearsay, 2+ = multiple levels
  potentialExceptions: string[];
}

export interface HearsayException {
  rule: string; // FRE 803(1), etc.
  name: string;
  description: string;
  requirements: string[];
  applicableStatements: string[];
  likelihood: 'high' | 'medium' | 'low';
}

export interface RelevanceAnalysis {
  relevanceScore: number; // 0-100
  relevantFactors: RelevanceFactor[];
  prejudiceRisk: PrejudiceAssessment;
  rule403Analysis: Rule403Analysis;
  recommendations: string[];
}

export interface RelevanceFactor {
  factor: string;
  description: string;
  relevanceToCase: string;
  probativeValue: number; // 1-10
  supportingEvidence: string[];
}

export interface PrejudiceAssessment {
  unfairPrejudice: number; // 1-10
  confusionRisk: number; // 1-10
  misleadingRisk: number; // 1-10
  timeWaste: number; // 1-10
  cumulativeEvidence: number; // 1-10
  overallRisk: number; // 1-10
}

export interface Rule403Analysis {
  probativeValue: number; // 1-10
  prejudicialEffect: number; // 1-10
  balancingTest: 'probative_outweighs' | 'substantially_outweighed' | 'close_call';
  recommendation: 'admit' | 'exclude' | 'limit' | 'further_analysis';
  limitingInstructions?: string[];
}

export interface PrivilegeAnalysis {
  privilegeClaims: PrivilegeClaim[];
  overallPrivileged: boolean;
  redactionRequired: boolean;
  recommendations: string[];
}

export interface PrivilegeClaim {
  type: 'attorney_client' | 'work_product' | 'spousal' | 'physician_patient' | 'clergy_penitent' | 'executive' | 'other';
  description: string;
  basis: string;
  strength: 'strong' | 'moderate' | 'weak';
  affectedContent: ContentLocation[];
  waived: boolean;
  waiverReason?: string;
}

export interface ContentLocation {
  page?: number;
  paragraph?: number;
  line?: number;
  startPosition?: number;
  endPosition?: number;
  description: string;
}

export class DocumentAnalysisEngine {
  
  async analyzeDocument(
    documentContent: string,
    documentMetadata: any,
    caseContext?: CaseContext
  ): Promise<DocumentAnalysisResult> {
    
    const documentId = this.generateDocumentId();
    
    // Perform all analyses
    const originalityAnalysis = await this.analyzeOriginality(documentContent, documentMetadata);
    const hearsayAnalysis = await this.analyzeHearsay(documentContent);
    const relevanceAnalysis = await this.analyzeRelevance(documentContent, caseContext);
    const privilegeAnalysis = await this.analyzePrivilege(documentContent);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(
      originalityAnalysis,
      hearsayAnalysis,
      relevanceAnalysis,
      privilegeAnalysis
    );
    
    // Generate comprehensive recommendations
    const recommendations = this.generateRecommendations(
      originalityAnalysis,
      hearsayAnalysis,
      relevanceAnalysis,
      privilegeAnalysis
    );
    
    // Compile legal citations
    const legalCitations = this.compileLegalCitations();
    
    return {
      documentId,
      originalityAnalysis,
      hearsayAnalysis,
      relevanceAnalysis,
      privilegeAnalysis,
      overallScore,
      recommendations,
      legalCitations,
      analysisTimestamp: new Date()
    };
  }

  // Originality Analysis - Best Evidence Rule (FRE 1001-1008)
  private async analyzeOriginality(_content: string, metadata: any): Promise<OriginalityAnalysis> {
    const indicators: OriginalityIndicator[] = [];
    
    // Check metadata indicators
    if (metadata.createdDate && metadata.modifiedDate) {
      const isUnmodified = metadata.createdDate.getTime() === metadata.modifiedDate.getTime();
      indicators.push({
        type: 'metadata',
        description: isUnmodified ? 'Creation and modification dates match' : 'Document has been modified',
        supportsOriginality: isUnmodified,
        weight: 7
      });
    }
    
    // Check for digital signatures
    if (metadata.digitalSignature) {
      indicators.push({
        type: 'digital_signature',
        description: 'Document contains digital signature',
        supportsOriginality: true,
        weight: 9
      });
    }
    
    // Check creation method
    if (metadata.creatingApplication) {
      const isNativeFormat = this.isNativeApplicationFormat(metadata.creatingApplication, metadata.fileType);
      indicators.push({
        type: 'creation_method',
        description: isNativeFormat ? 'Created in native application format' : 'Converted or exported format',
        supportsOriginality: isNativeFormat,
        weight: 6
      });
    }
    
    // Calculate confidence
    const totalWeight = indicators.reduce((sum, ind) => sum + ind.weight, 0);
    const supportingWeight = indicators
      .filter(ind => ind.supportsOriginality)
      .reduce((sum, ind) => sum + ind.weight, 0);
    
    const confidence = totalWeight > 0 ? (supportingWeight / totalWeight) * 100 : 50;
    const isOriginal = confidence >= 70;
    
    // Determine Best Evidence Rule compliance
    let bestEvidenceCompliance: 'compliant' | 'exception_applies' | 'non_compliant';
    if (isOriginal) {
      bestEvidenceCompliance = 'compliant';
    } else if (this.hasValidException(metadata)) {
      bestEvidenceCompliance = 'exception_applies';
    } else {
      bestEvidenceCompliance = 'non_compliant';
    }
    
    const recommendations = this.generateOriginalityRecommendations(isOriginal, indicators);
    
    return {
      isOriginal,
      confidence,
      indicators,
      bestEvidenceCompliance,
      recommendations
    };
  }

  // Hearsay Analysis (FRE 801-807)
  private async analyzeHearsay(content: string): Promise<HearsayAnalysis> {
    const hearsayStatements: HearsayStatement[] = [];
    const applicableExceptions: HearsayException[] = [];
    
    // Pattern matching for common hearsay indicators
    const hearsayPatterns = [
      { pattern: /said that|told me|stated that|reported that/gi, type: 'direct_statement' },
      { pattern: /according to|as per|based on what/gi, type: 'indirect_reference' },
      { pattern: /email from|letter from|message from/gi, type: 'written_statement' },
      { pattern: /witness testified|deponent stated/gi, type: 'testimony_reference' }
    ];
    
    // Find potential hearsay statements
    hearsayPatterns.forEach(({ pattern, type }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match, index) => {
          const statementId = `hearsay_${type}_${index}`;
          const context = this.extractContext(content, match);
          
          hearsayStatements.push({
            id: statementId,
            text: context,
            location: `Pattern match: ${match}`,
            declarant: 'Unknown', // Would need more sophisticated parsing
            isOutOfCourt: true, // Assume true for pattern matches
            offeredForTruth: true, // Would need context analysis
            hearsayLevel: 1,
            potentialExceptions: this.identifyPotentialExceptions(context)
          });
        });
      }
    });
    
    // Analyze applicable exceptions
    applicableExceptions.push(...this.analyzeHearsayExceptions(hearsayStatements));
    
    // Determine overall admissibility
    const admissibleStatements = hearsayStatements.filter(stmt => 
      stmt.potentialExceptions.length > 0
    ).length;
    
    let overallAdmissibility: 'admissible' | 'partially_admissible' | 'inadmissible';
    if (hearsayStatements.length === 0) {
      overallAdmissibility = 'admissible';
    } else if (admissibleStatements === hearsayStatements.length) {
      overallAdmissibility = 'admissible';
    } else if (admissibleStatements > 0) {
      overallAdmissibility = 'partially_admissible';
    } else {
      overallAdmissibility = 'inadmissible';
    }
    
    const recommendations = this.generateHearsayRecommendations(hearsayStatements, applicableExceptions);
    
    return {
      containsHearsay: hearsayStatements.length > 0,
      hearsayStatements,
      applicableExceptions,
      overallAdmissibility,
      recommendations
    };
  }

  // Relevance Analysis (FRE 401-403)
  private async analyzeRelevance(content: string, caseContext?: CaseContext): Promise<RelevanceAnalysis> {
    const relevantFactors: RelevanceFactor[] = [];
    
    // If no case context provided, use generic analysis
    if (!caseContext) {
      relevantFactors.push({
        factor: 'Content Analysis Required',
        description: 'Case-specific context needed for relevance determination',
        relevanceToCase: 'Cannot determine without case facts',
        probativeValue: 5,
        supportingEvidence: ['Document content available for analysis']
      });
    } else {
      // Analyze relevance based on case context
      relevantFactors.push(...this.analyzeRelevanceFactors(content, caseContext));
    }
    
    // Calculate relevance score
    const relevanceScore = relevantFactors.length > 0 
      ? relevantFactors.reduce((sum, factor) => sum + factor.probativeValue, 0) / relevantFactors.length * 10
      : 50;
    
    // Assess prejudice risk
    const prejudiceRisk = this.assessPrejudiceRisk(content);
    
    // Perform Rule 403 analysis
    const rule403Analysis = this.performRule403Analysis(relevanceScore, prejudiceRisk);
    
    const recommendations = this.generateRelevanceRecommendations(relevanceScore, rule403Analysis);
    
    return {
      relevanceScore,
      relevantFactors,
      prejudiceRisk,
      rule403Analysis,
      recommendations
    };
  }

  // Privilege Analysis
  private async analyzePrivilege(content: string): Promise<PrivilegeAnalysis> {
    const privilegeClaims: PrivilegeClaim[] = [];
    
    // Attorney-Client Privilege patterns
    const attorneyClientPatterns = [
      /attorney.{0,20}client/gi,
      /legal advice/gi,
      /privileged.{0,10}confidential/gi,
      /counsel.{0,20}communication/gi
    ];
    
    attorneyClientPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        privilegeClaims.push({
          type: 'attorney_client',
          description: 'Potential attorney-client privileged communication',
          basis: 'Communication appears to be between attorney and client for legal advice',
          strength: 'moderate',
          affectedContent: [{ description: `Pattern: ${pattern.source}` }],
          waived: false
        });
      }
    });
    
    // Work Product patterns
    const workProductPatterns = [
      /prepared.{0,20}litigation/gi,
      /trial preparation/gi,
      /litigation strategy/gi,
      /attorney work product/gi
    ];
    
    workProductPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        privilegeClaims.push({
          type: 'work_product',
          description: 'Potential attorney work product',
          basis: 'Document appears to be prepared in anticipation of litigation',
          strength: 'moderate',
          affectedContent: [{ description: `Pattern: ${pattern.source}` }],
          waived: false
        });
      }
    });
    
    const overallPrivileged = privilegeClaims.some(claim => claim.strength === 'strong');
    const redactionRequired = privilegeClaims.length > 0;
    
    const recommendations = this.generatePrivilegeRecommendations(privilegeClaims);
    
    return {
      privilegeClaims,
      overallPrivileged,
      redactionRequired,
      recommendations
    };
  }

  // Helper methods
  private isNativeApplicationFormat(app: string, fileType: string): boolean {
    const nativeFormats: Record<string, string[]> = {
      'Microsoft Word': ['.docx', '.doc'],
      'Microsoft Excel': ['.xlsx', '.xls'],
      'Adobe Acrobat': ['.pdf'],
      'AutoCAD': ['.dwg']
    };
    
    return nativeFormats[app]?.includes(fileType) || false;
  }

  private hasValidException(metadata: any): boolean {
    // Check for valid Best Evidence Rule exceptions
    return metadata.originalLost || 
           metadata.originalDestroyed || 
           metadata.originalNotObtainable ||
           metadata.opponentPossession;
  }

  private extractContext(content: string, match: string, contextLength: number = 100): string {
    const index = content.indexOf(match);
    const start = Math.max(0, index - contextLength);
    const end = Math.min(content.length, index + match.length + contextLength);
    return content.substring(start, end);
  }

  private identifyPotentialExceptions(context: string): string[] {
    const exceptions: string[] = [];
    
    // Check for common exceptions
    if (/present sense|immediately/gi.test(context)) {
      exceptions.push('FRE 803(1) - Present Sense Impression');
    }
    
    if (/excited|startled|stress/gi.test(context)) {
      exceptions.push('FRE 803(2) - Excited Utterance');
    }
    
    if (/business record|regularly conducted/gi.test(context)) {
      exceptions.push('FRE 803(6) - Records of Regularly Conducted Activity');
    }
    
    return exceptions;
  }

  private analyzeHearsayExceptions(_statements: HearsayStatement[]): HearsayException[] {
    // Implementation would analyze each statement for applicable exceptions
    return [
      {
        rule: 'FRE 803(6)',
        name: 'Records of Regularly Conducted Activity',
        description: 'Business records exception',
        requirements: [
          'Made at or near the time',
          'By someone with knowledge',
          'Kept in course of regularly conducted activity',
          'Regular practice to make such records'
        ],
        applicableStatements: [],
        likelihood: 'medium'
      }
    ];
  }

  private analyzeRelevanceFactors(_content: string, _caseContext: CaseContext): RelevanceFactor[] {
    // This would analyze content against case facts
    return [
      {
        factor: 'Document Content',
        description: 'Content relates to case facts',
        relevanceToCase: 'Provides evidence of material facts',
        probativeValue: 7,
        supportingEvidence: ['Document contains relevant information']
      }
    ];
  }

  private assessPrejudiceRisk(_content: string): PrejudiceAssessment {
    // Analyze content for prejudicial elements
    return {
      unfairPrejudice: 3,
      confusionRisk: 2,
      misleadingRisk: 2,
      timeWaste: 1,
      cumulativeEvidence: 2,
      overallRisk: 2
    };
  }

  private performRule403Analysis(probativeValue: number, prejudiceRisk: PrejudiceAssessment): Rule403Analysis {
    const probativeScore = Math.round(probativeValue / 10);
    const prejudiceScore = prejudiceRisk.overallRisk;
    
    let balancingTest: Rule403Analysis['balancingTest'];
    let recommendation: Rule403Analysis['recommendation'];
    
    if (probativeScore > prejudiceScore * 1.5) {
      balancingTest = 'probative_outweighs';
      recommendation = 'admit';
    } else if (prejudiceScore > probativeScore * 1.5) {
      balancingTest = 'substantially_outweighed';
      recommendation = 'exclude';
    } else {
      balancingTest = 'close_call';
      recommendation = 'further_analysis';
    }
    
    return {
      probativeValue: probativeScore,
      prejudicialEffect: prejudiceScore,
      balancingTest,
      recommendation
    };
  }

  private calculateOverallScore(..._analyses: any[]): number {
    // Weighted scoring based on different analyses
    return 75; // Placeholder
  }

  private generateRecommendations(..._analyses: any[]): string[] {
    return [
      'Review document for compliance with Federal Rules of Evidence',
      'Consider obtaining witness testimony to support authentication',
      'Analyze hearsay statements for applicable exceptions'
    ];
  }

  private generateOriginalityRecommendations(isOriginal: boolean, indicators: OriginalityIndicator[]): string[] {
    const recommendations: string[] = [];
    
    if (!isOriginal) {
      recommendations.push('Provide justification for using copy instead of original under FRE 1004');
      recommendations.push('Document efforts to obtain original');
    }
    
    if (indicators.some(i => !i.supportsOriginality)) {
      recommendations.push('Address concerns about document authenticity');
    }
    
    return recommendations;
  }

  private generateHearsayRecommendations(statements: HearsayStatement[], _exceptions: HearsayException[]): string[] {
    const recommendations: string[] = [];
    
    if (statements.length > 0) {
      recommendations.push('Identify applicable hearsay exceptions for out-of-court statements');
      recommendations.push('Consider limiting instructions for hearsay evidence');
    }
    
    return recommendations;
  }

  private generateRelevanceRecommendations(score: number, rule403: Rule403Analysis): string[] {
    const recommendations: string[] = [];
    
    if (score < 70) {
      recommendations.push('Strengthen relevance argument with additional context');
    }
    
    if (rule403.recommendation === 'exclude') {
      recommendations.push('Consider alternative evidence with less prejudicial effect');
    }
    
    return recommendations;
  }

  private generatePrivilegeRecommendations(claims: PrivilegeClaim[]): string[] {
    const recommendations: string[] = [];
    
    if (claims.length > 0) {
      recommendations.push('Review privilege claims and consider redaction');
      recommendations.push('Prepare privilege log for withheld information');
    }
    
    return recommendations;
  }

  private compileLegalCitations(): string[] {
    return [
      'Fed. R. Evid. 1001-1008 (Best Evidence Rule)',
      'Fed. R. Evid. 801-807 (Hearsay)',
      'Fed. R. Evid. 401-403 (Relevance)',
      'Fed. R. Evid. 501 (Privilege)'
    ];
  }

  private generateDocumentId(): string {
    return `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

interface CaseContext {
  caseType: string;
  keyFacts: string[];
  legalIssues: string[];
  relevantStatutes: string[];
}
