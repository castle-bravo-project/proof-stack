// Local Database Service for ProofStack
// Handles secure local storage of legal documents and evidence

import { EvidenceItem, ChainOfCustodyEntry, LegalAnalysisResult } from '../types';

export interface DatabaseService {
  // Evidence management
  insertEvidence(evidence: EvidenceItem): Promise<{ success: boolean; id?: string; error?: string }>;
  getEvidence(id: string): Promise<EvidenceItem | null>;
  getAllEvidence(): Promise<EvidenceItem[]>;
  updateEvidence(id: string, evidence: Partial<EvidenceItem>): Promise<{ success: boolean; error?: string }>;
  deleteEvidence(id: string): Promise<{ success: boolean; error?: string }>;
  
  // Chain of custody management
  insertChainOfCustody(entry: ChainOfCustodyEntry): Promise<{ success: boolean; id?: number; error?: string }>;
  getChainOfCustody(evidenceId: string): Promise<ChainOfCustodyEntry[]>;
  
  // Legal analysis results
  insertLegalAnalysis(analysis: LegalAnalysisResult): Promise<{ success: boolean; id?: number; error?: string }>;
  getLegalAnalysis(evidenceId: string): Promise<LegalAnalysisResult[]>;
  
  // Database utilities
  backup(): Promise<{ success: boolean; filePath?: string; error?: string }>;
  getStats(): Promise<DatabaseStats>;
}

export interface DatabaseStats {
  totalEvidence: number;
  totalAnalyses: number;
  totalChainEntries: number;
  databaseSize: string;
  lastBackup?: Date;
}

export interface LegalAnalysisResult {
  id?: number;
  evidenceId: string;
  ruleId: string;
  score: number;
  compliant: boolean;
  findings: string[];
  recommendations: string[];
  analysisDate: Date;
  analystNotes?: string;
}

// Check if running in Electron environment
const isElectron = typeof window !== 'undefined' && window.electronAPI;

class ElectronDatabaseService implements DatabaseService {
  async insertEvidence(evidence: EvidenceItem): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const result = await window.electronAPI.dbInsertEvidence(evidence);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getEvidence(id: string): Promise<EvidenceItem | null> {
    try {
      const evidence = await window.electronAPI.dbGetEvidence(id);
      return evidence || null;
    } catch (error) {
      console.error('Failed to get evidence:', error);
      return null;
    }
  }

  async getAllEvidence(): Promise<EvidenceItem[]> {
    try {
      const evidence = await window.electronAPI.dbGetAllEvidence();
      return evidence || [];
    } catch (error) {
      console.error('Failed to get all evidence:', error);
      return [];
    }
  }

  async updateEvidence(id: string, evidence: Partial<EvidenceItem>): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await window.electronAPI.dbUpdateEvidence(id, evidence);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteEvidence(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await window.electronAPI.dbDeleteEvidence(id);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async insertChainOfCustody(entry: ChainOfCustodyEntry): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const result = await window.electronAPI.dbInsertChainOfCustody(entry);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getChainOfCustody(evidenceId: string): Promise<ChainOfCustodyEntry[]> {
    try {
      const entries = await window.electronAPI.dbGetChainOfCustody(evidenceId);
      return entries || [];
    } catch (error) {
      console.error('Failed to get chain of custody:', error);
      return [];
    }
  }

  async insertLegalAnalysis(analysis: LegalAnalysisResult): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const result = await window.electronAPI.dbInsertLegalAnalysis(analysis);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getLegalAnalysis(evidenceId: string): Promise<LegalAnalysisResult[]> {
    try {
      const analyses = await window.electronAPI.dbGetLegalAnalysis(evidenceId);
      return analyses || [];
    } catch (error) {
      console.error('Failed to get legal analysis:', error);
      return [];
    }
  }

  async backup(): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const result = await window.electronAPI.dbBackup();
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getStats(): Promise<DatabaseStats> {
    try {
      const stats = await window.electronAPI.dbGetStats();
      return stats;
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return {
        totalEvidence: 0,
        totalAnalyses: 0,
        totalChainEntries: 0,
        databaseSize: '0 KB'
      };
    }
  }
}

// Fallback browser-based service for development/testing
class BrowserDatabaseService implements DatabaseService {
  private storageKey = 'proofstack_evidence';
  private chainKey = 'proofstack_chain';
  private analysisKey = 'proofstack_analysis';

