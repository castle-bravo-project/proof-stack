// Digital Evidence Authentication System
// Implements FRE/IRE 901-902 requirements for digital evidence authentication

import crypto from 'crypto';

export interface DigitalSignature {
  algorithm: string;
  signature: string;
  publicKey: string;
  timestamp: Date;
  issuer: string;
  isValid: boolean;
}

export interface HashVerification {
  algorithm: 'MD5' | 'SHA1' | 'SHA256' | 'SHA512';
  originalHash: string;
  currentHash: string;
  isValid: boolean;
  calculatedAt: Date;
}

export interface TimestampValidation {
  source: 'system' | 'ntp' | 'trusted_authority' | 'blockchain';
  timestamp: Date;
  accuracy: number; // seconds
  isVerified: boolean;
  authority?: string;
}

export interface MetadataAnalysis {
  fileMetadata: FileMetadata;
  systemMetadata: SystemMetadata;
  applicationMetadata: ApplicationMetadata;
  preservationScore: number;
  integrityIssues: string[];
}

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  createdDate: Date;
  modifiedDate: Date;
  accessedDate: Date;
  fileType: string;
  mimeType: string;
  encoding?: string;
}

export interface SystemMetadata {
  operatingSystem: string;
  systemVersion: string;
  hostname: string;
  username: string;
  timezone: string;
  locale: string;
}

export interface ApplicationMetadata {
  creatingApplication: string;
  applicationVersion: string;
  documentProperties: Record<string, any>;
  revisionHistory?: RevisionEntry[];
}

export interface RevisionEntry {
  timestamp: Date;
  author: string;
  action: string;
  changes: string[];
}

export interface ChainOfCustodyEntry {
  id: string;
  timestamp: Date;
  handler: string;
  handlerRole: string;
  action: 'collected' | 'transferred' | 'analyzed' | 'stored' | 'accessed' | 'copied' | 'modified';
  location: string;
  purpose: string;
  method: string;
  witnessName?: string;
  witnessSignature?: string;
  handlerSignature: string;
  notes?: string;
  evidenceState: 'original' | 'copy' | 'derivative';
  integrityVerification: HashVerification;
}

export interface AuthenticationResult {
  evidenceId: string;
  overallAuthenticity: 'authenticated' | 'questionable' | 'unauthenticated';
  authenticationScore: number; // 0-100
  digitalSignatures: DigitalSignature[];
  hashVerifications: HashVerification[];
  timestampValidations: TimestampValidation[];
  metadataAnalysis: MetadataAnalysis;
  chainOfCustody: ChainOfCustodyEntry[];
  complianceIssues: AuthenticationIssue[];
  recommendations: string[];
  legalCitations: string[];
}

export interface AuthenticationIssue {
  type: 'critical' | 'warning' | 'informational';
  category: 'hash_mismatch' | 'signature_invalid' | 'timestamp_questionable' | 'metadata_missing' | 'custody_gap' | 'integrity_concern';
  description: string;
  impact: string;
  recommendation: string;
  ruleReference: string;
}

export class DigitalAuthenticationSystem {
  
