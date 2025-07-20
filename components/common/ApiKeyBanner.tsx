import React, { useState, useEffect } from 'react';
import { AlertTriangleIcon, CheckCircleIcon, KeyIcon, XCircleIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon } from '../icons';
import { getApiKeyStatus, setUserApiKey, clearUserApiKey, isApiKeyConfigured, ApiKeyStatus } from '../../services/geminiService';

interface ApiKeyBannerProps {
  className?: string;
}

export const ApiKeyBanner: React.FC<ApiKeyBannerProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<ApiKeyStatus>('missing');
  const [showInput, setShowInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getApiKeyStatus());
    };

    updateStatus();

    // Listen for API key changes
    const handleApiKeyChange = (event: CustomEvent) => {
      setStatus(event.detail.status);
      setShowInput(false);
      setApiKey('');
      setValidationError(null);
    };

    window.addEventListener('apiKeyChanged', handleApiKeyChange as EventListener);
    
    return () => {
      window.removeEventListener('apiKeyChanged', handleApiKeyChange as EventListener);
    };
  }, []);

  const validateApiKey = (key: string): boolean => {
    return key.length > 20 && key.startsWith('AI') && !key.includes(' ');
  };

  const handleAddApiKey = async () => {
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
      const testAI = new (await import('@google/genai')).GoogleGenAI({ apiKey: apiKey });
      await testAI.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: 'Test',
        config: { temperature: 0.1 }
      });

      setUserApiKey(apiKey);
      setShowInput(false);
      setApiKey('');
    } catch (error) {
      setValidationError('Invalid API key or network error. Please check your key and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearKey = () => {
    clearUserApiKey();
  };

  const handleCancel = () => {
    setShowInput(false);
    setApiKey('');
    setValidationError(null);
  };

  // Don't show banner if environment key is configured
  if (status === 'environment') {
    return null;
  }

  // Missing key state - amber banner
  if (status === 'missing') {
    return (
      <div className={`bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 ${className}`}>
        {!showInput ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <h4 className="text-amber-300 font-medium">Add API Key for AI Features</h4>
                <p className="text-amber-200/80 text-sm">
                  Get AI-powered legal analysis, insights, and personalized feedback by adding your Gemini API key.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 hover:text-amber-200 text-sm flex items-center gap-1 transition-colors duration-200"
              >
                Get API Key
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
              <button
                onClick={() => setShowInput(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <KeyIcon className="w-4 h-4" />
                Add API Key
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <KeyIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <h4 className="text-amber-300 font-medium">Enter your Gemini API Key</h4>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
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
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <XCircleIcon className="w-4 h-4" />
                  {validationError}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Your API key is stored locally in your browser and never sent to our servers.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-2 text-gray-400 hover:text-gray-300 text-sm transition-colors duration-200"
                    disabled={isValidating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddApiKey}
                    disabled={isValidating || !apiKey.trim()}
                    className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
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
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active key state - green banner
  if (status === 'user-provided') {
    return (
      <div className={`bg-green-900/20 border border-green-500/30 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <h4 className="text-green-300 font-medium">AI Features Active</h4>
              <p className="text-green-200/80 text-sm">
                Your API key is configured. Enjoy AI-powered legal analysis and insights!
              </p>
            </div>
          </div>
          <button
            onClick={handleClearKey}
            className="text-green-300 hover:text-green-200 text-sm px-3 py-2 rounded-lg hover:bg-green-800/20 transition-colors duration-200"
          >
            Clear Key
          </button>
        </div>
      </div>
    );
  }

  return null;
};
