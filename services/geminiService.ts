import { GoogleGenAI } from '@google/genai';
import { EVIDENCE_QUESTIONS } from '../constants';
import { AnalysisResult, Answer, Question } from '../types';

// API Key Management
let currentApiKey: string | null = null;
let ai: GoogleGenAI | null = null;

// Check for API key in environment variables
const envApiKey =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.API_KEY;

// Initialize with environment key if available
if (envApiKey && envApiKey !== 'placeholder_api_key') {
  currentApiKey = envApiKey;
  ai = new GoogleGenAI({ apiKey: currentApiKey });
}

// API Key Status Types
export type ApiKeyStatus = 'missing' | 'environment' | 'user-provided';

// API Key management functions
export const setApiKey = (apiKey: string): void => {
  currentApiKey = apiKey;
  ai = new GoogleGenAI({ apiKey: apiKey });
  // Store in localStorage for persistence
  localStorage.setItem('gemini_api_key', apiKey);
};

// User-specific API key management (for progressive enhancement)
export const setUserApiKey = (apiKey: string): void => {
  setApiKey(apiKey);
  // Trigger a refresh event for components to update
  window.dispatchEvent(new CustomEvent('apiKeyChanged', { detail: { status: getApiKeyStatus() } }));
};

export const clearUserApiKey = (): void => {
  localStorage.removeItem('gemini_api_key');
  currentApiKey = null;
  ai = null;

  // Re-initialize with environment key if available
  if (envApiKey && envApiKey !== 'placeholder_api_key') {
    currentApiKey = envApiKey;
    ai = new GoogleGenAI({ apiKey: currentApiKey });
  }

  // Trigger a refresh event for components to update
  window.dispatchEvent(new CustomEvent('apiKeyChanged', { detail: { status: getApiKeyStatus() } }));
};

export const getApiKey = (): string | null => {
  if (currentApiKey) return currentApiKey;

  // Try to get from localStorage
  const storedKey = localStorage.getItem('gemini_api_key');
  if (storedKey) {
    currentApiKey = storedKey;
    ai = new GoogleGenAI({ apiKey: storedKey });
    return storedKey;
  }

  return null;
};

export const clearApiKey = (): void => {
  currentApiKey = null;
  ai = null;
  localStorage.removeItem('gemini_api_key');
};

export const isApiKeyConfigured = (): boolean => {
  return !!getApiKey();
};

export const getApiKeyStatus = (): ApiKeyStatus => {
  const userKey = localStorage.getItem('gemini_api_key');
  if (userKey) return 'user-provided';

  if (envApiKey && envApiKey !== 'placeholder_api_key') return 'environment';

  return 'missing';
};

// Demo functions for educational purposes when no API key is present
export const getDemoKeyPoints = (question: Question): { keyPoints: string[] } => {
  const demoPoints: Record<string, string[]> = {
    'Authentication': [
      'Document the source and method of evidence collection',
      'Establish chain of custody with detailed timestamps',
      'Verify digital signatures or metadata when available',
      'Prepare witness testimony for authentication'
    ],
    'Chain of Custody': [
      'Maintain detailed logs of all evidence handlers',
      'Document any transfers with signatures and timestamps',
      'Ensure secure storage and access controls',
      'Address any gaps in custody documentation'
    ],
    'Reliability': [
      'Verify the accuracy of digital evidence collection methods',
      'Document the technical process used to obtain evidence',
      'Ensure evidence has not been altered or corrupted',
      'Prepare technical expert testimony if needed'
    ],
    'Best Evidence Rule': [
      'Provide original digital files when possible',
      'Explain any copies or duplicates with proper justification',
      'Document the process used to create copies',
      'Ensure copies are accurate representations of originals'
    ]
  };

  const factor = question.factor;
  const points = demoPoints[factor] || [
    'Provide detailed documentation for this evidence factor',
    'Follow established legal procedures and best practices',
    'Prepare supporting witness testimony and expert opinions',
    'Address potential challenges or weaknesses proactively'
  ];

  return { keyPoints: points };
};

