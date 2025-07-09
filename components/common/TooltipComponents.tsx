// Tooltip and help text components for enhanced UX
import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangleIcon, HelpCircleIcon, InfoIcon } from '../icons';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  maxWidth?: string;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  maxWidth = '200px',
  delay = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      adjustPosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const adjustPosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return;

    const tooltip = tooltipRef.current;
    const trigger = triggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let newPosition = position;

    // Check if tooltip would go off screen and adjust
    if (position === 'top' && rect.top - tooltipRect.height < 0) {
      newPosition = 'bottom';
    } else if (position === 'bottom' && rect.bottom + tooltipRect.height > viewport.height) {
      newPosition = 'top';
    } else if (position === 'left' && rect.left - tooltipRect.width < 0) {
      newPosition = 'right';
    } else if (position === 'right' && rect.right + tooltipRect.width > viewport.width) {
      newPosition = 'left';
    }

    setActualPosition(newPosition);
  };

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-lg shadow-lg';
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return baseClasses;
    }
  };

  const getArrowClasses = () => {
    const baseArrow = 'absolute w-2 h-2 bg-gray-900 border border-gray-700 transform rotate-45';
    
    switch (actualPosition) {
      case 'top':
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -mt-1 border-t-0 border-l-0`;
      case 'bottom':
        return `${baseArrow} bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-0 border-r-0`;
      case 'left':
        return `${baseArrow} left-full top-1/2 -translate-y-1/2 -ml-1 border-l-0 border-b-0`;
      case 'right':
        return `${baseArrow} right-full top-1/2 -translate-y-1/2 -mr-1 border-r-0 border-t-0`;
      default:
        return baseArrow;
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleTrigger = trigger === 'hover' ? {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip
  } : {
    onClick: () => isVisible ? hideTooltip() : showTooltip()
  };

  return (
    <div className="relative inline-block" ref={triggerRef} {...handleTrigger}>
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={getPositionClasses()}
          style={{ maxWidth }}
        >
          <div className={getArrowClasses()} />
          {content}
        </div>
      )}
    </div>
  );
};

export interface HelpTextProps {
  text: string;
  type?: 'info' | 'warning' | 'tip';
  icon?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const HelpText: React.FC<HelpTextProps> = ({
  text,
  type = 'info',
  icon = true,
  collapsible = false,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getTypeClasses = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300';
      case 'tip':
        return 'bg-blue-900/20 border-blue-500/30 text-blue-300';
      default:
        return 'bg-gray-800/50 border-gray-600/30 text-gray-300';
    }
  };

  const getIcon = () => {
    if (!icon) return null;

    switch (type) {
      case 'warning':
        return <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />;
      case 'tip':
        return <InfoIcon className="w-4 h-4 flex-shrink-0" />;
      default:
        return <HelpCircleIcon className="w-4 h-4 flex-shrink-0" />;
    }
  };

  if (collapsible) {
    return (
      <div className={`border rounded-lg transition-all duration-200 ${getTypeClasses()}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 text-left flex items-center gap-2 hover:bg-black/10 transition-colors duration-200"
        >
          {getIcon()}
          <span className="text-sm font-medium">Help & Tips</span>
          <svg
            className={`w-4 h-4 ml-auto transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {isExpanded && (
          <div className="px-3 pb-3">
            <p className="text-sm leading-relaxed">{text}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-3 border rounded-lg ${getTypeClasses()}`}>
      <div className="flex items-start gap-2">
        {getIcon()}
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
};

export interface FieldHelpProps {
  label: string;
  description: string;
  examples?: string[];
  legalContext?: string;
  required?: boolean;
}

export const FieldHelp: React.FC<FieldHelpProps> = ({
  label,
  description,
  examples,
  legalContext,
  required = false
}) => {
  return (
    <Tooltip
      content={
        <div className="space-y-2 max-w-xs">
          <div className="font-medium">{label} {required && <span className="text-red-400">*</span>}</div>
          <div className="text-xs text-gray-300">{description}</div>
          {examples && examples.length > 0 && (
            <div>
              <div className="text-xs font-medium text-brand-primary mb-1">Examples:</div>
              <ul className="text-xs space-y-1">
                {examples.map((example, index) => (
                  <li key={index} className="text-gray-300">• {example}</li>
                ))}
              </ul>
            </div>
          )}
          {legalContext && (
            <div>
              <div className="text-xs font-medium text-green-400 mb-1">Legal Context:</div>
              <div className="text-xs text-gray-300">{legalContext}</div>
            </div>
          )}
        </div>
      }
      position="right"
      maxWidth="300px"
    >
      <HelpCircleIcon className="w-4 h-4 text-gray-400 hover:text-brand-primary cursor-help transition-colors duration-200" />
    </Tooltip>
  );
};

export interface ProgressStepsProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'completed' | 'current' | 'upcoming';
  }>;
  orientation?: 'horizontal' | 'vertical';
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  orientation = 'horizontal'
}) => {
  if (orientation === 'vertical') {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              step.status === 'completed' 
                ? 'bg-green-600 text-white' 
                : step.status === 'current' 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-gray-700 text-gray-400'
            }`}>
              {step.status === 'completed' ? '✓' : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${
                step.status === 'current' ? 'text-white' : 'text-gray-300'
              }`}>
                {step.title}
              </h4>
              {step.description && (
                <p className="text-xs text-gray-400 mt-1">{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              step.status === 'completed' 
                ? 'bg-green-600 text-white' 
                : step.status === 'current' 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-gray-700 text-gray-400'
            }`}>
              {step.status === 'completed' ? '✓' : index + 1}
            </div>
            <div className="mt-2 text-center">
              <div className={`text-xs font-medium ${
                step.status === 'current' ? 'text-white' : 'text-gray-300'
              }`}>
                {step.title}
              </div>
              {step.description && (
                <div className="text-xs text-gray-400 mt-1 max-w-20">{step.description}</div>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-4 transition-colors duration-300 ${
              step.status === 'completed' ? 'bg-green-600' : 'bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};
