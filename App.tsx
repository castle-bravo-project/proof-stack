import React, { useCallback, useEffect, useState } from 'react';
import DesktopAppIndicator from './components/DesktopAppIndicator';
import { ApiKeyBanner } from './components/common/ApiKeyBanner';
import { AlertTriangleIcon, CheckCircleIcon, DownloadIcon, FileTextIcon, GavelIcon, LightbulbIcon, ReportIcon, ScaleIcon, ShieldExclamationIcon, SparklesIcon, XCircleIcon } from './components/icons';
import { EVIDENCE_QUESTIONS } from './constants';
import { generateComprehensiveAnalysis, getAICritique, getAIKeyPoints, getApiKeyStatus, ApiKeyStatus, getDemoKeyPoints, getDemoCritique } from './services/geminiService';
import { AnalysisResult, Answer, Question } from './types';

// Legal Analysis System Imports
// import { EvidenceAnalyzer, EvidenceItem, AnalysisResult as RuleBasedAnalysisResult } from './evidenceAnalyzer';
// import { ComplianceAuditSystem } from './complianceAudit';
// import { LegalStandardsEngine } from './legalStandards';

interface EvidenceInfo {
  name: string;
  description: string;
  type: string;
  jurisdiction?: 'Federal' | 'Indiana' | 'Both';
}

