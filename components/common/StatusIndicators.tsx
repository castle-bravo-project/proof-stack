// Reusable status indicator components
import React from 'react';
import { AlertTriangleIcon, CheckCircleIcon, XCircleIcon } from '../icons';

export interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  text: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  text, 
  size = 'md', 
  showIcon = true 
}) => {
  const getStatusClasses = () => {
    const baseClasses = 'inline-flex items-center gap-2 rounded-lg font-medium transition-colors duration-200';
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };

    const statusClasses = {
      success: 'status-success border',
      warning: 'status-warning border',
      error: 'status-danger border',
      info: 'status-info border',
      pending: 'bg-gray-700 text-gray-300 border border-gray-600'
    };

    return `${baseClasses} ${sizeClasses[size]} ${statusClasses[status]}`;
  };

  const getIcon = () => {
    if (!showIcon) return null;

    const iconClasses = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

    switch (status) {
      case 'success':
        return <CheckCircleIcon className={iconClasses} />;
      case 'error':
        return <XCircleIcon className={iconClasses} />;
      case 'warning':
      case 'pending':
        return <AlertTriangleIcon className={iconClasses} />;
      default:
        return null;
    }
  };

  return (
    <span className={getStatusClasses()}>
      {getIcon()}
      {text}
    </span>
  );
};

export interface ProgressBarProps {
  progress: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  max = 100,
  label,
  showPercentage = true,
  color = 'primary',
  size = 'md'
}) => {
  const percentage = Math.min(100, Math.max(0, (progress / max) * 100));

  const getBarClasses = () => {
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    };

    return `w-full bg-gray-700 rounded-full ${sizeClasses[size]}`;
  };

  const getFillClasses = () => {
    const colorClasses = {
      primary: 'bg-brand-primary',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      error: 'bg-red-600',
      danger: 'bg-red-600'
    };

    return `h-full rounded-full transition-all duration-500 ease-in-out ${colorClasses[color]}`;
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-400">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={getBarClasses()}>
        <div 
          className={getFillClasses()}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export interface ScoreDisplayProps {
  score: number;
  maxScore: number;
  label: string;
  threshold?: {
    good: number;
    warning: number;
  };
  showBar?: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  maxScore,
  label,
  threshold = { good: 80, warning: 60 },
  showBar = true
}) => {
  const percentage = (score / maxScore) * 100;
  
  const getScoreColor = () => {
    if (percentage >= threshold.good) return 'success';
    if (percentage >= threshold.warning) return 'warning';
    return 'error';
  };

  const color = getScoreColor();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">{score}</span>
          <span className="text-sm text-gray-400">/ {maxScore}</span>
        </div>
      </div>
      {showBar && (
        <ProgressBar 
          progress={score} 
          max={maxScore} 
          color={color}
          showPercentage={false}
          size="sm"
        />
      )}
    </div>
  );
};

