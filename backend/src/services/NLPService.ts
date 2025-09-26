/**
 * Natural Language Processing Service
 * Provides text analysis, sentiment analysis, and insight extraction
 */

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  score: number; // -1 to 1, where -1 is most negative, 1 is most positive
  emotions?: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
  };
}

export interface TextInsight {
  topic: string;
  relevance: number;
  keywords: string[];
  summary: string;
  sentiment: SentimentResult;
}

export interface EntityExtraction {
  entities: Array<{
    text: string;
    type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'DATE' | 'MONEY' | 'PRODUCT' | 'EVENT';
    confidence: number;
  }>;
  relationships: Array<{
    subject: string;
    predicate: string;
    object: string;
    confidence: number;
  }>;
}

export interface TextClassification {
  category: string;
  confidence: number;
  subcategories: Array<{
    name: string;
    confidence: number;
  }>;
}

export class NLPService {

  /**
   * Sentiment Analysis with Emotion Detection
   */
  static analyzeSentiment(text: string): SentimentResult {
    if (!text || text.trim().length === 0) {
      return {
        sentiment: 'neutral',
        confidence: 0,
        score: 0
      };
    }

    const cleanText = text.toLowerCase().trim();
    
    // Define sentiment lexicons
    const positiveWords = [
      'excellent', 'outstanding', 'amazing', 'fantastic', 'great', 'good', 'positive',
      'successful', 'effective', 'efficient', 'profitable', 'growing', 'improved',
      'increase', 'gain', 'achievement', 'success', 'opportunity', 'advantage',
      'satisfied', 'happy', 'pleased', 'delighted', 'excited', 'optimistic',
      'love', 'like', 'appreciate', 'recommend', 'impressive', 'wonderful'
    ];

    const negativeWords = [
      'terrible', 'awful', 'horrible', 'bad', 'poor', 'negative', 'failed',
      'unsuccessful', 'ineffective', 'inefficient', 'loss', 'decrease', 'decline',
      'problem', 'issue', 'concern', 'challenge', 'risk', 'threat', 'disadvantage',
      'unsatisfied', 'unhappy', 'disappointed', 'frustrated', 'worried', 'pessimistic',
      'hate', 'dislike', 'complain', 'terrible', 'disappointing', 'concerning'
    ];

    const emotionWords = {
      joy: ['happy', 'excited', 'delighted', 'pleased', 'joyful', 'cheerful', 'satisfied'],
      anger: ['angry', 'frustrated', 'annoyed', 'irritated', 'furious', 'mad', 'upset'],
      fear: ['worried', 'anxious', 'scared', 'concerned', 'nervous', 'afraid', 'uncertain'],
      sadness: ['sad', 'disappointed', 'unhappy', 'depressed', 'gloomy', 'miserable'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'sudden']
    };

    // Calculate sentiment scores
    let positiveScore = 0;
    let negativeScore = 0;
    let totalWords = 0;

    const words = cleanText.split(/\s+/);
    totalWords = words.length;

    words.forEach(word => {
      if (positiveWords.includes(word)) {
        positiveScore++;
      }
      if (negativeWords.includes(word)) {
        negativeScore++;
      }
    });

    // Calculate emotion scores
    const emotions = {
      joy: 0,
      anger: 0,
      fear: 0,
      sadness: 0,
      surprise: 0
    };

    Object.entries(emotionWords).forEach(([emotion, wordList]) => {
      const count = words.filter(word => wordList.includes(word)).length;
      emotions[emotion as keyof typeof emotions] = totalWords > 0 ? count / totalWords : 0;
    });

    // Determine overall sentiment
    const netScore = positiveScore - negativeScore;
    const normalizedScore = totalWords > 0 ? netScore / totalWords : 0;
    
    let sentiment: 'positive' | 'negative' | 'neutral';
    let score: number;
    
    if (normalizedScore > 0.05) {
      sentiment = 'positive';
      score = Math.min(1, normalizedScore * 5);
    } else if (normalizedScore < -0.05) {
      sentiment = 'negative';
      score = Math.max(-1, normalizedScore * 5);
    } else {
      sentiment = 'neutral';
      score = normalizedScore;
    }

    const confidence = Math.min(1, Math.abs(score) + 0.2);

    return {
      sentiment,
      confidence,
      score,
      emotions
    };
  }