// Demo analysis generator for educational purposes when no API key is present
const generateDemoAnalysis = (answers: Answer[], evidenceInfo: EvidenceInfo): AnalysisResult => {
  return {
    executiveSummary: {
      overallConfidence: 'Medium',
      confidenceBreakdown: {
        high: 3,
        medium: 4,
        low: 2
      },
      topRecommendations: [
        'Strengthen chain of custody documentation with detailed timestamps and handler signatures',
        'Obtain additional authentication evidence such as device logs or metadata verification',
        'Prepare comprehensive technical documentation for court presentation'
      ]
    },
    overallConclusion: `This is a demonstration analysis for educational purposes. The evidence "${evidenceInfo.name || 'Digital Evidence'}" shows moderate admissibility potential based on standard legal criteria. In a real analysis with an API key, this would provide detailed AI-powered insights specific to your evidence and responses.`,
    analysisSections: [
      {
        sectionTitle: 'Foundational Admissibility',
        sectionSummary: 'Demo analysis of basic admissibility requirements. Real AI analysis would provide detailed evaluation based on your specific responses.',
        factorAnalyses: [
          {
            factor: 'Authentication',
            summary: 'This is demonstration content. With an API key, you would receive personalized analysis of your authentication evidence.',
            admissibilityConfidence: 'Medium',
            strengths: ['Standard authentication procedures appear to be followed', 'Evidence type is commonly accepted in courts'],
            weaknesses: ['Demo mode - actual analysis requires API key', 'Cannot evaluate specific authentication details without AI'],
            actionableRecommendations: ['Add your API key to get specific recommendations', 'Review authentication best practices for your evidence type'],
            crossExaminationQuestions: ['How was the evidence initially identified?', 'What authentication methods were used?'],
            recommendedSuppressionText: ['Demo suppression argument - API key required for specific legal arguments']
          }
        ]
      },
      {
        sectionTitle: 'Chain of Custody',
        sectionSummary: 'Demo evaluation of custody procedures. Real analysis would examine your specific custody documentation.',
        factorAnalyses: [
          {
            factor: 'Documentation',
            summary: 'Demonstration of custody analysis. Enable AI features with your API key for detailed evaluation.',
            admissibilityConfidence: 'Medium',
            strengths: ['Standard custody procedures typically followed', 'Evidence handling appears documented'],
            weaknesses: ['Demo analysis cannot evaluate actual documentation', 'Specific custody gaps cannot be identified without AI'],
            actionableRecommendations: ['Configure API key for detailed custody analysis', 'Review all custody transfer documentation'],
            crossExaminationQuestions: ['Who handled the evidence at each stage?', 'Were there any breaks in the chain of custody?'],
            recommendedSuppressionText: ['Demo legal argument - specific arguments require AI analysis']
          }
        ]
      }
    ]
  };
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [evidenceInfo, setEvidenceInfo] = useState<EvidenceInfo>({
    name: '',
    description: '',
    type: 'Mobile Phone',
    jurisdiction: 'Federal',
  });

  // Legal Analysis System (commented out until files are properly integrated)
  // const [evidenceAnalyzer] = useState(() => new EvidenceAnalyzer());
  // const [auditSystem] = useState(() => new ComplianceAuditSystem());
  // const [legalEngine] = useState(() => new LegalStandardsEngine());
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('missing');

  const totalQuestions = EVIDENCE_QUESTIONS.length;
  const totalSteps = totalQuestions + 1; // +1 for the evidence definition step
  const isFinalStep = currentStep === totalSteps;
  const currentQuestion = currentStep > 0 && currentStep <= totalQuestions ? EVIDENCE_QUESTIONS[currentStep - 1] : null;

  // Track API key status for progressive enhancement
  useEffect(() => {
    const updateApiKeyStatus = () => {
      setApiKeyStatus(getApiKeyStatus());
    };

    updateApiKeyStatus();

    // Listen for API key changes
    const handleApiKeyChange = (event: CustomEvent) => {
      setApiKeyStatus(event.detail.status);
    };

    window.addEventListener('apiKeyChanged', handleApiKeyChange as EventListener);

    return () => {
      window.removeEventListener('apiKeyChanged', handleApiKeyChange as EventListener);
    };
  }, []);
  
  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers((prevAnswers: Answer[]) => {
      const existingAnswerIndex = prevAnswers.findIndex((a: Answer) => a.questionId === questionId);
      if (existingAnswerIndex > -1) {
        const newAnswers = [...prevAnswers];
        newAnswers[existingAnswerIndex] = { questionId, value };
        return newAnswers;
      }
      return [...prevAnswers, { questionId, value }];
    });
  }, []);

  // Navigation functions (currently unused but kept for future use)
  // const handleNext = () => {
  //   if (currentStep < totalSteps) {
  //     setCurrentStep(currentStep + 1);
  //   }
  // };

  // const handlePrev = () => {
  //   if (currentStep > 0) {
  //     setCurrentStep(currentStep - 1);
  //   }
  // };
  
  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Check if we have an API key for AI analysis
      if (apiKeyStatus === 'missing') {
        // Generate demo/mock analysis for educational purposes
        const demoAnalysis = generateDemoAnalysis(answers, evidenceInfo);
        setAnalysis(demoAnalysis);
      } else {
        // Generate real AI analysis
        const result = await generateComprehensiveAnalysis(answers, evidenceInfo);
        setAnalysis(result);
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  
  const handleStartOver = () => {
    setCurrentStep(0);
    setEvidenceInfo({ name: '', description: '', type: 'Mobile Phone' });
    setAnswers([]);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="25" width="35" height="8" rx="2" fill="currentColor" opacity="0.9"/>
                  <rect x="8" y="18" width="29" height="8" rx="2" fill="currentColor" opacity="0.7"/>
                  <rect x="11" y="11" width="23" height="8" rx="2" fill="currentColor" opacity="0.5"/>
                  <rect x="14" y="4" width="17" height="8" rx="2" fill="currentColor" opacity="0.3"/>
                  <circle cx="38" cy="29" r="3" fill="currentColor"/>
                  <path d="M36 29l2 2 4-4" stroke="rgba(13, 17, 23, 0.8)" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">ProofStack</h1>
                <p className="text-gray-400 text-sm">Legal Technology Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {analysis && (
              <button
                onClick={handleStartOver}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                New Assessment
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto p-6">
        <DesktopAppIndicator />

        {/* API Key Banner */}
        <ApiKeyBanner className="mb-6" />

        {analysis ? (
          <ReportView analysis={analysis} answers={answers} evidenceInfo={evidenceInfo} apiKeyStatus={apiKeyStatus} />
        ) : (
          <DashboardView
            evidenceInfo={evidenceInfo}
            setEvidenceInfo={setEvidenceInfo}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onGenerateReport={handleGenerateReport}
            isLoading={isLoading}
            error={error}
            totalQuestions={totalQuestions}
            isFinalStep={isFinalStep}
            apiKeyStatus={apiKeyStatus}
          />
        )}
      </main>


    </div>
  );
};

// Dashboard View Component
interface DashboardViewProps {
  evidenceInfo: EvidenceInfo;
  setEvidenceInfo: (info: EvidenceInfo) => void;
  answers: Answer[];
  onAnswerChange: (questionId: string, value: string) => void;
  onGenerateReport: () => void;
  isLoading: boolean;
  error: string | null;
  totalQuestions: number;
  isFinalStep: boolean;
  apiKeyStatus: ApiKeyStatus;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  evidenceInfo,
  setEvidenceInfo,
  answers,
  onAnswerChange,
  onGenerateReport,
  isLoading,
  error,
  totalQuestions,
  isFinalStep,
  apiKeyStatus
}) => {
  const completedQuestions = answers.length;
  const progressPercentage = (completedQuestions / totalQuestions) * 100;

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={onGenerateReport} isFinalStep={isFinalStep} />;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Digital Evidence Assessment</h2>
          {apiKeyStatus === 'missing' ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 max-w-3xl mx-auto">
                Learn about digital evidence admissibility with our educational assessment tool
              </p>
              <p className="text-xs text-amber-400 max-w-3xl mx-auto">
                Add your API key above to unlock AI-powered legal analysis and personalized insights
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 max-w-3xl mx-auto">
              Evaluate your digital evidence against legal standards of admissibility using AI-powered analysis
            </p>
          )}
        </div>

        {/* Progress Overview */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Assessment Progress</h3>
            <span className="text-sm font-medium text-gray-300">{completedQuestions} of {totalQuestions} completed</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="h-2 rounded-full bg-brand-primary transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Evidence Definition</span>
            <span>Foundational Questions</span>
            <span>Daubert Analysis</span>
            <span>Generate Report</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4">
          {completedQuestions === totalQuestions ? (
            <button
              onClick={onGenerateReport}
              className="btn-primary px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              <ReportIcon className="w-4 h-4 mr-2" />
              Generate Analysis Report
            </button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">Complete all assessment questions to generate your report</p>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence Information Panel */}
        <div className="lg:col-span-1">
          <EvidencePanel evidenceInfo={evidenceInfo} setEvidenceInfo={setEvidenceInfo} />
        </div>

        {/* Questions Panel */}
        <div className="lg:col-span-2">
          <QuestionsPanel
            answers={answers}
            onAnswerChange={onAnswerChange}
            totalQuestions={totalQuestions}
            apiKeyStatus={apiKeyStatus}
          />
        </div>
      </div>
    </div>
  );
};

// Evidence Panel Component
const EvidencePanel: React.FC<{
  evidenceInfo: EvidenceInfo;
  setEvidenceInfo: (info: EvidenceInfo) => void;
}> = ({ evidenceInfo, setEvidenceInfo }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEvidenceInfo({ ...evidenceInfo, [name]: value });
  };

  return (
    <div className="card p-6 h-fit">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
          <ShieldExclamationIcon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">Evidence Details</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Evidence Identifier
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={evidenceInfo.name}
            onChange={handleInputChange}
            className="input-field w-full p-3 focus:ring-2 focus:ring-brand-primary transition-colors duration-200"
            placeholder="e.g., iPhone 13 from suspect's vehicle"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
            Evidence Type
          </label>
          <select
            name="type"
            id="type"
            value={evidenceInfo.type}
            onChange={handleInputChange}
            className="input-field w-full p-3 focus:ring-2 focus:ring-brand-primary transition-colors duration-200"
          >
            <option value="Mobile Phone">Mobile Phone</option>
            <option value="Computer">Computer</option>
            <option value="Hard Drive">Hard Drive</option>
            <option value="USB Drive">USB Drive</option>
            <option value="CCTV Footage">CCTV Footage</option>
            <option value="Email">Email</option>
            <option value="Social Media">Social Media</option>
            <option value="Network Logs">Network Logs</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            value={evidenceInfo.description}
            onChange={handleInputChange}
            rows={4}
            className="input-field w-full p-3 focus:ring-2 focus:ring-brand-primary transition-colors duration-200 resize-none"
            placeholder="Provide a detailed description of the evidence..."
          />
        </div>
      </div>
    </div>
  );
};

// Questions Panel Component
const QuestionsPanel: React.FC<{
  answers: Answer[];
  onAnswerChange: (questionId: string, value: string) => void;
  totalQuestions: number;
  apiKeyStatus: ApiKeyStatus;
}> = ({ answers, onAnswerChange, totalQuestions, apiKeyStatus }) => {
  const [activeTab, setActiveTab] = useState<'foundational' | 'daubert'>('foundational');

  const foundationalQuestions = EVIDENCE_QUESTIONS.filter(q => q.section === 'Foundational Admissibility');
  const daubertQuestions = EVIDENCE_QUESTIONS.filter(q => q.section === 'Daubert Standard');

  const getQuestionStatus = (questionId: string) => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer && answer.value.trim() ? 'completed' : 'pending';
  };

  const renderQuestionCard = (question: Question) => {
    const answer = answers.find(a => a.questionId === question.id)?.value || '';
    const status = getQuestionStatus(question.id);

    return (
      <div key={question.id} className="card p-6 hover:border-brand-primary transition-colors duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${status === 'completed' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <h4 className="text-lg font-semibold text-white">{question.title}</h4>
            </div>
            <p className="text-sm text-gray-400 mb-4">{question.text}</p>
          </div>
        </div>

        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className="input-field w-full h-32 p-3 focus:ring-2 focus:ring-brand-primary transition-colors duration-200 resize-none"
          placeholder="Provide your detailed response..."
        />

        <AIAssistantPanel question={question} answer={answer} onAnswerChange={onAnswerChange} apiKeyStatus={apiKeyStatus} />
      </div>
    );
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Assessment Questions</h3>
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('foundational')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'foundational'
                ? 'bg-brand-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Foundational ({foundationalQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('daubert')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'daubert'
                ? 'bg-brand-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Daubert ({daubertQuestions.length})
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'foundational'
          ? foundationalQuestions.map(renderQuestionCard)
          : daubertQuestions.map(renderQuestionCard)
        }
      </div>
    </div>
  );
};