export interface RiskIndicatorProps {
  risk: 'low' | 'medium' | 'high';
  label: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  risk,
  label,
  description,
  size = 'md'
}) => {
  const getRiskClasses = () => {
    const baseClasses = 'flex items-center gap-3 p-3 rounded-lg border';
    
    const riskClasses = {
      low: 'bg-green-900/20 border-green-500/30 text-green-300',
      medium: 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300',
      high: 'bg-red-900/20 border-red-500/30 text-red-300'
    };

    return `${baseClasses} ${riskClasses[risk]}`;
  };

  const getRiskDot = () => {
    const dotClasses = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4'
    };

    const colorClasses = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-red-500'
    };

    return `${dotClasses[size]} ${colorClasses[risk]} rounded-full flex-shrink-0`;
  };

  return (
    <div className={getRiskClasses()}>
      <div className={getRiskDot()} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{label}</span>
          <span className="text-xs uppercase font-bold">{risk}</span>
        </div>
        {description && (
          <p className="text-xs opacity-80 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export interface ComplianceIndicatorProps {
  compliant: boolean;
  score?: number;
  maxScore?: number;
  rule: string;
  description?: string;
}

export const ComplianceIndicator: React.FC<ComplianceIndicatorProps> = ({
  compliant,
  score,
  maxScore,
  rule,
  description
}) => {
  return (
    <div className={`p-4 rounded-lg border-l-4 ${
      compliant 
        ? 'bg-green-900/20 border-green-500 text-green-300' 
        : 'bg-red-900/20 border-red-500 text-red-300'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {compliant ? (
            <CheckCircleIcon className="w-4 h-4" />
          ) : (
            <XCircleIcon className="w-4 h-4" />
          )}
          <span className="font-medium">{rule}</span>
        </div>
        {score !== undefined && maxScore !== undefined && (
          <span className="text-sm">
            {score}/{maxScore}
          </span>
        )}
      </div>
      {description && (
        <p className="text-sm opacity-80">{description}</p>
      )}
    </div>
  );
};

export interface LoadingStateProps {
  stage: string;
  progress?: number;
  message?: string;
  substage?: string;
  estimatedTime?: string;
  showSteps?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  stage,
  progress,
  message,
  substage,
  estimatedTime,
  showSteps = false,
  currentStep = 1,
  totalSteps = 4
}) => {
  const getStageIcon = (stageName: string) => {
    switch (stageName.toLowerCase()) {
      case 'rule_analysis':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'authentication':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        );
      case 'document_analysis':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'ai_enhancement':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="card p-8 text-center animate-fade-in">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Enhanced Loading Animation */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-brand-primary">
            {getStageIcon(stage)}
          </div>
        </div>

        {/* Stage Information */}
        <div className="space-y-3 max-w-md">
          <h3 className="text-xl font-semibold text-white">{stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
          {substage && (
            <p className="text-sm text-brand-primary font-medium">{substage}</p>
          )}
          {message && (
            <p className="text-sm text-gray-400">{message}</p>
          )}
          {estimatedTime && (
            <p className="text-xs text-gray-500">Estimated time: {estimatedTime}</p>
          )}
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="w-full max-w-sm">
            <ProgressBar
              progress={progress}
              showPercentage={true}
              color="primary"
              size="md"
            />
          </div>
        )}

        {/* Step Indicators */}
        {showSteps && (
          <div className="flex items-center space-x-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  i + 1 < currentStep
                    ? 'bg-green-600 text-white'
                    : i + 1 === currentStep
                      ? 'bg-brand-primary text-white animate-pulse'
                      : 'bg-gray-700 text-gray-400'
                }`}>
                  {i + 1 < currentStep ? '✓' : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
                    i + 1 < currentStep ? 'bg-green-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Animated Dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Error Occurred",
  message,
  onRetry,
  onDismiss
}) => {
  return (
    <div className="card p-8 border-l-4 border-red-500">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <XCircleIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-300 mb-2">{title}</h3>
          <p className="text-sm text-gray-400 mb-4">{message}</p>
          <div className="flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-primary px-4 py-2 text-sm rounded transition-colors duration-200"
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors duration-200"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Additional components for test compatibility
export interface ComplianceScoreProps {
  score: number;
  breakdown?: Array<{ category: string; score: number }>;
}

export const ComplianceScore: React.FC<ComplianceScoreProps> = ({ score, breakdown }) => {
  const getScoreColor = () => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreText = () => {
    if (score >= 90) return 'Excellent Compliance';
    if (score >= 70) return 'Good Compliance';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-2xl font-bold ${getScoreColor()}`}>{score}%</span>
        <span className="text-sm text-gray-400">{getScoreText()}</span>
      </div>
      {breakdown && (
        <div className="space-y-2">
          {breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{item.category}</span>
              <span className="text-gray-400">{item.score}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export interface RiskLevelProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  factors?: string[];
}

export const RiskLevel: React.FC<RiskLevelProps> = ({ level, factors }) => {
  const getRiskColor = () => {
    switch (level) {
      case 'LOW': return 'text-green-300';
      case 'MEDIUM': return 'text-yellow-300';
      case 'HIGH': return 'text-red-300';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="space-y-2">
      <div className={`font-bold ${getRiskColor()}`}>
        {level} RISK
      </div>
      {factors && (
        <div className="space-y-1">
          {factors.map((factor, index) => (
            <div key={index} className="text-sm text-gray-400">
              {factor}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