export const getDemoCritique = (question: Question, answer: string): {
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
} => {
  if (!answer.trim()) {
    return {
      strengths: [],
      weaknesses: ['No response provided'],
      recommendation: 'Please provide a detailed answer to receive personalized feedback. Add your API key for AI-powered critique.'
    };
  }

  const wordCount = answer.split(/\s+/).length;
  const hasSpecificDetails = answer.toLowerCase().includes('timestamp') ||
                            answer.toLowerCase().includes('signature') ||
                            answer.toLowerCase().includes('document');

  return {
    strengths: [
      wordCount > 50 ? 'Provides detailed response' : 'Response addresses the question',
      hasSpecificDetails ? 'Includes specific procedural details' : 'Shows understanding of the topic'
    ],
    weaknesses: [
      wordCount < 30 ? 'Could provide more detailed explanation' : 'Consider adding more specific examples',
      'Demo analysis - add API key for personalized AI feedback'
    ],
    recommendation: 'This is demonstration feedback. Add your Gemini API key to receive detailed, personalized critique based on legal best practices and your specific evidence context.'
  };
};

// Initialize from localStorage on module load
const storedKey = localStorage.getItem('gemini_api_key');
if (storedKey && !currentApiKey) {
  setApiKey(storedKey);
}

const getAI = (): GoogleGenAI => {
  if (!ai) {
    const status = getApiKeyStatus();
    let message = 'API key not configured. ';

    if (status === 'missing') {
      message += 'Please add your Gemini API key to enable AI features. You can get a free API key from Google AI Studio.';
    } else {
      message += 'Please check your API key configuration.';
    }

    throw new Error(message);
  }
  return ai;
};

interface EvidenceInfo {
  name: string;
  description: string;
  type: string;
}

const parseJsonResponse = <T>(text: string): T => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  return JSON.parse(jsonStr) as T;
};

export const getAIKeyPoints = async (
  question: Question
): Promise<{ keyPoints: string[] }> => {
  const prompt = `
        A user is answering a question for a legal evidence admissibility report. 
        The question is about the factor: "${question.factor}".
        The full question is: "${question.text}"

        Provide a few concise key points (3-4) that a strong answer should include.
        Focus on legal best practices and what a court would look for.

        Return your answer as a single, valid JSON object that conforms to the following TypeScript interface:
        \`\`\`typescript
        interface KeyPointsResult {
            keyPoints: string[]; // Array of concise strings.
        }
        \`\`\`
    `;
  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    return parseJsonResponse<{ keyPoints: string[] }>(response.text);
  } catch (error) {
    console.error('Error getting AI key points:', error);
    const status = getApiKeyStatus();

    if (status === 'missing') {
      throw new Error(
        'AI features require an API key. Please add your Gemini API key to get AI-powered insights and recommendations.'
      );
    }

    throw new Error(
      'Failed to get key points from AI. Please check your API key and network connection.'
    );
  }
};

export const getAICritique = async (
  question: Question,
  answer: string
): Promise<{
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}> => {
  const prompt = `
        You are a legal expert reviewing a draft response for an evidence admissibility questionnaire.

        The legal factor being addressed is: "${question.factor}"
        The specific question is: "${question.text}"
        The user's draft answer is: "${answer}"

        Provide a concise critique of the draft. Identify its main strengths, weaknesses, and provide a single, primary recommendation for improvement.
        
        Return your answer as a single, valid JSON object that conforms to the following TypeScript interface:
        \`\`\`typescript
        interface CritiqueResult {
          strengths: string[]; // 1-2 strengths. If none, return empty array.
          weaknesses: string[]; // 1-2 weaknesses. If none, return empty array.
          recommendation: string; // A single, actionable recommendation.
        }
        \`\`\`
    `;
  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    return parseJsonResponse<{
      strengths: string[];
      weaknesses: string[];
      recommendation: string;
    }>(response.text);
  } catch (error) {
    console.error('Error getting AI critique:', error);
    const status = getApiKeyStatus();

    if (status === 'missing') {
      throw new Error(
        'AI critique requires an API key. Please add your Gemini API key to get personalized feedback on your responses.'
      );
    }

    throw new Error(
      'Failed to get critique from AI. Please check your API key and network connection.'
    );
  }
};