const EvidenceDefinitionStep = ({ evidenceInfo, setEvidenceInfo }: { evidenceInfo: EvidenceInfo, setEvidenceInfo: (info: EvidenceInfo) => void }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEvidenceInfo({ ...evidenceInfo, [name]: value });
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 text-center">Define Your Evidence</h2>
            <p className="text-slate-600 mt-2 mb-6 text-center">First, provide some basic details about the digital evidence you are assessing.</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Evidence Name / Identifier</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={evidenceInfo.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., iPhone 13 from suspect's vehicle"
                    />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Type of Evidence</label>
                    <select
                        name="type"
                        id="type"
                        value={evidenceInfo.type}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option>Mobile Phone</option>
                        <option>Laptop / Computer</option>
                        <option>Email Account</option>
                        <option>Cloud Storage</option>
                        <option>CCTV Footage</option>
                        <option>Social Media Data</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Brief Description</label>
                    <textarea
                        name="description"
                        id="description"
                        value={evidenceInfo.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe what the evidence is, where it was collected from, and its general context in the case."
                    />
                </div>
            </div>
        </div>
    );
};

const AIAssistantPanel = ({ question, answer, onAnswerChange, apiKeyStatus }: {
  question: Question,
  answer: string,
  onAnswerChange: (id: string, val: string) => void,
  apiKeyStatus: ApiKeyStatus
}) => {
    const [mode, setMode] = useState<'points' | 'critique' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const hasApiKey = apiKeyStatus !== 'missing';

    const handleAction = async (actionType: 'points' | 'critique') => {
        if (actionType === 'critique' && !answer.trim()) {
            setError("Please write a draft answer before asking for a critique.");
            return;
        }

        setMode(actionType);
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            let res;
            if (hasApiKey) {
                // Use real AI when API key is available
                if (actionType === 'points') {
                    res = await getAIKeyPoints(question);
                } else {
                    res = await getAICritique(question, answer);
                }
            } else {
                // Use demo mode when no API key
                if (actionType === 'points') {
                    res = getDemoKeyPoints(question);
                } else {
                    res = getDemoCritique(question, answer);
                }
            }
            setResult(res);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        const separator = answer.trim() === '' ? '' : '\n\n';
        onAnswerChange(question.id, answer + separator + suggestion);
    };

    return (
        <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            {error && <div className="status-danger text-sm mb-4 p-3 rounded-lg border">{error}</div>}

            {!isLoading && !result && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 brand-primary" />
                        <p className="text-sm font-semibold text-white">
                          AI Assistant{!hasApiKey && ' (Demo Mode)'}:
                        </p>
                    </div>
                    <button
                        onClick={() => handleAction('points')}
                        className="btn-ai px-3 py-1 text-sm transition-colors duration-200"
                    >
                        Suggest Key Points
                    </button>
                    <button
                        onClick={() => handleAction('critique')}
                        disabled={!answer.trim()}
                        className="btn-ai px-3 py-1 text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Critique My Draft
                    </button>
                </div>
            )}

            {isLoading && (
                <div className="text-center text-gray-400 py-4">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <span>AI is thinking...</span>
                    </div>
                </div>
            )}

            {result && mode === 'points' && (
                <div className="status-info rounded-lg p-4 border">
                    <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <LightbulbIcon className="w-4 h-4" />
                        {hasApiKey ? 'AI-Generated Key Points:' : 'Demo Key Points:'}
                    </h5>
                    {!hasApiKey && (
                      <p className="text-xs text-amber-400 mb-3">
                        These are educational examples. Add your API key for personalized AI insights.
                      </p>
                    )}
                    <ul className="space-y-2 text-sm">
                        {result.keyPoints.map((point: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {result && mode === 'critique' && (
                <div className="bg-gray-900 rounded-lg p-4 space-y-4">
                    <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <GavelIcon className="w-4 h-4 brand-primary" />
                        {hasApiKey ? 'AI Critique:' : 'Demo Critique:'}
                    </h5>
                    {!hasApiKey && (
                      <p className="text-xs text-amber-400 mb-3">
                        This is educational feedback. Add your API key for personalized AI critique.
                      </p>
                    )}

                    <div className="space-y-4">
                        {result.strengths.length > 0 && (
                            <div className="status-success rounded-lg p-3 border">
                                <h6 className="font-semibold mb-2">Strengths:</h6>
                                <ul className="space-y-1 text-sm">
                                    {result.strengths.map((strength: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.weaknesses.length > 0 && (
                            <div className="status-danger rounded-lg p-3 border">
                                <h6 className="font-semibold mb-2">Areas for Improvement:</h6>
                                <ul className="space-y-1 text-sm">
                                    {result.weaknesses.map((weakness: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span>{weakness}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="status-info rounded-lg p-3 border">
                            <h6 className="font-semibold mb-2">Recommendation:</h6>
                            <p className="text-sm mb-3">{result.recommendation}</p>
                            <button
                                onClick={() => handleSuggestionClick(result.recommendation)}
                                className="btn-primary px-3 py-1 text-xs rounded transition-colors duration-200"
                            >
                                Append to Answer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {(result || error) && mode && (
                <button
                    onClick={() => { setResult(null); setError(null); setMode(null); }}
                    className="text-xs text-text-muted hover:text-text-secondary hover:underline mt-4 transition-colors"
                >
                    Reset Assistant
                </button>
            )}
        </div>
    );
};


const WizardStep = ({ question, answer, onAnswerChange, apiKeyStatus }: {
  question: Question,
  answer: string,
  onAnswerChange: (id: string, val: string) => void,
  apiKeyStatus: ApiKeyStatus
}) => {
    const [isAssistantOpen, setAssistantOpen] = useState(false);

    return (
        <div>
            <h3 className="text-2xl font-bold text-slate-800">{question.title}</h3>
            <p className="text-slate-600 mt-2 mb-4">{question.text}</p>
            <textarea
                value={answer}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                className="w-full h-48 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-slate-500"
                placeholder="Provide a detailed response..."
            />
            <div className="mt-4 text-right">
                <button 
                    onClick={() => setAssistantOpen(prev => !prev)}
                    className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-800 font-semibold rounded-lg shadow-sm hover:bg-slate-200 transition-colors"
                >
                    <SparklesIcon /> {isAssistantOpen ? 'Close Assistant' : 'Ask AI Assistant'}
                </button>
            </div>
            {isAssistantOpen && <AIAssistantPanel question={question} answer={answer} onAnswerChange={onAnswerChange} apiKeyStatus={apiKeyStatus} />}
        </div>
    );
};


const FinalStep = ({ onGenerateReport }: { onGenerateReport: () => void }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-slate-800">Ready for Analysis</h2>
      <p className="text-center text-slate-600 mt-2 mb-8">You have answered all the questions. When you're ready, generate your comprehensive AI-powered analysis.</p>

      <div className="mt-8 text-center">
        <button
          onClick={onGenerateReport}
          className="inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
        >
          <ReportIcon />
          Generate Comprehensive Report
        </button>
      </div>
      <div className="mt-6 text-center text-sm text-slate-500">
        <p>You can go back to previous steps to review or change your answers.</p>
      </div>
    </div>
  )
};

const LoadingSpinner = () => {
  const [currentStage, setCurrentStage] = useState('rule_analysis');
  const [progress, setProgress] = useState(0);
  const [substage, setSubstage] = useState('');

  useEffect(() => {
    const stages = [
      { name: 'rule_analysis', duration: 3000, substage: 'Analyzing Federal Rules of Evidence...' },
      { name: 'authentication', duration: 2500, substage: 'Verifying digital authentication...' },
      { name: 'document_analysis', duration: 2000, substage: 'Processing document content...' },
      { name: 'ai_enhancement', duration: 2500, substage: 'Generating AI insights...' }
    ];

    let currentIndex = 0;
    let progressInterval: NodeJS.Timeout;
    let stageTimeout: NodeJS.Timeout;

    const updateStage = () => {
      if (currentIndex < stages.length) {
        const stage = stages[currentIndex];
        setCurrentStage(stage.name);
        setSubstage(stage.substage);

        // Animate progress for this stage
        let stageProgress = 0;
        const progressIncrement = 25; // Each stage is 25% of total
        const startProgress = currentIndex * 25;

        progressInterval = setInterval(() => {
          stageProgress += 2;
          setProgress(startProgress + (stageProgress * 25) / 100);

          if (stageProgress >= 100) {
            clearInterval(progressInterval);
            currentIndex++;
            if (currentIndex < stages.length) {
              stageTimeout = setTimeout(updateStage, 500);
            }
          }
        }, stage.duration / 50);
      }
    };

    updateStage();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stageTimeout);
    };
  }, []);

  return (
    <div className="card p-12 text-center animate-fade-in">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-brand-primary">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>

        <div className="space-y-3 max-w-md">
          <h3 className="text-xl font-semibold text-white">Generating Analysis</h3>
          <p className="text-sm text-brand-primary font-medium animate-pulse">{substage}</p>
          <p className="text-sm text-gray-400">Our AI is analyzing your evidence against legal standards...</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">Progress</span>
            <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-brand-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

const ErrorDisplay = ({ message, onRetry, isFinalStep }: { message: string, onRetry: () => void, isFinalStep: boolean }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('API_KEY')) return 'configuration';
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) return 'network';
    if (errorMessage.includes('rate limit')) return 'rate_limit';
    return 'general';
  };

  const getErrorSuggestions = (errorType: string) => {
    switch (errorType) {
      case 'configuration':
        return [
          'Check that your API key is properly configured',
          'Verify the API key has the necessary permissions',
          'Ensure the environment variable is set correctly'
        ];
      case 'network':
        return [
          'Check your internet connection',
          'Try again in a few moments',
          'Contact support if the issue persists'
        ];
      case 'rate_limit':
        return [
          'Wait a few minutes before trying again',
          'Consider upgrading your API plan',
          'Try with a smaller request'
        ];
      default:
        return [
          'Try refreshing the page',
          'Check your inputs and try again',
          'Contact support if the problem continues'
        ];
    }
  };

  const errorType = getErrorType(message);
  const suggestions = getErrorSuggestions(errorType);

  return (
    <div className="card p-8 border-l-4 border-red-600 animate-fade-in" role="alert">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-300 mb-2">Analysis Failed</h3>
          <p className="text-sm text-gray-400 mb-4">{message}</p>

          {/* Error suggestions */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-red-300 mb-2">Suggested Solutions:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3">
            {isFinalStep && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-6 py-2 font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                {isRetrying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Retrying...
                  </>
                ) : (
                  'Retry Analysis'
                )}
              </button>
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-400 hover:text-gray-300 underline transition-colors duration-200"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {showDetails && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <h5 className="text-xs font-medium text-gray-300 mb-2">Technical Details:</h5>
              <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">{message}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConfidenceBadge = ({ confidence, large = false }: { confidence: 'High' | 'Medium' | 'Low' | undefined, large?: boolean }) => {
  let baseClasses = large
    ? "px-4 py-2 rounded-lg text-base font-bold"
    : "px-3 py-1 rounded-full text-xs font-semibold";
  let specificClasses = "";
  let text = "";

  switch (confidence) {
    case 'High':
      specificClasses = "status-success border";
      text = "High Confidence";
      break;
    case 'Medium':
      specificClasses = "status-warning border";
      text = "Medium Confidence";
      break;
    case 'Low':
      specificClasses = "status-danger border";
      text = "Low Confidence";
      break;
    default:
      return null;
  }
  return <span className={`${baseClasses} ${specificClasses}`}>{text}</span>;
};


const ConfidenceChart = ({ analysis }: { analysis: AnalysisResult }) => {
    const allFactors = analysis.analysisSections.flatMap(section => section.factorAnalyses);

    const getConfidenceClass = (confidence: 'High' | 'Medium' | 'Low') => {
        switch (confidence) {
            case 'High': return 'w-full bg-green-500';
            case 'Medium': return 'w-2/3 bg-yellow-500';
            case 'Low': return 'w-1/3 bg-red-500';
            default: return 'w-0';
        }
    };

    return (
        <div className="card p-6 mt-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>
                Confidence Analysis
            </h3>
            <div className="space-y-6">
                {allFactors.map(factor => (
                    <div key={factor.factor} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-medium text-sm" title={factor.factor}>
                                {factor.factor}
                            </span>
                            <ConfidenceBadge confidence={factor.admissibilityConfidence} />
                        </div>
                        <div className="bg-gray-700 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all duration-500 ease-in-out ${getConfidenceClass(factor.admissibilityConfidence)}`}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ExecutiveSummaryView = ({ summary }: { summary: AnalysisResult['executiveSummary'] }) => {
    return (
        <div className="card p-8 mb-8">
            <h3 className="text-3xl font-bold text-white text-center mb-8">Executive Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors duration-200">
                    <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Overall Confidence</h4>
                    <ConfidenceBadge confidence={summary.overallConfidence} large={true} />
                </div>

                <div className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors duration-200">
                    <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h4 className="text-sm font-medium text-gray-300 mb-4">Factor Breakdown</h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center text-green-300 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>High
                            </span>
                            <span className="text-green-300 font-bold">{summary.confidenceBreakdown.high}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center text-yellow-300 text-sm">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>Medium
                            </span>
                            <span className="text-yellow-300 font-bold">{summary.confidenceBreakdown.medium}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center text-red-300 text-sm">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>Low
                            </span>
                            <span className="text-red-300 font-bold">{summary.confidenceBreakdown.low}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 md:col-span-1 hover:bg-gray-700 transition-colors duration-200">
                    <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                        <LightbulbIcon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-300 mb-4 text-center">Critical Actions</h4>
                    <div className="text-sm text-gray-400">
                        {summary.topRecommendations.slice(0, 2).map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 mb-2">
                                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span>{rec}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-gray-800 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                    <LightbulbIcon className="w-5 h-5 brand-primary" />
                    Top Recommendations
                </h4>
                <ol className="space-y-3 text-sm text-gray-400">
                    {summary.topRecommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {index + 1}
                            </span>
                            <span>{rec}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    )
}


const ReportView = ({ analysis, answers, evidenceInfo, apiKeyStatus }: { analysis: AnalysisResult, answers: Answer[], evidenceInfo: EvidenceInfo, apiKeyStatus: ApiKeyStatus }) => {
  const getAnswerForFactor = (factorName: string) => {
    const question = EVIDENCE_QUESTIONS.find(q => q.factor === factorName);
    return answers.find(a => a.questionId === question?.id)?.value || "Not provided.";
  };
  
  const downloadReport = () => {
    const reportElement = document.getElementById('report-content');
    if (!reportElement) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Digital Evidence Assessment Report</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style> body { font-family: sans-serif; } .no-print { display: none; } </style>
      </head>
      <body class="bg-slate-50 p-8">
        <div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          ${reportElement.innerHTML.replace(/<svg.*?>.*?<\/svg>/g, '')}
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Digital_Evidence_Assessment_Report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Demo Mode Indicator */}
      {apiKeyStatus === 'missing' && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <LightbulbIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="text-blue-300 font-medium">Educational Demo Report</h4>
              <p className="text-blue-200/80 text-sm">
                This is a demonstration report for learning purposes. Add your API key to generate personalized AI-powered legal analysis.
              </p>
            </div>
          </div>
        </div>
      )}

       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">
            {apiKeyStatus === 'missing' ? 'Demo Analysis Report' : 'Analysis Report'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {apiKeyStatus === 'missing'
              ? 'Educational legal admissibility assessment'
              : 'Comprehensive legal admissibility assessment'
            }
          </p>
        </div>
        <button
          onClick={downloadReport}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 no-print"
        >
            <DownloadIcon className="w-4 h-4" />
            Download Report
        </button>
       </div>

      <div id="report-content">
        {analysis.executiveSummary && <ExecutiveSummaryView summary={analysis.executiveSummary} />}

        <div className="card p-6 border-l-4 border-blue-600">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <ShieldExclamationIcon className="w-4 h-4 text-white" />
                </div>
                Evidence Under Review
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-300 mb-1">Identifier</dt>
                    <dd className="text-white font-medium">{evidenceInfo.name || 'N/A'}</dd>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-300 mb-1">Type</dt>
                    <dd className="text-white font-medium">{evidenceInfo.type}</dd>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 md:col-span-1">
                    <dt className="text-sm font-medium text-gray-300 mb-1">Description</dt>
                    <dd className="text-white whitespace-pre-wrap">{evidenceInfo.description || 'N/A'}</dd>
                </div>
            </dl>
        </div>

        <div className="card p-6 border-l-4 border-green-600">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <GavelIcon className="w-4 h-4 text-white" />
                </div>
                Overall Conclusion
            </h3>
            <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 leading-relaxed">{analysis.overallConclusion}</p>
            </div>
        </div>

        {/* Legal Standards Compliance Section */}
        <LegalComplianceSection evidenceInfo={evidenceInfo} analysis={analysis} />

        <ConfidenceChart analysis={analysis} />

        {analysis.analysisSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mt-10">
                <div className="bg-slate-100 p-3 rounded-t-lg border-b-4 border-slate-300">
                    <h3 className="text-2xl font-bold text-slate-900">{section.sectionTitle}</h3>
                </div>
                <div className="bg-slate-50 p-4 rounded-b-lg">
                    <p className="text-slate-700 italic">{section.sectionSummary}</p>
                </div>
                
                {section.factorAnalyses.map((factorAnalysis) => (
                    <div key={factorAnalysis.factor} className="mt-8 pt-6 border-t-2 border-dashed">
                        <div className="flex items-center">
                            <h4 className="text-xl font-bold text-blue-700">{factorAnalysis.factor}</h4>
                            <ConfidenceBadge confidence={factorAnalysis.admissibilityConfidence} />
                        </div>
                        
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                            <h5 className="font-semibold text-slate-800">Your Response:</h5>
                            <p className="text-sm mt-1 whitespace-pre-wrap text-slate-700">{getAnswerForFactor(factorAnalysis.factor)}</p>
                        </div>

                        <div className="mt-4">
                            <h5 className="font-semibold text-slate-800">AI Summary:</h5>
                            <p className="mt-2 text-slate-700">{factorAnalysis.summary}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h5 className="font-semibold text-green-800">Strengths</h5>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-green-900">
                                    {factorAnalysis.strengths.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <h5 className="font-semibold text-yellow-800">Weaknesses / Areas for Improvement</h5>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-yellow-900">
                                    {factorAnalysis.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h5 className="font-semibold text-blue-800 flex items-center"><LightbulbIcon />Actionable Recommendations</h5>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-blue-900 pl-4">
                                {factorAnalysis.actionableRecommendations.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>
                        
                        <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                            <h5 className="font-semibold text-indigo-800 flex items-center"><GavelIcon />Potential Cross-Examination Questions</h5>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-indigo-900 pl-4">
                                {factorAnalysis.crossExaminationQuestions.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>

                        <div className="mt-6 bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h5 className="font-semibold text-orange-800 flex items-center"><ShieldExclamationIcon />Recommended Suppression Arguments</h5>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-orange-900 pl-4">
                                {factorAnalysis.recommendedSuppressionText.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>

                    </div>
                ))}
            </div>
        ))}
      </div>
    </div>
  );
};

// Legal Compliance Analysis Section
const LegalComplianceSection: React.FC<{
  evidenceInfo: EvidenceInfo;
  analysis: AnalysisResult;
}> = ({ evidenceInfo, analysis }) => {
  return (
    <div className="card p-6 border-l-4 border-brand-primary">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
          <ScaleIcon className="w-4 h-4 text-white" />
        </div>
        Legal Standards Compliance
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Federal Rules of Evidence */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <FileTextIcon className="w-4 h-4" />
            Federal Rules of Evidence
          </h4>

          <div className="space-y-3">
            <ComplianceItem
              rule="FRE 901"
              title="Authentication"
              status="needs-attention"
              description="Evidence authentication requirements under Federal Rule 901"
              recommendations={[
                "Document complete chain of custody",
                "Provide witness testimony for authentication",
                "Include technical verification methods"
              ]}
            />

            <ComplianceItem
              rule="FRE 1001-1008"
              title="Best Evidence Rule"
              status={evidenceInfo.type === 'Original' ? 'compliant' : 'warning'}
              description="Original document requirements"
              recommendations={
                evidenceInfo.type === 'Original'
                  ? ["Original evidence presented - compliant"]
                  : ["Provide justification for using copy instead of original"]
              }
            />

            <ComplianceItem
              rule="FRE 401-403"
              title="Relevance"
              status="review-required"
              description="Evidence must be relevant and not unduly prejudicial"
              recommendations={[
                "Establish clear connection to facts in issue",
                "Consider FRE 403 balancing test"
              ]}
            />
          </div>
        </div>

        {/* Indiana Rules of Evidence */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <FileTextIcon className="w-4 h-4" />
            Indiana Rules of Evidence
          </h4>

          <div className="space-y-3">
            <ComplianceItem
              rule="IRE 901"
              title="Authentication"
              status="needs-attention"
              description="Indiana authentication requirements (mirrors FRE 901)"
              recommendations={[
                "Same requirements as Federal Rule 901",
                "Ensure compliance with Indiana state procedures"
              ]}
            />

            <ComplianceItem
              rule="Indiana Trial Rule 26"
              title="Discovery"
              status="pending"
              description="Discovery obligations and compliance"
              recommendations={[
                "Review discovery obligations",
                "Ensure timely production if responsive"
              ]}
            />
          </div>
        </div>
      </div>

      {/* Professional Conduct Compliance */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
          <ScaleIcon className="w-4 h-4" />
          Professional Conduct Compliance
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="status-info rounded-lg p-3 border">
            <h5 className="font-semibold mb-2">Rule 1.6 - Confidentiality</h5>
            <p className="text-sm">Ensure client confidentiality is maintained throughout evidence handling</p>
          </div>

          <div className="status-info rounded-lg p-3 border">
            <h5 className="font-semibold mb-2">Rule 3.3 - Candor</h5>
            <p className="text-sm">Maintain candor toward the tribunal in all evidence presentations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compliance Item Component
const ComplianceItem: React.FC<{
  rule: string;
  title: string;
  status: 'compliant' | 'warning' | 'needs-attention' | 'review-required' | 'pending';
  description: string;
  recommendations: string[];
}> = ({ rule, title, status, description, recommendations }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangleIcon className="w-4 h-4 text-yellow-400" />;
      case 'needs-attention':
        return <XCircleIcon className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangleIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'compliant':
        return 'border-green-600';
      case 'warning':
        return 'border-yellow-600';
      case 'needs-attention':
        return 'border-red-600';
      default:
        return 'border-gray-600';
    }
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-3 border-l-2 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-white">{rule}: {title}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-2">{description}</p>

      <div className="space-y-1">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="w-1 h-1 bg-brand-primary rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-xs text-gray-300">{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;