  async insertEvidence(evidence: EvidenceItem): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const existing = this.getStoredEvidence();
      existing.push(evidence);
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
      return { success: true, id: evidence.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getEvidence(id: string): Promise<EvidenceItem | null> {
    const evidence = this.getStoredEvidence();
    return evidence.find(e => e.id === id) || null;
  }

  async getAllEvidence(): Promise<EvidenceItem[]> {
    return this.getStoredEvidence();
  }

  async updateEvidence(id: string, updates: Partial<EvidenceItem>): Promise<{ success: boolean; error?: string }> {
    try {
      const evidence = this.getStoredEvidence();
      const index = evidence.findIndex(e => e.id === id);
      if (index >= 0) {
        evidence[index] = { ...evidence[index], ...updates };
        localStorage.setItem(this.storageKey, JSON.stringify(evidence));
        return { success: true };
      }
      return { success: false, error: 'Evidence not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteEvidence(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const evidence = this.getStoredEvidence();
      const filtered = evidence.filter(e => e.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async insertChainOfCustody(entry: ChainOfCustodyEntry): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const existing = this.getStoredChain();
      const id = existing.length + 1;
      existing.push({ ...entry, id });
      localStorage.setItem(this.chainKey, JSON.stringify(existing));
      return { success: true, id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getChainOfCustody(evidenceId: string): Promise<ChainOfCustodyEntry[]> {
    const chain = this.getStoredChain();
    return chain.filter(entry => entry.evidenceId === evidenceId);
  }

  async insertLegalAnalysis(analysis: LegalAnalysisResult): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const existing = this.getStoredAnalysis();
      const id = existing.length + 1;
      existing.push({ ...analysis, id });
      localStorage.setItem(this.analysisKey, JSON.stringify(existing));
      return { success: true, id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getLegalAnalysis(evidenceId: string): Promise<LegalAnalysisResult[]> {
    const analyses = this.getStoredAnalysis();
    return analyses.filter(analysis => analysis.evidenceId === evidenceId);
  }

  async backup(): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const data = {
        evidence: this.getStoredEvidence(),
        chain: this.getStoredChain(),
        analysis: this.getStoredAnalysis(),
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proofstack-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      return { success: true, filePath: a.download };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getStats(): Promise<DatabaseStats> {
    const evidence = this.getStoredEvidence();
    const chain = this.getStoredChain();
    const analysis = this.getStoredAnalysis();
    
    const dataSize = new Blob([
      localStorage.getItem(this.storageKey) || '',
      localStorage.getItem(this.chainKey) || '',
      localStorage.getItem(this.analysisKey) || ''
    ]).size;
    
    return {
      totalEvidence: evidence.length,
      totalAnalyses: analysis.length,
      totalChainEntries: chain.length,
      databaseSize: `${(dataSize / 1024).toFixed(2)} KB`
    };
  }

  private getStoredEvidence(): EvidenceItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getStoredChain(): ChainOfCustodyEntry[] {
    try {
      const stored = localStorage.getItem(this.chainKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getStoredAnalysis(): LegalAnalysisResult[] {
    try {
      const stored = localStorage.getItem(this.analysisKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

// Export the appropriate service based on environment
export const createDatabaseService = (): DatabaseService => {
  if (isElectron) {
    return new ElectronDatabaseService();
  } else {
    console.warn('Running in browser mode - using localStorage for development only');
    return new BrowserDatabaseService();
  }
};

export default createDatabaseService;
