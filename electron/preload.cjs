const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods for ProofStack legal document management
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
  
  // Dialog operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Database operations for legal evidence
  dbInsertEvidence: (evidence) => ipcRenderer.invoke('db-insert-evidence', evidence),
  dbGetEvidence: (id) => ipcRenderer.invoke('db-get-evidence', id),
  dbGetAllEvidence: () => ipcRenderer.invoke('db-get-all-evidence'),
  dbInsertChainOfCustody: (entry) => ipcRenderer.invoke('db-insert-chain-of-custody', entry),
  dbGetChainOfCustody: (evidenceId) => ipcRenderer.invoke('db-get-chain-of-custody', evidenceId),
  dbInsertLegalAnalysis: (analysis) => ipcRenderer.invoke('db-insert-legal-analysis', analysis),
  dbGetLegalAnalysis: (evidenceId) => ipcRenderer.invoke('db-get-legal-analysis', evidenceId),
  
  // Menu event listeners for legal workflows
  onMenuImportEvidence: (callback) => ipcRenderer.on('menu-import-evidence', callback),
  onMenuExportReport: (callback) => ipcRenderer.on('menu-export-report', callback),
  onMenuBackupDb: (callback) => ipcRenderer.on('menu-backup-db', callback),
  onMenuNewEvidence: (callback) => ipcRenderer.on('menu-new-evidence', callback),
  onMenuRunAnalysis: (callback) => ipcRenderer.on('menu-run-analysis', callback),
  onMenuUpdateCustody: (callback) => ipcRenderer.on('menu-update-custody', callback),
  onMenuFreCheck: (callback) => ipcRenderer.on('menu-fre-check', callback),
  onMenuAuthGuide: (callback) => ipcRenderer.on('menu-auth-guide', callback),
  onMenuCustodyTutorial: (callback) => ipcRenderer.on('menu-custody-tutorial', callback),
  onMenuLegalGuide: (callback) => ipcRenderer.on('menu-legal-guide', callback),
  onMenuSettings: (callback) => ipcRenderer.on('menu-settings', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  
  // App info
  isElectron: true,
  isProofStack: true
});

// Expose secure file system operations for legal document handling
contextBridge.exposeInMainWorld('nodeAPI', {
  path: {
    join: (...args) => require('path').join(...args),
    dirname: (path) => require('path').dirname(path),
    basename: (path) => require('path').basename(path),
    extname: (path) => require('path').extname(path)
  },
  
  // Secure crypto operations for evidence integrity
  crypto: {
    createHash: (algorithm) => require('crypto').createHash(algorithm),
    randomUUID: () => require('crypto').randomUUID()
  }
});

// Expose legal-specific utilities
contextBridge.exposeInMainWorld('legalAPI', {
  // Generate evidence ID with timestamp and UUID
  generateEvidenceId: () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uuid = require('crypto').randomUUID().substring(0, 8);
    return `EVIDENCE_${timestamp}_${uuid}`;
  },
  
  // Calculate file hash for integrity verification
  calculateFileHash: async (filePath) => {
    try {
      const fs = require('fs');
      const crypto = require('crypto');
      const data = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(data).digest('hex');
    } catch (error) {
      throw new Error(`Failed to calculate hash: ${error.message}`);
    }
  },
  
  // Get file metadata for evidence documentation
  getFileMetadata: async (filePath) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const stats = fs.statSync(filePath);
      
      return {
        fileName: path.basename(filePath),
        filePath: filePath,
        fileSize: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        extension: path.extname(filePath),
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  },
  
  // Format timestamps for legal documentation
  formatLegalTimestamp: (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  }
});
