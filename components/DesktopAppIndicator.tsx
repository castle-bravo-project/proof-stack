import React, { useEffect, useState } from 'react';
import { Monitor, Shield, Database, HardDrive } from 'lucide-react';

interface AppEnvironmentInfo {
  isElectron: boolean;
  platform?: string;
  isProofStack?: boolean;
  databaseConnected: boolean;
}

// Extend Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      isProofStack: boolean;
      isElectron: boolean;
    };
  }
}

const DesktopAppIndicator: React.FC = () => {
  const [envInfo, setEnvInfo] = useState<AppEnvironmentInfo>({
    isElectron: false,
    databaseConnected: false
  });

  useEffect(() => {
    // Check if running in Electron
    const isElectron = typeof window !== 'undefined' && window.electronAPI;
    const platform = isElectron ? window.electronAPI?.platform : 'browser';
    const isProofStack = isElectron ? window.electronAPI?.isProofStack : false;

    setEnvInfo({
      isElectron: !!isElectron,
      platform: platform || 'browser',
      isProofStack: !!isProofStack,
      databaseConnected: !!isElectron // Database is available when Electron is available
    });
  }, []);

  if (!envInfo.isElectron) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="text-blue-600" size={20} />
            <div>
              <h3 className="font-semibold text-blue-800">Web Version</h3>
              <p className="text-sm text-blue-700">
                You're using the web version. All features work, but data isn't saved between sessions.
              </p>
            </div>
          </div>
          <div className="text-xs text-blue-600 bg-blue-100 rounded px-2 py-1">
            ✅ Full functionality • ⚠️ No data persistence
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            <strong>Want data persistence?</strong> Build the desktop app from source or wait for our signed release.
            <a href="https://github.com/castle-bravo-project/proof-stack#desktop-application-development"
               target="_blank"
               rel="noopener noreferrer"
               className="ml-1 underline hover:text-blue-800">
              Build instructions →
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-green-600" size={20} />
          <div>
            <h3 className="font-semibold text-green-800">ProofStack Desktop Application</h3>
            <p className="text-sm text-green-700">
              Secure desktop environment with local database storage for legal documents
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Database className="text-green-600" size={16} />
            <span className="text-green-700">
              {envInfo.databaseConnected ? 'Database Connected' : 'Database Offline'}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <HardDrive className="text-green-600" size={16} />
            <span className="text-green-700 capitalize">
              {envInfo.platform || 'Unknown'} Platform
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-green-600 bg-green-100 rounded px-2 py-1 inline-block">
        ✅ Legal documents stored locally • ✅ Chain of custody tracking • ✅ Compliance-ready audit trails
      </div>
    </div>
  );
};

export default DesktopAppIndicator;