export const generateComprehensiveAnalysis = async (
  answers: Answer[],
  evidenceInfo: EvidenceInfo
): Promise<AnalysisResult> => {
  const answersText = answers
    .map((answer) => {
      const question = EVIDENCE_QUESTIONS.find(
        (q) => q.id === answer.questionId
      );
      return `Section: ${question?.section}\nFactor: ${question?.factor}\nQuestion: ${question?.text}\nUser's Answer: ${answer.value}\n\n`;
    })
    .join('');

  const prompt = `
    You are an expert legal analyst specializing in the admissibility of digital evidence in U.S. courts.

    First, here is the description of the digital evidence being analyzed. This context is crucial for your analysis. Refer to it when assessing the user's answers.
    - Evidence Name/ID: ${evidenceInfo.name || 'Not provided'}
    - Evidence Type: ${evidenceInfo.type || 'Not provided'}
    - Description: ${evidenceInfo.description || 'Not provided'}

    Now, analyze the following user-provided answers for each factor of evidence admissibility. Your response MUST be a single, valid JSON object that conforms to the TypeScript interface provided below.

    **Analysis Steps:**
    1.  **Factor-by-Factor Analysis:** For each factor, provide:
        - A summary of the user's response.
        - An admissibility confidence level: 'High', 'Medium', or 'Low'.
        - A list of strengths.
        - A list of weaknesses.
        - Actionable recommendations to mitigate weaknesses.
        - Potential cross-examination questions an opposing attorney might ask.
        - Recommended text for a motion to suppress.
    2.  **Section Summaries:** For each section (e.g., 'Foundational Admissibility'), write a high-level summary.
    3.  **Overall Conclusion:** Write a final, high-level conclusion for the entire body of evidence.
    4.  **Executive Summary:** After completing all analysis, create an executive summary.
        - For 'overallConfidence', choose the level that best represents the entire analysis.
        - For 'confidenceBreakdown', count the number of factors at each confidence level.
        - For 'topRecommendations', synthesize and extract the three most critical and impactful actionable recommendations from the entire report.

    **JSON Output Structure:**
    Your entire output must be a single JSON object matching this TypeScript interface:
    \`\`\`typescript
    interface ExecutiveSummary {
      overallConfidence: 'High' | 'Medium' | 'Low';
      confidenceBreakdown: {
        high: number;
        medium: number;
        low: number;
      };
      topRecommendations: string[]; // The 3 most critical recommendations.
    }

    interface FactorAnalysis {
      factor: string;
      summary: string;
      admissibilityConfidence: 'High' | 'Medium' | 'Low';
      strengths: string[];
      weaknesses: string[];
      actionableRecommendations: string[];
      crossExaminationQuestions: string[];
      recommendedSuppressionText: string[];
    }

    interface AnalysisSection {
      sectionTitle: string;
      sectionSummary: string;
      factorAnalyses: FactorAnalysis[];
    }

    interface AnalysisResult {
      executiveSummary: ExecutiveSummary; // **NEW** Populate this summary.
      overallConclusion: string;
      analysisSections: AnalysisSection[];
    }
    \`\`\`

    Here are the user's answers:
    ---
    ${answersText}
    ---

    Now, generate the complete JSON output. Ensure every field is populated. For recommendations, be specific, practical, and legally sound.
    `;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    return parseJsonResponse<AnalysisResult>(response.text);
  } catch (error) {
    console.error('Error generating comprehensive analysis:', error);
    const status = getApiKeyStatus();

    if (status === 'missing') {
      throw new Error(
        'AI analysis requires an API key. Please add your Gemini API key to generate comprehensive legal analysis reports.'
      );
    }

    throw new Error(
      'Failed to generate the analysis. Please check your API key and network connection.'
    );
  }
};