  /**
   * Extract Key Topics and Insights from Text
   */
  static extractInsights(text: string, context?: 'business' | 'feedback' | 'report'): TextInsight[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const insights: TextInsight[] = [];
    const sentences = this.splitIntoSentences(text);
    
    // Define topic keywords by context
    const topicKeywords = {
      business: {
        'Revenue & Sales': ['revenue', 'sales', 'income', 'profit', 'earning', 'money', 'financial'],
        'Customer Experience': ['customer', 'client', 'user', 'satisfaction', 'feedback', 'experience'],
        'Operations': ['process', 'operation', 'workflow', 'efficiency', 'productivity', 'performance'],
        'Growth & Strategy': ['growth', 'expansion', 'strategy', 'market', 'competition', 'opportunity'],
        'Technology': ['technology', 'system', 'software', 'digital', 'automation', 'innovation'],
        'Team & HR': ['team', 'employee', 'staff', 'hiring', 'training', 'management']
      },
      feedback: {
        'Product Quality': ['quality', 'product', 'feature', 'functionality', 'usability'],
        'Service Experience': ['service', 'support', 'help', 'assistance', 'response'],
        'Value & Pricing': ['price', 'cost', 'value', 'expensive', 'cheap', 'worth'],
        'Delivery & Logistics': ['delivery', 'shipping', 'logistics', 'time', 'fast', 'slow'],
        'Communication': ['communication', 'information', 'update', 'notification', 'contact']
      },
      report: {
        'Performance Metrics': ['performance', 'metric', 'kpi', 'target', 'goal', 'achievement'],
        'Trends & Analysis': ['trend', 'analysis', 'pattern', 'change', 'increase', 'decrease'],
        'Risks & Issues': ['risk', 'issue', 'problem', 'challenge', 'concern', 'threat'],
        'Opportunities': ['opportunity', 'potential', 'improvement', 'optimization', 'enhancement'],
        'Recommendations': ['recommend', 'suggest', 'propose', 'action', 'next', 'step']
      }
    };

    const currentTopics = topicKeywords[context || 'business'];

    // Analyze each topic
    Object.entries(currentTopics).forEach(([topic, keywords]) => {
      const relevantSentences = sentences.filter(sentence => 
        keywords.some(keyword => sentence.toLowerCase().includes(keyword))
      );

      if (relevantSentences.length > 0) {
        const topicText = relevantSentences.join(' ');
        const relevance = relevantSentences.length / sentences.length;
        const extractedKeywords = this.extractKeywords(topicText, keywords);
        const summary = this.generateSummary(relevantSentences);
        const sentiment = this.analyzeSentiment(topicText);

        insights.push({
          topic,
          relevance,
          keywords: extractedKeywords,
          summary,
          sentiment
        });
      }
    });

    // Sort by relevance
    return insights.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Entity Extraction and Relationship Analysis
   */
  static extractEntities(text: string): EntityExtraction {
    if (!text || text.trim().length === 0) {
      return { entities: [], relationships: [] };
    }

    const entities: EntityExtraction['entities'] = [];
    const relationships: EntityExtraction['relationships'] = [];

    // Define patterns for different entity types
    const patterns = {
      MONEY: /\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*\s*(?:dollars?|USD|€|euros?)/gi,
      DATE: /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}-\d{1,2}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi,
      ORGANIZATION: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]*)*\s+(?:Inc|Corp|LLC|Ltd|Company|Co\.)\b/g,
      PERSON: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g // Simple pattern for names
    };

    // Extract entities using patterns
    Object.entries(patterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            text: match.trim(),
            type: type as any,
            confidence: 0.8 // Basic confidence score
          });
        });
      }
    });

    // Extract product/service entities
    const businessTerms = ['revenue', 'profit', 'sales', 'customers', 'users', 'products', 'services'];
    businessTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        entities.push({
          text: term,
          type: 'PRODUCT',
          confidence: 0.6
        });
      }
    });

    // Extract simple relationships (subject-verb-object)
    const sentences = this.splitIntoSentences(text);
    sentences.forEach(sentence => {
      const words = sentence.split(/\s+/);
      for (let i = 0; i < words.length - 2; i++) {
        const subject = words[i];
        const verb = words[i + 1];
        const object = words[i + 2];

        // Simple relationship detection
        if (this.isActionVerb(verb) && subject.length > 2 && object.length > 2) {
          relationships.push({
            subject: subject.replace(/[^\w\s]/g, ''),
            predicate: verb.toLowerCase(),
            object: object.replace(/[^\w\s]/g, ''),
            confidence: 0.5
          });
        }
      }
    });

    return {
      entities: entities.slice(0, 20), // Limit results
      relationships: relationships.slice(0, 10)
    };
  }

  /**
   * Text Classification for Business Content
   */
  static classifyText(text: string): TextClassification {
    if (!text || text.trim().length === 0) {
      return {
        category: 'Unknown',
        confidence: 0,
        subcategories: []
      };
    }

    const categories = {
      'Financial Report': {
        keywords: ['revenue', 'profit', 'loss', 'budget', 'expense', 'financial', 'income', 'cost'],
        subcategories: ['Revenue Analysis', 'Expense Report', 'Budget Planning', 'Profit Analysis']
      },
      'Customer Feedback': {
        keywords: ['customer', 'feedback', 'review', 'satisfaction', 'complaint', 'praise', 'experience'],
        subcategories: ['Product Review', 'Service Feedback', 'Support Issue', 'General Feedback']
      },
      'Performance Report': {
        keywords: ['performance', 'kpi', 'metric', 'target', 'goal', 'achievement', 'efficiency'],
        subcategories: ['KPI Analysis', 'Goal Tracking', 'Efficiency Report', 'Performance Review']
      },
      'Strategic Planning': {
        keywords: ['strategy', 'planning', 'growth', 'expansion', 'market', 'competition', 'opportunity'],
        subcategories: ['Market Analysis', 'Growth Strategy', 'Competitive Analysis', 'Strategic Planning']
      },
      'Operational Update': {
        keywords: ['operation', 'process', 'workflow', 'procedure', 'system', 'automation', 'efficiency'],
        subcategories: ['Process Improvement', 'System Update', 'Workflow Optimization', 'Operational Review']
      },
      'Risk Assessment': {
        keywords: ['risk', 'threat', 'concern', 'issue', 'problem', 'challenge', 'mitigation'],
        subcategories: ['Risk Analysis', 'Issue Report', 'Threat Assessment', 'Mitigation Strategy']
      }
    };

    const text_lower = text.toLowerCase();
    const categoryScores: Record<string, number> = {};

    // Calculate scores for each category
    Object.entries(categories).forEach(([category, config]) => {
      const keywordMatches = config.keywords.filter(keyword => 
        text_lower.includes(keyword)
      ).length;
      
      categoryScores[category] = keywordMatches / config.keywords.length;
    });

    // Find best matching category
    const bestCategory = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0];

    if (!bestCategory || bestCategory[1] === 0) {
      return {
        category: 'General Business',
        confidence: 0.3,
        subcategories: []
      };
    }

    const [categoryName, confidence] = bestCategory;
    const categoryConfig = categories[categoryName as keyof typeof categories];

    // Determine subcategories
    const subcategories = categoryConfig.subcategories.map(sub => ({
      name: sub,
      confidence: Math.random() * 0.5 + 0.3 // Mock confidence for subcategories
    })).sort((a, b) => b.confidence - a.confidence).slice(0, 3);

    return {
      category: categoryName,
      confidence: Math.min(1, confidence + 0.3),
      subcategories
    };
  }

  /**
   * Generate Automatic Summary
   */
  static generateSummary(sentences: string[], maxSentences: number = 3): string {
    if (sentences.length === 0) return '';
    if (sentences.length <= maxSentences) return sentences.join(' ');

    // Score sentences based on keyword frequency and position
    const wordFreq: Record<string, number> = {};
    const allWords = sentences.join(' ').toLowerCase().split(/\s+/);
    
    // Calculate word frequencies
    allWords.forEach(word => {
      if (word.length > 3 && !this.isStopWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Score sentences
    const sentenceScores = sentences.map((sentence, index) => {
      const words = sentence.toLowerCase().split(/\s+/);
      const score = words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
      const positionBonus = index === 0 ? 1.5 : 1; // First sentence bonus
      return { sentence, score: score * positionBonus, index };
    });

    // Select top sentences
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .sort((a, b) => a.index - b.index); // Maintain original order

    return topSentences.map(s => s.sentence).join(' ');
  }

  /**
   * Analyze Text Complexity and Readability
   */
  static analyzeReadability(text: string): {
    complexity: 'simple' | 'moderate' | 'complex';
    reading_level: number;
    word_count: number;
    sentence_count: number;
    avg_words_per_sentence: number;
    difficult_words: string[];
  } {
    if (!text || text.trim().length === 0) {
      return {
        complexity: 'simple',
        reading_level: 1,
        word_count: 0,
        sentence_count: 0,
        avg_words_per_sentence: 0,
        difficult_words: []
      };
    }

    const sentences = this.splitIntoSentences(text);
    const words = text.split(/\s+/).filter(word => word.length > 0);
    
    const word_count = words.length;
    const sentence_count = sentences.length;
    const avg_words_per_sentence = sentence_count > 0 ? word_count / sentence_count : 0;

    // Identify difficult words (more than 2 syllables or technical terms)
    const difficult_words = words.filter(word => 
      this.countSyllables(word) > 2 || this.isTechnicalTerm(word)
    ).slice(0, 10);

    // Calculate complexity based on sentence length and difficult words
    const complexityScore = avg_words_per_sentence * 0.5 + (difficult_words.length / word_count) * 100;
    
    let complexity: 'simple' | 'moderate' | 'complex';
    let reading_level: number;

    if (complexityScore < 10) {
      complexity = 'simple';
      reading_level = Math.max(1, Math.min(6, complexityScore));
    } else if (complexityScore < 20) {
      complexity = 'moderate';
      reading_level = Math.max(6, Math.min(12, complexityScore));
    } else {
      complexity = 'complex';
      reading_level = Math.max(12, Math.min(20, complexityScore));
    }

    return {
      complexity,
      reading_level,
      word_count,
      sentence_count,
      avg_words_per_sentence: Math.round(avg_words_per_sentence * 10) / 10,
      difficult_words
    };
  }

  /**
   * Utility Methods
   */
  private static splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  }

  private static extractKeywords(text: string, seedKeywords: string[]): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const keywords = new Set<string>();

    // Add seed keywords that appear in text
    seedKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        keywords.add(keyword);
      }
    });

    // Add frequently occurring non-stop words
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 3 && !this.isStopWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const frequentWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    frequentWords.forEach(word => keywords.add(word));

    return Array.from(keywords).slice(0, 10);
  }

  private static isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ];
    return stopWords.includes(word.toLowerCase());
  }

  private static isActionVerb(word: string): boolean {
    const actionVerbs = [
      'increase', 'decrease', 'improve', 'reduce', 'enhance', 'optimize',
      'analyze', 'implement', 'develop', 'create', 'generate', 'produce',
      'achieve', 'reach', 'exceed', 'perform', 'execute', 'complete'
    ];
    return actionVerbs.includes(word.toLowerCase());
  }

  private static countSyllables(word: string): number {
    if (!word) return 0;
    
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    // Simple syllable counting heuristic
    let syllables = word.replace(/[^aeiouy]/g, '').length;
    if (word.endsWith('e')) syllables--;
    if (word.includes('le') && word.length > 2) syllables++;
    
    return Math.max(1, syllables);
  }

  private static isTechnicalTerm(word: string): boolean {
    const technicalTerms = [
      'algorithm', 'analytics', 'automation', 'optimization', 'implementation',
      'infrastructure', 'methodology', 'configuration', 'integration', 'scalability'
    ];
    return technicalTerms.includes(word.toLowerCase()) || word.length > 12;
  }
}
