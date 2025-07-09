// Optimized Gemini API Service with Caching and Error Handling
import { GoogleGenerativeAI } from '@google/genai';

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

interface APIUsageStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  averageResponseTime: number;
  lastRequestTime: number;
}

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export class OptimizedGeminiService {
  private genAI: GoogleGenerativeAI;
  private cache: Map<string, CacheEntry> = new Map();
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private usageStats: APIUsageStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    averageResponseTime: 0,
    lastRequestTime: 0
  };

  private rateLimitConfig: RateLimitConfig = {
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000,
    maxRequestsPerDay: 10000
  };

  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  };

  private requestTimestamps: number[] = [];

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Clean up expired cache entries every 5 minutes
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
    
    // Clean up old request timestamps every hour
    setInterval(() => this.cleanupRequestTimestamps(), 60 * 60 * 1000);
  }

  // Enhanced analysis with legal grounding and caching
  async generateLegallyGroundedAnalysis(
    evidenceInfo: any,
    answers: any[],
    analysisType: 'comprehensive' | 'quick' | 'focused' = 'comprehensive'
  ): Promise<any> {
    const cacheKey = this.generateCacheKey('legal_analysis', { evidenceInfo, answers, analysisType });
    
    // Check cache first
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      this.usageStats.cacheHits++;
      return cachedResult;
    }

    this.usageStats.cacheMisses++;

    // Generate legally grounded prompt
    const prompt = this.generateLegalPrompt(evidenceInfo, answers, analysisType);
    
    try {
      const result = await this.makeAPIRequest(async () => {
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        const response = await model.generateContent(prompt);
        return this.parseAnalysisResponse(response.response.text());
      });

      // Cache the result (expires in 1 hour for comprehensive, 30 minutes for others)
      const cacheExpiry = analysisType === 'comprehensive' ? 60 * 60 * 1000 : 30 * 60 * 1000;
      this.setCache(cacheKey, result, cacheExpiry);

      return result;
    } catch (error) {
      this.usageStats.errors++;
      throw new Error(`Legal analysis failed: ${error.message}`);
    }
  }

  // Optimized AI critique with context awareness
  async getAICritique(
    question: any,
    answer: string,
    evidenceContext: any,
    legalRules: string[]
  ): Promise<any> {
    if (!answer.trim()) {
      return { error: 'No answer provided for critique' };
    }

    const cacheKey = this.generateCacheKey('critique', { questionId: question.id, answer, evidenceContext });
    
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      this.usageStats.cacheHits++;
      return cachedResult;
    }

    this.usageStats.cacheMisses++;

    const prompt = this.generateCritiquePrompt(question, answer, evidenceContext, legalRules);

    try {
      const result = await this.makeAPIRequest(async () => {
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        const response = await model.generateContent(prompt);
        return this.parseCritiqueResponse(response.response.text());
      });

      // Cache for 15 minutes
      this.setCache(cacheKey, result, 15 * 60 * 1000);
      return result;
    } catch (error) {
      this.usageStats.errors++;
      throw new Error(`AI critique failed: ${error.message}`);
    }
  }

  // Optimized key points generation
  async getAIKeyPoints(
    question: any,
    evidenceContext: any,
    legalRules: string[]
  ): Promise<any> {
    const cacheKey = this.generateCacheKey('key_points', { questionId: question.id, evidenceContext });
    
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      this.usageStats.cacheHits++;
      return cachedResult;
    }

    this.usageStats.cacheMisses++;

    const prompt = this.generateKeyPointsPrompt(question, evidenceContext, legalRules);

    try {
      const result = await this.makeAPIRequest(async () => {
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        const response = await model.generateContent(prompt);
        return this.parseKeyPointsResponse(response.response.text());
      });

      // Cache for 30 minutes
      this.setCache(cacheKey, result, 30 * 60 * 1000);
      return result;
    } catch (error) {
      this.usageStats.errors++;
      throw new Error(`Key points generation failed: ${error.message}`);
    }
  }

  // Batch processing for multiple requests
  async batchAnalyze(requests: Array<{ type: string; data: any }>): Promise<any[]> {
    const results: any[] = [];
    const batchSize = 5; // Process 5 requests at a time
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(async (request) => {
        switch (request.type) {
          case 'analysis':
            return this.generateLegallyGroundedAnalysis(request.data.evidenceInfo, request.data.answers);
          case 'critique':
            return this.getAICritique(request.data.question, request.data.answer, request.data.context, request.data.rules);
          case 'key_points':
            return this.getAIKeyPoints(request.data.question, request.data.context, request.data.rules);
          default:
            throw new Error(`Unknown request type: ${request.type}`);
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : { error: result.reason.message }
      ));

      // Add delay between batches to respect rate limits
      if (i + batchSize < requests.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  // Rate limiting and request queuing
  private async makeAPIRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          if (!this.checkRateLimit()) {
            throw new Error('Rate limit exceeded. Please try again later.');
          }

          const startTime = Date.now();
          const result = await this.executeWithRetry(requestFn);
          const endTime = Date.now();

          // Update usage statistics
          this.usageStats.totalRequests++;
          this.usageStats.lastRequestTime = endTime;
          this.usageStats.averageResponseTime = 
            (this.usageStats.averageResponseTime * (this.usageStats.totalRequests - 1) + (endTime - startTime)) / 
            this.usageStats.totalRequests;

          this.requestTimestamps.push(endTime);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async executeWithRetry<T>(requestFn: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt),
          this.retryConfig.maxDelay
        );

        await this.delay(delay);
      }
    }

    throw lastError;
  }

  private isRetryableError(error: any): boolean {
    // Retry on rate limit, timeout, and server errors
    const retryableErrors = [
      'RATE_LIMIT_EXCEEDED',
      'TIMEOUT',
      'INTERNAL_ERROR',
      'SERVICE_UNAVAILABLE'
    ];

    return retryableErrors.some(errorType => 
      error.message?.includes(errorType) || error.code?.includes(errorType)
    );
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        // Small delay between requests
        await this.delay(100);
      }
    }

    this.isProcessingQueue = false;
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentRequests = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    const hourlyRequests = this.requestTimestamps.filter(timestamp => timestamp > oneHourAgo);
    const dailyRequests = this.requestTimestamps.filter(timestamp => timestamp > oneDayAgo);

    return (
      recentRequests.length < this.rateLimitConfig.maxRequestsPerMinute &&
      hourlyRequests.length < this.rateLimitConfig.maxRequestsPerHour &&
      dailyRequests.length < this.rateLimitConfig.maxRequestsPerDay
    );
  }

  private cleanupRequestTimestamps(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneDayAgo);
  }

  // Cache management
  private generateCacheKey(type: string, data: any): string {
    const dataString = JSON.stringify(data);
    return `${type}_${this.hashString(dataString)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: any, ttlMs: number): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs
    };
    this.cache.set(key, entry);
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Enhanced prompt generation with legal context
  private generateLegalPrompt(evidenceInfo: any, answers: any[], analysisType: string): string {
    const legalContext = this.buildLegalContext(evidenceInfo);
    const answerContext = this.buildAnswerContext(answers);

    return `As a legal expert specializing in evidence law, provide a ${analysisType} analysis of the following digital evidence for court admissibility.

LEGAL FRAMEWORK:
${legalContext}

EVIDENCE DETAILS:
Type: ${evidenceInfo.type}
Description: ${evidenceInfo.description}
Jurisdiction: ${evidenceInfo.jurisdiction || 'Federal'}

ASSESSMENT RESPONSES:
${answerContext}

ANALYSIS REQUIREMENTS:
1. Evaluate compliance with Federal Rules of Evidence 901-902 (Authentication)
2. Assess Best Evidence Rule requirements (FRE 1001-1008)
3. Consider relevance standards (FRE 401-403)
4. Identify potential hearsay issues (FRE 801-807)
5. Provide specific rule citations for all recommendations

FORMAT: Provide response as JSON with sections for:
- overallConclusion (string)
- executiveSummary (object with overallConfidence, confidenceBreakdown, topRecommendations)
- analysisSections (array of detailed rule-by-rule analysis)
- recommendations (array of specific actionable items with rule citations)

Focus on practical admissibility strategies and specific legal citations.`;
  }

  private generateCritiquePrompt(question: any, answer: string, evidenceContext: any, legalRules: string[]): string {
    return `As a legal expert, critique this evidence assessment response for legal accuracy and completeness.

QUESTION: ${question.title}
${question.text}

RESPONSE TO CRITIQUE:
${answer}

APPLICABLE LEGAL RULES:
${legalRules.join('\n')}

EVIDENCE CONTEXT:
${JSON.stringify(evidenceContext, null, 2)}

Provide critique as JSON with:
- strengths: array of specific strengths with rule citations
- weaknesses: array of specific weaknesses with rule citations  
- recommendation: specific improvement recommendation with legal basis
- ruleCompliance: assessment of compliance with applicable rules

Focus on legal accuracy, completeness, and practical admissibility considerations.`;
  }

  private generateKeyPointsPrompt(question: any, evidenceContext: any, legalRules: string[]): string {
    return `As a legal expert, provide key points to address this evidence question effectively.

QUESTION: ${question.title}
${question.text}

APPLICABLE LEGAL RULES:
${legalRules.join('\n')}

EVIDENCE CONTEXT:
${JSON.stringify(evidenceContext, null, 2)}

Provide response as JSON with:
- keyPoints: array of 5-7 specific points to address with rule citations
- legalBasis: explanation of relevant legal standards
- practicalTips: specific advice for evidence presentation

Focus on actionable guidance with specific rule citations and practical application.`;
  }

  private buildLegalContext(evidenceInfo: any): string {
    return `
Federal Rules of Evidence:
- FRE 901: Authentication and Identification
- FRE 902: Evidence That Is Self-Authenticating  
- FRE 1001-1008: Best Evidence Rule
- FRE 401-403: Relevance Standards
- FRE 801-807: Hearsay Rules

Evidence Type Considerations for ${evidenceInfo.type}:
- Chain of custody requirements
- Technical authentication methods
- Metadata preservation standards
- Digital signature verification
`;
  }

  private buildAnswerContext(answers: any[]): string {
    return answers.map(answer => 
      `Q: ${answer.questionId}\nA: ${answer.value}\n`
    ).join('\n');
  }

  // Response parsing methods
  private parseAnalysisResponse(responseText: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(responseText);
    } catch {
      // Fallback to text parsing if JSON fails
      return this.parseTextResponse(responseText);
    }
  }

  private parseCritiqueResponse(responseText: string): any {
    try {
      return JSON.parse(responseText);
    } catch {
      return {
        strengths: ['Response provided'],
        weaknesses: ['Could not parse structured response'],
        recommendation: responseText.substring(0, 200) + '...',
        ruleCompliance: 'Unable to assess'
      };
    }
  }

  private parseKeyPointsResponse(responseText: string): any {
    try {
      return JSON.parse(responseText);
    } catch {
      // Extract key points from text
      const lines = responseText.split('\n').filter(line => line.trim());
      return {
        keyPoints: lines.slice(0, 7),
        legalBasis: 'See response text',
        practicalTips: ['Review full response for details']
      };
    }
  }

  private parseTextResponse(responseText: string): any {
    // Basic text parsing fallback
    return {
      overallConclusion: responseText.substring(0, 500) + '...',
      executiveSummary: {
        overallConfidence: 'Medium',
        confidenceBreakdown: { high: 0, medium: 1, low: 0 },
        topRecommendations: ['Review full analysis']
      },
      analysisSections: [],
      recommendations: ['Consult legal expert for detailed analysis']
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for monitoring and management
  getUsageStats(): APIUsageStats {
    return { ...this.usageStats };
  }

  getCacheStats(): { size: number; hitRate: number } {
    const totalRequests = this.usageStats.cacheHits + this.usageStats.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.usageStats.cacheHits / totalRequests) * 100 : 0;
    
    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  updateRateLimits(config: Partial<RateLimitConfig>): void {
    this.rateLimitConfig = { ...this.rateLimitConfig, ...config };
  }
}