  // Main authentication method implementing FRE 901 requirements
  async authenticateDigitalEvidence(
    evidenceFile: File | Buffer,
    metadata: Partial<MetadataAnalysis>,
    custodyChain: ChainOfCustodyEntry[],
    expectedHashes?: Record<string, string>
  ): Promise<AuthenticationResult> {
    
    const evidenceId = this.generateEvidenceId();
    const issues: AuthenticationIssue[] = [];
    const recommendations: string[] = [];
    
    // 1. Hash Verification (FRE 901(b)(9) - Process or System)
    const hashVerifications = await this.verifyHashes(evidenceFile, expectedHashes);
    hashVerifications.forEach(hash => {
      if (!hash.isValid) {
        issues.push({
          type: 'critical',
          category: 'hash_mismatch',
          description: `${hash.algorithm} hash verification failed`,
          impact: 'Evidence integrity cannot be verified',
          recommendation: 'Investigate source of hash mismatch and document findings',
          ruleReference: 'FRE 901(b)(9)'
        });
      }
    });

    // 2. Digital Signature Verification (FRE 902(14) - Machine-generated)
    const digitalSignatures = await this.verifyDigitalSignatures(evidenceFile);
    digitalSignatures.forEach(sig => {
      if (!sig.isValid) {
        issues.push({
          type: 'warning',
          category: 'signature_invalid',
          description: `Digital signature from ${sig.issuer} is invalid`,
          impact: 'Cannot verify evidence source authenticity',
          recommendation: 'Obtain valid digital signature or alternative authentication',
          ruleReference: 'FRE 902(14)'
        });
      }
    });

    // 3. Timestamp Validation
    const timestampValidations = await this.validateTimestamps(metadata);
    timestampValidations.forEach(ts => {
      if (!ts.isVerified) {
        issues.push({
          type: 'warning',
          category: 'timestamp_questionable',
          description: `Timestamp from ${ts.source} could not be verified`,
          impact: 'Cannot establish reliable timeline',
          recommendation: 'Seek corroborating timestamp evidence',
          ruleReference: 'FRE 901(b)(4)'
        });
      }
    });

    // 4. Metadata Analysis
    const metadataAnalysis = await this.analyzeMetadata(metadata);
    if (metadataAnalysis.preservationScore < 70) {
      issues.push({
        type: 'warning',
        category: 'metadata_missing',
        description: 'Insufficient metadata preservation',
        impact: 'Limited ability to establish evidence characteristics',
        recommendation: 'Collect additional metadata from source systems',
        ruleReference: 'FRE 901(b)(4)'
      });
    }

    // 5. Chain of Custody Analysis
    const custodyIssues = this.analyzeCustodyChain(custodyChain);
    issues.push(...custodyIssues);

    // Calculate overall authentication score
    const authenticationScore = this.calculateAuthenticationScore(
      hashVerifications,
      digitalSignatures,
      timestampValidations,
      metadataAnalysis,
      custodyChain,
      issues
    );

    // Determine overall authenticity
    const overallAuthenticity = this.determineAuthenticity(authenticationScore, issues);

    // Generate recommendations
    recommendations.push(...this.generateRecommendations(issues, authenticationScore));

    // Legal citations
    const legalCitations = [
      'Fed. R. Evid. 901(b)(1) - Testimony of witness with knowledge',
      'Fed. R. Evid. 901(b)(4) - Distinctive characteristics',
      'Fed. R. Evid. 901(b)(9) - Evidence about a process or system',
      'Fed. R. Evid. 902(14) - Machine-generated digital evidence'
    ];

    return {
      evidenceId,
      overallAuthenticity,
      authenticationScore,
      digitalSignatures,
      hashVerifications,
      timestampValidations,
      metadataAnalysis,
      chainOfCustody: custodyChain,
      complianceIssues: issues,
      recommendations,
      legalCitations
    };
  }

  // Hash verification implementation
  private async verifyHashes(
    evidenceFile: File | Buffer,
    expectedHashes?: Record<string, string>
  ): Promise<HashVerification[]> {
    const verifications: HashVerification[] = [];
    const algorithms: Array<'MD5' | 'SHA1' | 'SHA256' | 'SHA512'> = ['MD5', 'SHA1', 'SHA256', 'SHA512'];
    
    for (const algorithm of algorithms) {
      const currentHash = await this.calculateHash(evidenceFile, algorithm);
      const expectedHash = expectedHashes?.[algorithm];
      
      if (expectedHash) {
        verifications.push({
          algorithm,
          originalHash: expectedHash,
          currentHash,
          isValid: currentHash === expectedHash,
          calculatedAt: new Date()
        });
      }
    }
    
    return verifications;
  }

  // Calculate hash using specified algorithm
  private async calculateHash(data: File | Buffer, algorithm: string): Promise<string> {
    const hash = crypto.createHash(algorithm.toLowerCase());
    
    if (data instanceof File) {
      // In browser environment, would use FileReader
      const buffer = await data.arrayBuffer();
      hash.update(new Uint8Array(buffer));
    } else {
      hash.update(data);
    }
    
    return hash.digest('hex');
  }

  // Digital signature verification
  private async verifyDigitalSignatures(evidenceFile: File | Buffer): Promise<DigitalSignature[]> {
    // This would integrate with actual digital signature verification libraries
    // For now, returning a placeholder structure
    return [
      {
        algorithm: 'RSA-SHA256',
        signature: 'placeholder_signature',
        publicKey: 'placeholder_public_key',
        timestamp: new Date(),
        issuer: 'Certificate Authority',
        isValid: true
      }
    ];
  }

  // Timestamp validation
  private async validateTimestamps(metadata: Partial<MetadataAnalysis>): Promise<TimestampValidation[]> {
    const validations: TimestampValidation[] = [];
    
    // System timestamp validation
    if (metadata.fileMetadata?.createdDate) {
      validations.push({
        source: 'system',
        timestamp: metadata.fileMetadata.createdDate,
        accuracy: 1, // 1 second accuracy
        isVerified: true // Would implement actual verification
      });
    }
    
    return validations;
  }

  // Metadata analysis
  private async analyzeMetadata(metadata: Partial<MetadataAnalysis>): Promise<MetadataAnalysis> {
    const integrityIssues: string[] = [];
    let preservationScore = 100;
    
    // Check for required metadata fields
    if (!metadata.fileMetadata?.fileName) {
      integrityIssues.push('Missing file name');
      preservationScore -= 10;
    }
    
    if (!metadata.fileMetadata?.createdDate) {
      integrityIssues.push('Missing creation date');
      preservationScore -= 15;
    }
    
    if (!metadata.systemMetadata?.operatingSystem) {
      integrityIssues.push('Missing system information');
      preservationScore -= 10;
    }
    
    return {
      fileMetadata: metadata.fileMetadata || {} as FileMetadata,
      systemMetadata: metadata.systemMetadata || {} as SystemMetadata,
      applicationMetadata: metadata.applicationMetadata || {} as ApplicationMetadata,
      preservationScore: Math.max(0, preservationScore),
      integrityIssues
    };
  }

