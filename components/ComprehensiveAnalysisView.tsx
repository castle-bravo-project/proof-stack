// Comprehensive Analysis View - Integrates all legal analysis systems
import React, { useState } from 'react';
import { EnhancedAnalysisResult, ExpertRecommendation, VulnerableArea } from '../enhancedAIAnalysis';

interface ComprehensiveAnalysisViewProps {
  analysis: EnhancedAnalysisResult;
  evidenceInfo: any;
}

export const ComprehensiveAnalysisView: React.FC<ComprehensiveAnalysisViewProps> = ({
  analysis,
  evidenceInfo
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'authentication' | 'strategy' | 'risks'>('overview');

  return (
    <div className="space-y-6">
      {/* Header with Overall Recommendation */}
      <div className="card p-6 border-l-4 border-brand-primary">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Comprehensive Legal Analysis</h2>
          <RecommendationBadge recommendation={analysis.overallRecommendation} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <ScoreCard
            title="Compliance Score"
            score={analysis.complianceScore}
            maxScore={100}
            color="brand-primary"
          />
          <ScoreCard
            title="Authentication"
            score={analysis.authenticationAnalysis?.authenticationScore || 0}
            maxScore={100}
            color="blue-500"
          />
          <ScoreCard
            title="Rule Compliance"
            score={analysis.ruleBasedAnalysis.overallScore}
            maxScore={100}
            color="green-500"
          />
          <ScoreCard
            title="Risk Level"
            score={analysis.aiEnhancedAnalysis.riskAssessment.overallRisk === 'low' ? 85 : 
                   analysis.aiEnhancedAnalysis.riskAssessment.overallRisk === 'medium' ? 60 : 35}
            maxScore={100}
            color="yellow-500"
          />
        </div>

        <p className="text-sm text-gray-400">
          {analysis.aiEnhancedAnalysis.contextualAnalysis}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="card p-1">
        <div className="flex bg-gray-800 rounded-lg">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'rules', label: 'Rule Analysis' },
            { key: 'authentication', label: 'Authentication' },
            { key: 'strategy', label: 'Strategy' },
            { key: 'risks', label: 'Risk Assessment' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.key
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab analysis={analysis} />
      )}
      
      {activeTab === 'rules' && (
        <RuleAnalysisTab analysis={analysis} />
      )}
      
      {activeTab === 'authentication' && (
        <AuthenticationTab analysis={analysis} />
      )}
      
      {activeTab === 'strategy' && (
        <StrategyTab analysis={analysis} />
      )}
      
      {activeTab === 'risks' && (
        <RiskAssessmentTab analysis={analysis} />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ analysis: EnhancedAnalysisResult }> = ({ analysis }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Strengths */}
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        Strengths
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed">
        {analysis.aiEnhancedAnalysis.strengthsAnalysis}
      </p>
    </div>

    {/* Weaknesses */}
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        Areas of Concern
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed">
        {analysis.aiEnhancedAnalysis.weaknessesAnalysis}
      </p>
    </div>

    {/* Strategic Recommendations */}
    <div className="card p-6 lg:col-span-2">
      <h3 className="text-lg font-semibold text-white mb-4">Strategic Recommendations</h3>
      <div className="space-y-3">
        {analysis.aiEnhancedAnalysis.strategicRecommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {index + 1}
            </span>
            <span className="text-sm text-gray-300">{rec}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Rule Analysis Tab Component
const RuleAnalysisTab: React.FC<{ analysis: EnhancedAnalysisResult }> = ({ analysis }) => (
  <div className="space-y-6">
    {analysis.ruleBasedAnalysis.ruleCompliance.map((compliance, index) => (
      <div key={index} className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{compliance.ruleId.toUpperCase()}</h3>
          <ComplianceBadge compliant={compliance.compliant} score={compliance.score} maxScore={compliance.maxScore} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Findings</h4>
            <div className="space-y-2">
              {compliance.findings.map((finding, idx) => (
                <FindingItem key={idx} finding={finding} />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Recommendations</h4>
            <div className="space-y-2">
              {compliance.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-400">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Authentication Tab Component
const AuthenticationTab: React.FC<{ analysis: EnhancedAnalysisResult }> = ({ analysis }) => {
  const auth = analysis.authenticationAnalysis;
  if (!auth) return <div className="card p-6 text-center text-gray-400">No authentication analysis available</div>;

  return (
    <div className="space-y-6">
      {/* Authentication Overview */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Authentication Status</h3>
          <AuthenticityBadge authenticity={auth.overallAuthenticity} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Hash Verifications</h4>
            <p className="text-2xl font-bold text-white">{auth.hashVerifications.filter(h => h.isValid).length}</p>
            <p className="text-xs text-gray-400">of {auth.hashVerifications.length} valid</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Digital Signatures</h4>
            <p className="text-2xl font-bold text-white">{auth.digitalSignatures.filter(s => s.isValid).length}</p>
            <p className="text-xs text-gray-400">of {auth.digitalSignatures.length} valid</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Metadata Score</h4>
            <p className="text-2xl font-bold text-white">{auth.metadataAnalysis.preservationScore}</p>
            <p className="text-xs text-gray-400">preservation score</p>
          </div>
        </div>
      </div>

      {/* Chain of Custody */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Chain of Custody</h3>
        <div className="space-y-3">
          {auth.chainOfCustody.map((entry, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{entry.handler}</span>
                <span className="text-xs text-gray-400">{entry.timestamp.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400">{entry.action} - {entry.purpose}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Strategy Tab Component
const StrategyTab: React.FC<{ analysis: EnhancedAnalysisResult }> = ({ analysis }) => (
  <div className="space-y-6">
    {/* Expert Recommendations */}
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Expert Recommendations</h3>
      <div className="space-y-4">
        {analysis.expertRecommendations.map((expert, index) => (
          <ExpertRecommendationCard key={index} recommendation={expert} />
        ))}
      </div>
    </div>

    {/* Cross-Examination Preparation */}
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Cross-Examination Preparation</h3>
      <div className="space-y-4">
        {analysis.crossExaminationPrep.vulnerableAreas.map((area, index) => (
          <VulnerableAreaCard key={index} area={area} />
        ))}
      </div>
    </div>

    {/* Legal Precedents */}
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Relevant Precedents</h3>
      <div className="space-y-4">
        {analysis.aiEnhancedAnalysis.precedentAnalysis.map((precedent, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-white">{precedent.caseName}</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                precedent.supportive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
              }`}>
                {precedent.supportive ? 'Supportive' : 'Adverse'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{precedent.citation}</p>
            <p className="text-sm text-gray-300">{precedent.relevanceToCurrentCase}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Risk Assessment Tab Component
const RiskAssessmentTab: React.FC<{ analysis: EnhancedAnalysisResult }> = ({ analysis }) => {
  const risk = analysis.aiEnhancedAnalysis.riskAssessment;
  
  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RiskIndicator label="Admissibility" risk={risk.admissibilityRisk} />
          <RiskIndicator label="Exclusion" risk={risk.exclusionRisk} />
          <RiskIndicator label="Sanctions" risk={risk.sanctionRisk} />
          <RiskIndicator label="Appeal" risk={risk.appealRisk} />
        </div>
      </div>

      {/* Motion to Suppress Risk */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Motion to Suppress Risk</h3>
        <div className="space-y-4">
          {analysis.motionSuppressionRisk.likelyGrounds.map((ground, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-white">{ground.ground}</h4>
                <RiskBadge risk={ground.likelihood} />
              </div>
              <p className="text-xs text-gray-400 mb-2">{ground.ruleReference}</p>
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-300">Counter-arguments:</h5>
                {ground.counterArguments.map((arg, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-brand-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-xs text-gray-400">{arg}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mitigation Strategies */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Mitigation Strategies</h3>
        <div className="space-y-3">
          {risk.mitigationStrategies.map((strategy, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-sm text-gray-300">{strategy}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const RecommendationBadge: React.FC<{ recommendation: string }> = ({ recommendation }) => {
  const getColor = () => {
    switch (recommendation) {
      case 'admit': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'exclude': return 'bg-red-900/50 text-red-300 border-red-700';
      case 'conditional_admit': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      default: return 'bg-blue-900/50 text-blue-300 border-blue-700';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getColor()}`}>
      {recommendation.replace('_', ' ').toUpperCase()}
    </span>
  );
};

const ScoreCard: React.FC<{ title: string; score: number; maxScore: number; color: string }> = ({
  title, score, maxScore, color
}) => (
  <div className="bg-gray-800 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-300 mb-2">{title}</h4>
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold text-white">{score}</span>
      <span className="text-sm text-gray-400">/ {maxScore}</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
      <div 
        className={`h-2 rounded-full bg-${color} transition-all duration-500`}
        style={{ width: `${(score / maxScore) * 100}%` }}
      ></div>
    </div>
  </div>
);

const ComplianceBadge: React.FC<{ compliant: boolean; score: number; maxScore: number }> = ({
  compliant, score, maxScore
}) => (
  <div className="flex items-center gap-2">
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      compliant ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
    }`}>
      {compliant ? 'Compliant' : 'Non-Compliant'}
    </span>
    <span className="text-sm text-gray-400">{score}/{maxScore}</span>
  </div>
);

const FindingItem: React.FC<{ finding: any }> = ({ finding }) => (
  <div className={`p-3 rounded-lg border-l-2 ${
    finding.impact === 'high' ? 'bg-red-900/20 border-red-500' :
    finding.impact === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
    'bg-blue-900/20 border-blue-500'
  }`}>
    <p className="text-sm text-gray-300">{finding.description}</p>
  </div>
);

const AuthenticityBadge: React.FC<{ authenticity: string }> = ({ authenticity }) => (
  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
    authenticity === 'authenticated' ? 'bg-green-900/50 text-green-300' :
    authenticity === 'questionable' ? 'bg-yellow-900/50 text-yellow-300' :
    'bg-red-900/50 text-red-300'
  }`}>
    {authenticity.toUpperCase()}
  </span>
);

const ExpertRecommendationCard: React.FC<{ recommendation: ExpertRecommendation }> = ({ recommendation }) => (
  <div className="bg-gray-800 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-medium text-white">{recommendation.expertType.replace('_', ' ').toUpperCase()}</h4>
      <span className={`px-2 py-1 rounded text-xs ${
        recommendation.urgency === 'immediate' ? 'bg-red-900/50 text-red-300' :
        recommendation.urgency === 'high' ? 'bg-yellow-900/50 text-yellow-300' :
        'bg-blue-900/50 text-blue-300'
      }`}>
        {recommendation.urgency.toUpperCase()}
      </span>
    </div>
    <p className="text-sm text-gray-300 mb-2">{recommendation.recommendation}</p>
    <p className="text-xs text-gray-400">{recommendation.rationale}</p>
  </div>
);

const VulnerableAreaCard: React.FC<{ area: VulnerableArea }> = ({ area }) => (
  <div className="bg-gray-800 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-medium text-white">{area.area}</h4>
      <span className={`px-2 py-1 rounded text-xs ${
        area.severity === 'critical' ? 'bg-red-900/50 text-red-300' :
        area.severity === 'high' ? 'bg-yellow-900/50 text-yellow-300' :
        'bg-blue-900/50 text-blue-300'
      }`}>
        {area.severity.toUpperCase()}
      </span>
    </div>
    <p className="text-sm text-gray-300 mb-3">{area.description}</p>
    <div className="space-y-2">
      <h5 className="text-xs font-medium text-gray-300">Potential Questions:</h5>
      {area.potentialQuestions.slice(0, 2).map((question, idx) => (
        <p key={idx} className="text-xs text-gray-400 italic">"{question}"</p>
      ))}
    </div>
  </div>
);

const RiskIndicator: React.FC<{ label: string; risk: string }> = ({ label, risk }) => (
  <div className="text-center">
    <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
      risk === 'low' ? 'bg-green-900/50' :
      risk === 'medium' ? 'bg-yellow-900/50' :
      'bg-red-900/50'
    }`}>
      <div className={`w-6 h-6 rounded-full ${
        risk === 'low' ? 'bg-green-500' :
        risk === 'medium' ? 'bg-yellow-500' :
        'bg-red-500'
      }`}></div>
    </div>
    <p className="text-xs text-gray-300">{label}</p>
    <p className="text-xs text-gray-400">{risk.toUpperCase()}</p>
  </div>
);

const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => (
  <span className={`px-2 py-1 rounded text-xs font-medium ${
    risk === 'low' ? 'bg-green-900/50 text-green-300' :
    risk === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
    'bg-red-900/50 text-red-300'
  }`}>
    {risk.toUpperCase()}
  </span>
);
