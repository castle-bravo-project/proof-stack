// API Key Configuration Component
import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeOffIcon, KeyIcon, CheckCircleIcon, XCircleIcon, ExternalLinkIcon } from '../icons';
import { setApiKey, getApiKey, clearApiKey, isApiKeyConfigured } from '../../services/geminiService';

export interface ApiKeyConfigProps {
  onKeyConfigured?: (configured: boolean) => void;
  showInModal?: boolean;
  onClose?: () => void;
}

export const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({
  onKeyConfigured,
  showInModal = false,
  onClose
}) => {
  const [apiKey, setApiKeyState] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const currentKey = getApiKey();
    if (currentKey) {
      setApiKeyState(currentKey);
      setIsConfigured(true);
    }
  }, []);

  const validateApiKey = (key: string): boolean => {
    // Basic validation for Gemini API key format
    return key.length > 20 && key.startsWith('AI') && !key.includes(' ');
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setValidationError('Please enter an API key');
      return;
    }

    if (!validateApiKey(apiKey)) {
      setValidationError('Invalid API key format. Gemini API keys should start with "AI" and be longer than 20 characters.');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Test the API key by making a simple request
      setApiKey(apiKey);
      
      // Simple test to validate the key works
      const testAI = new (await import('@google/genai')).GoogleGenAI({ apiKey: apiKey });
      await testAI.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: 'Test',
        config: { temperature: 0.1 }
      });

      setIsConfigured(true);
      onKeyConfigured?.(true);
      
      if (showInModal && onClose) {
        onClose();
      }
    } catch (error) {
      setValidationError('Invalid API key or network error. Please check your key and try again.');
      clearApiKey();
      setIsConfigured(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearKey = () => {
    clearApiKey();
    setApiKeyState('');
    setIsConfigured(false);
    setValidationError(null);
    onKeyConfigured?.(false);
  };

  const content = (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mx-auto mb-4">
          <KeyIcon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Configure Gemini API Key</h3>
        <p className="text-sm text-gray-400">
          Enter your Google Gemini API key to enable AI-powered legal analysis
        </p>
      </div>

      {!isConfigured ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                className="input-field w-full p-3 pr-12 focus:ring-2 focus:ring-brand-primary transition-colors duration-200"
                placeholder="Enter your Gemini API key (starts with AI...)"
                disabled={isValidating}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                {showKey ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            {validationError && (
              <p className="text-sm text-red-400 mt-2 flex items-center gap-2">
                <XCircleIcon className="w-4 h-4" />
                {validationError}
              </p>
            )}
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-300 mb-2">How to get your API key:</h4>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Visit Google AI Studio</li>
              <li>Sign in with your Google account</li>
              <li>Click "Get API Key" and create a new key</li>
              <li>Copy the key and paste it above</li>
            </ol>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-secondary text-sm mt-3 transition-colors duration-200"
            >
              Open Google AI Studio
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
          </div>

          <button
            onClick={handleSaveKey}
            disabled={isValidating || !apiKey.trim()}
            className="btn-primary w-full px-4 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Validating...
              </>
            ) : (
              'Save API Key'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
            <CheckCircleIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-lg font-medium text-green-300 mb-1">API Key Configured</h4>
            <p className="text-sm text-gray-300">
              Your Gemini API key is set and ready to use
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsConfigured(false);
                setApiKeyState(getApiKey() || '');
              }}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Update Key
            </button>
            <button
              onClick={handleClearKey}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              Clear Key
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        <p>Your API key is stored locally in your browser and never sent to our servers.</p>
      </div>
    </div>
  );

  if (showInModal) {
    return (
      <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6">
          {content}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300 transition-colors duration-200"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return <div className="card p-6">{content}</div>;
};

export const ApiKeyStatus: React.FC<{ onConfigure: () => void }> = ({ onConfigure }) => {
  const [configured, setConfigured] = useState(isApiKeyConfigured());

  useEffect(() => {
    const checkStatus = () => setConfigured(isApiKeyConfigured());
    checkStatus();
    
    // Check periodically in case key is set elsewhere
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  if (configured) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <CheckCircleIcon className="w-4 h-4" />
        <span>API Key Configured</span>
      </div>
    );
  }

  return (
    <button
      onClick={onConfigure}
      className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm transition-colors duration-200"
    >
      <KeyIcon className="w-4 h-4" />
      <span>Configure API Key</span>
    </button>
  );
};