  // Chain of custody analysis
  private analyzeCustodyChain(custodyChain: ChainOfCustodyEntry[]): AuthenticationIssue[] {
    const issues: AuthenticationIssue[] = [];
    
    if (custodyChain.length === 0) {
      issues.push({
        type: 'critical',
        category: 'custody_gap',
        description: 'No chain of custody documentation provided',
        impact: 'Cannot establish evidence handling history',
        recommendation: 'Document complete chain of custody from collection to presentation',
        ruleReference: 'FRE 901(b)(1)'
      });
      return issues;
    }
    
    // Check for gaps in custody chain
    for (let i = 1; i < custodyChain.length; i++) {
      const timeDiff = custodyChain[i].timestamp.getTime() - custodyChain[i-1].timestamp.getTime();
      if (timeDiff > 24 * 60 * 60 * 1000) { // More than 24 hours
        issues.push({
          type: 'warning',
          category: 'custody_gap',
          description: `Gap in custody chain between ${custodyChain[i-1].handler} and ${custodyChain[i].handler}`,
          impact: 'Potential for evidence tampering during gap period',
          recommendation: 'Document activities during gap period and provide explanation',
          ruleReference: 'FRE 901(b)(1)'
        });
      }
    }
    
    return issues;
  }

  // Calculate overall authentication score
  private calculateAuthenticationScore(
    hashVerifications: HashVerification[],
    digitalSignatures: DigitalSignature[],
    timestampValidations: TimestampValidation[],
    metadataAnalysis: MetadataAnalysis,
    custodyChain: ChainOfCustodyEntry[],
    issues: AuthenticationIssue[]
  ): number {
    let score = 100;
    
    // Deduct for critical issues
    const criticalIssues = issues.filter(i => i.type === 'critical').length;
    score -= criticalIssues * 25;
    
    // Deduct for warning issues
    const warningIssues = issues.filter(i => i.type === 'warning').length;
    score -= warningIssues * 10;
    
    // Add points for positive verification
    const validHashes = hashVerifications.filter(h => h.isValid).length;
    score += validHashes * 5;
    
    const validSignatures = digitalSignatures.filter(s => s.isValid).length;
    score += validSignatures * 10;
    
    // Factor in metadata preservation score
    score = (score + metadataAnalysis.preservationScore) / 2;
    
    return Math.max(0, Math.min(100, score));
  }

  // Determine overall authenticity
  private determineAuthenticity(score: number, issues: AuthenticationIssue[]): 'authenticated' | 'questionable' | 'unauthenticated' {
    const criticalIssues = issues.filter(i => i.type === 'critical').length;
    
    if (criticalIssues > 0) return 'unauthenticated';
    if (score >= 80) return 'authenticated';
    if (score >= 60) return 'questionable';
    return 'unauthenticated';
  }

  // Generate recommendations
  private generateRecommendations(issues: AuthenticationIssue[], score: number): string[] {
    const recommendations: string[] = [];
    
    if (score < 80) {
      recommendations.push('Consider obtaining additional authentication evidence');
    }
    
    if (issues.some(i => i.category === 'hash_mismatch')) {
      recommendations.push('Investigate and document any hash verification failures');
    }
    
    if (issues.some(i => i.category === 'custody_gap')) {
      recommendations.push('Provide detailed explanation for any gaps in chain of custody');
    }
    
    recommendations.push('Prepare witness testimony to support authentication under FRE 901(b)(1)');
    
    return recommendations;
  }

  // Generate unique evidence ID
  private generateEvidenceId(): string {
    return `EVIDENCE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create new chain of custody entry
  createCustodyEntry(
    handler: string,
    handlerRole: string,
    action: ChainOfCustodyEntry['action'],
    location: string,
    purpose: string,
    method: string,
    evidenceState: 'original' | 'copy' | 'derivative',
    notes?: string
  ): ChainOfCustodyEntry {
    return {
      id: this.generateEvidenceId(),
      timestamp: new Date(),
      handler,
      handlerRole,
      action,
      location,
      purpose,
      method,
      evidenceState,
      handlerSignature: `${handler}_${Date.now()}`, // Would be actual signature
      notes,
      integrityVerification: {
        algorithm: 'SHA256',
        originalHash: 'placeholder',
        currentHash: 'placeholder',
        isValid: true,
        calculatedAt: new Date()
      }
    };
  }
}
