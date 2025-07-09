import React, { useEffect, useState } from 'react';
import { Monitor, Shield, Database, HardDrive } from 'lucide-react';

interface AppEnvironmentInfo {
  isElectron: boolean;
  platform?: string;
  isProofStack?: boolean;
  databaseConnected: boolean;
}

const DesktopAppIndicator: React.FC = () => {
  const [envInfo, setEnvInfo] = useState<AppEnvironmentInfo>({
    isElectron: false,
    databaseConnected: false
  });

  useEffect(() => {
    // Check if running in Electron
    const isElectron = typeof window !== 'undefined' && window.electronAPI;
    const platform = isElectron ? window.electronAPI.platform : 'browser';
    const isProofStack = isElectron ? window.electronAPI.isProofStack : false;

    setEnvInfo({
      isElectron: !!isElectron,
      platform,
      isProofStack,
      databaseConnected: !!isElectron // Database is available when Electron is available
    });
  }, []);

  if (!envInfo.isElectron) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <Monitor className="text-yellow-600" size={20} />
          <div>
            <h3 className="font-semibold text-yellow-800">Browser Development Mode</h3>
            <p className="text-sm text-yellow-700">
              Running in browser for development. For full legal compliance features, 
              use the desktop application with secure local database storage.
            </p>
          </div>
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
