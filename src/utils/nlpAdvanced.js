/**
 * Advanced NLP Features
 * Enhanced intent recognition, sentiment analysis, sarcasm detection, urgency scoring
 */

import nlp from 'compromise';
import Sentiment from 'sentiment';

// ============================================================================
// 1. ENHANCED INTENT RECOGNITION
// ============================================================================

const INTENT_PATTERNS = {
  Greeting: {
    patterns: [/^hi[,!\s]/i, /^hello[,!]?$/i, /^hey[,!]?$/i, /^good morning/i, /^good afternoon/i, /^good evening/i, /^greetings/i],
    confidence: 0.95
  },
  Gratitude: {
    patterns: [/thanks?/i, /thank you/i, /appreciate/i, /grateful/i, /very kind/i, /so helpful/i, /much obliged/i],
    confidence: 0.92
  },
  Complaint: {
    patterns: [/not working/i, /doesn'?t work/i, /broken/i, /error/i, /problem/i, /issue/i, /bug/i, /glitch/i, /frustrated/i, /annoyed/i, /useless/i, /terrible/i, /horrible/i, /worst/i, /hate/i, /disappointed/i, /waste of/i, /can'?t get/i, /unable to/i],
    confidence: 0.88
  },
  Request: {
    patterns: [/^(can you|could you|would you)/i, /please/i, /i need/i, /i want/i, /help me/i, /show me/i, /tell me/i, /give me/i],
    confidence: 0.85
  },
  Question: {
    patterns: [/^who[\s?]/i, /^what[\s?]/i, /^when[\s?]/i, /^where[\s?]/i, /^why[\s?]/i, /^how[\s?]/i, /^which[\s?]/i, /^is[\s?]/i, /^are[\s?]/i, /^do[\s?]/i, /^does[\s?]/i, /^can[\s?]/i, /^could[\s?]/i, /^would[\s?]/i, /^should[\s?]/i, /^will[\s?]/i, /^may[\s?]/i, /.$/],
    confidence: 0.80
  },
  Command: {
    patterns: [/^(tell|show|explain|give|find|list|describe|calculate|compute|generate|create|make|get|fetch|search|look up|check|verify|analyze|run|execute|open|close|send|delete|remove|add|update|change|set)\s/i],
    confidence: 0.87
  },
  Farewell: {
    patterns: [/bye/i, /goodbye/i, /see you/i, /take care/i, /have a good/i, /talk to you later/i, /gtg/i, /gotta go/i],
    confidence: 0.90
  },
  Confirmation: {
    patterns: [/^yes/i, /^yeah/i, /^yep/i, /^sure/i, /^ok/i, /^okay/i, /^correct/i, /^that'?s right/i, /^exactly/i, /^absolutely/i, /^definitely/i],
    confidence: 0.88
  },
  Denial: {
    patterns: [/^no/i, /^nope/i, /^not really/i, /^i don'?t think/i, /^disagree/i, /^wrong/i, /^incorrect/i],
    confidence: 0.88
  },
  Statement: {
    patterns: [],
    confidence: 0.50
  }
};

export function detectIntentEnhanced(text, context = {}) {
  const lowerText = text.toLowerCase().trim();
  const scores = [];

  // Check each intent category
  for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
    if (config.patterns.length === 0) continue;

    for (const pattern of config.patterns) {
      if (pattern.test(lowerText) || pattern.test(text)) {
        scores.push({ intent, score: config.confidence, pattern: pattern.toString() });
        break;
      }
    }
  }

  // Sort by score
  scores.sort((a, b) => b.score - a.score);

  if (scores.length === 0) {
    return {
      intent: 'Statement',
      confidence: 0.50,
      confidencePercent: 50,
      allIntents: [{ intent: 'Statement', confidence: 0.50 }]
    };
  }

  const topIntent = scores[0];
  const allIntents = scores.map(s => ({ intent: s.intent, confidence: s.score }));

  // Check for low confidence
  const isLowConfidence = topIntent.score < 0.7;

  return {
    intent: topIntent.intent,
    confidence: topIntent.score,
    confidencePercent: Math.round(topIntent.score * 100),
    allIntents,
    isLowConfidence,
    matchedPattern: topIntent.pattern
  };
}

// ============================================================================
// 2. SENTIMENT VOLATILITY & TREND ANALYSIS
// ============================================================================

export function calculateSentimentVolatility(sentimentHistory) {
  if (sentimentHistory.length < 2) {
    return { volatility: 0, trend: 'stable', sparkline: [0] };
  }

  const scores = sentimentHistory.map(s => s.comparative || 0);

  // Calculate volatility (standard deviation)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const volatility = Math.sqrt(variance);

  // Calculate trend (linear regression slope)
  const n = scores.length;
  const xSum = n * (n + 1) / 2;
  const ySum = scores.reduce((a, b) => a + b, 0);
  const xySum = scores.reduce((sum, s, i) => sum + (i + 1) * s, 0);
  const xxSum = n * (n + 1) * (2 * n + 1) / 6;

  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);

  let trend = 'stable';
  if (slope > 0.1) trend = 'improving';
  else if (slope < -0.1) trend = 'declining';

  // Create sparkline data points (normalized to 0-100)
  const min = Math.min(...scores, -1);
  const max = Math.max(...scores, 1);
  const range = max - min || 1;
  const sparkline = scores.map(s => Math.round(((s - min) / range) * 100));

  return {
    volatility: Math.round(volatility * 100) / 100,
    trend,
    sparkline,
    mean: Math.round(mean * 100) / 100,
    slope: Math.round(slope * 1000) / 1000
  };
}

// ============================================================================
// 3. SARCASM DETECTION
// ============================================================================

const SARCASM_INDICATORS = {
  // Positive words in negative context
  incongruence: {
    patterns: [/oh great/i, /oh wonderful/i, /just what i needed/i, /thanks a lot/i, /thanks for nothing/i, /perfect timing/i, /as if/i],
    weight: 0.8
  },
  // Exaggeration markers
  exaggeration: {
    patterns: [/obviously/i, /clearly/i, /of course/i, /sure thing/i, /yeah right/i, /right/i, /totally/i, /absolutely/i],
    weight: 0.5
  },
  // Punctuation patterns
  punctuation: {
    patterns: [/!+$/, /\?+$/, /\.\.\.$/, /~+$/],
    weight: 0.4
  },
  // Emoticons
  emoticons: {
    patterns: [/\(-:_\)/, /:-\/\)/, /\¯_\(ツ\)_\/¯/, /🙄/, /😏/, /🤨/, /😒/],
    weight: 0.7
  }
};

export function detectSarcasm(text, sentimentResult) {
  const lowerText = text.toLowerCase();
  let score = 0;
  const indicators = [];

  // Check for incongruence (positive words, negative sentiment)
  for (const pattern of SARCASM_INDICATORS.incongruence.patterns) {
    if (pattern.test(lowerText)) {
      score += SARCASM_INDICATORS.incongruence.weight;
      indicators.push('incongruence');
      break;
    }
  }

  // Check for exaggeration
  const exaggerationCount = SARCASM_INDICATORS.exaggeration.patterns.filter(p => p.test(lowerText)).length;
  if (exaggerationCount > 0) {
    score += Math.min(1, exaggerationCount * 0.2) * SARCASM_INDICATORS.exaggeration.weight;
    indicators.push('exaggeration');
  }

  // Check for unusual punctuation
  for (const pattern of SARCASM_INDICATORS.punctuation.patterns) {
    if (pattern.test(text)) {
      score += SARCASM_INDICATORS.punctuation.weight;
      indicators.push('unusual punctuation');
      break;
    }
  }

  // Check for emoticons
  for (const pattern of SARCASM_INDICATORS.emoticons.patterns) {
    if (pattern.test(text)) {
      score += SARCASM_INDICATORS.emoticons.weight;
      indicators.push('sarcastic emoticon');
      break;
    }
  }

  // Check for sentiment incongruence
  const hasPositiveWords = /great|wonderful|amazing|awesome|fantastic|excellent|perfect|love/i.test(lowerText);
  const isNegativeSentiment = sentimentResult && sentimentResult.comparative < 0;
  if (hasPositiveWords && isNegativeSentiment) {
    score += 0.6;
    indicators.push('sentiment incongruence');
  }

  const isSarcastic = score >= 0.5;
  const confidence = Math.min(1, score);

  return {
    isSarcastic,
    confidence: Math.round(confidence * 100),
    indicators,
    score: Math.round(score * 100) / 100
  };
}

// ============================================================================
// 4. URGENCY SCORING
// ============================================================================

const URGENCY_FACTORS = {
  emotions: {
    Anger: 0.9,
    Fear: 0.8,
    Disgust: 0.7,
    Sadness: 0.5,
    Surprise: 0.4,
    Joy: 0.1,
    Neutral: 0.2
  },
  intents: {
    Complaint: 0.9,
    Request: 0.7,
    Question: 0.5,
    Command: 0.6,
    Gratitude: 0.1,
    Greeting: 0.1,
    Farewell: 0.2
  },
  keywords: {
    urgent: ['urgent', 'asap', 'immediately', 'right now', 'emergency', 'critical', 'urgent', 'priority', 'rush', 'hurry'],
    high: ['soon', 'today', 'quickly', 'fast', 'important', 'serious', 'badly'],
    medium: ['need', 'want', 'please', 'help', 'issue', 'problem']
  }
};

export function calculateUrgencyScore(emotion, intent, text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  const factors = [];

  // Emotion factor (0-0.4)
  const emotionScore = URGENCY_FACTORS.emotions[emotion?.emotion] || 0.2;
  score += emotionScore * 0.4;
  if (emotionScore >= 0.7) factors.push(`high emotion: ${emotion.emotion}`);

  // Intent factor (0-0.35)
  const intentScore = URGENCY_FACTORS.intents[intent?.intent] || 0.3;
  score += intentScore * 0.35;
  if (intentScore >= 0.7) factors.push(`urgent intent: ${intent.intent}`);

  // Keyword factor (0-0.25)
  let keywordScore = 0;
  for (const word of URGENCY_FACTORS.keywords.urgent) {
    if (lowerText.includes(word)) {
      keywordScore = 0.25;
      factors.push('urgent keywords');
      break;
    }
  }
  if (keywordScore === 0) {
    for (const word of URGENCY_FACTORS.keywords.high) {
      if (lowerText.includes(word)) {
        keywordScore = 0.15;
        factors.push('high priority keywords');
        break;
      }
    }
  }
  if (keywordScore === 0) {
    for (const word of URGENCY_FACTORS.keywords.medium) {
      if (lowerText.includes(word)) {
        keywordScore = 0.08;
        break;
      }
    }
  }
  score += keywordScore;

  // Calculate 1-10 priority score
  const priorityScore = Math.round(score * 10);
  const normalizedScore = Math.max(1, Math.min(10, priorityScore));

  let priorityLevel = 'Low';
  let priorityColor = 'bg-green-600';
  if (normalizedScore >= 8) {
    priorityLevel = 'Critical';
    priorityColor = 'bg-red-600';
  } else if (normalizedScore >= 6) {
    priorityLevel = 'High';
    priorityColor = 'bg-orange-600';
  } else if (normalizedScore >= 4) {
    priorityLevel = 'Medium';
    priorityColor = 'bg-yellow-600';
  }

  return {
    score: normalizedScore,
    level: priorityLevel,
    color: priorityColor,
    factors,
    rawScore: Math.round(score * 100) / 100
  };
}

// ============================================================================
// 5. ACTION ITEM EXTRACTION
// ============================================================================

const ACTION_PATTERNS = {
  actionRequired: [
    /need to/i, /should/i, /must/i, /have to/i, /required to/i, /please/i, /can you/i, /could you/i,
    /action item/i, /to do/i, /todo/i, /task/i, /follow up/i
  ],
  questionAsked: [
    /\?$/, /^what/i, /^when/i, /^where/i, /^who/i, /^why/i, /^how/i, /^is/i, /^are/i, /^do/i, /^does/i,
    /question/i, /wondering if/i, /curious about/i
  ],
  decisionMade: [
    /decided to/i, /will/i, /going to/i, /agreed to/i, /confirmed/i, /approved/i, /accepted/i,
    /decision/i, /conclusion/i, /resolution/i
  ],
  resolved: [
    /resolved/i, /fixed/i, /solved/i, /done/i, /completed/i, /finished/i, /worked/i, /success/i,
    /thank you/i, /thanks/i, /appreciate/i, /helpful/i, /great/i, /perfect/i
  ]
};

export function extractActionItems(text) {
  const items = {
    actionRequired: [],
    questionAsked: [],
    decisionMade: [],
    resolved: []
  };

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  for (const sentence of sentences) {
    const trimmed = sentence.trim();

    // Check action required
    if (ACTION_PATTERNS.actionRequired.some(p => p.test(trimmed))) {
      items.actionRequired.push(trimmed);
    }

    // Check questions
    if (ACTION_PATTERNS.questionAsked.some(p => p.test(trimmed))) {
      items.questionAsked.push(trimmed);
    }

    // Check decisions
    if (ACTION_PATTERNS.decisionMade.some(p => p.test(trimmed))) {
      items.decisionMade.push(trimmed);
    }

    // Check resolved
    if (ACTION_PATTERNS.resolved.some(p => p.test(trimmed))) {
      items.resolved.push(trimmed);
    }
  }

  return items;
}

export function analyzeContainment(actionItems, sentiment, emotion) {
  // Determine if issue was resolved by AI or needs human intervention
  const hasResolved = actionItems.resolved.length > 0;
  const hasUnresolvedActions = actionItems.actionRequired.length > 0 || actionItems.questionAsked.length > 0;
  const isNegativeSentiment = sentiment?.comparative < -0.3;
  const isNegativeEmotion = ['Anger', 'Disgust', 'Fear'].includes(emotion?.emotion);

  let containmentStatus = 'Unknown';
  let needsHumanIntervention = false;
  let confidence = 0.5;

  if (hasResolved && !hasUnresolvedActions) {
    containmentStatus = 'Resolved';
    needsHumanIntervention = false;
    confidence = 0.85;
  } else if (isNegativeSentiment || isNegativeEmotion) {
    containmentStatus = 'Escalation Risk';
    needsHumanIntervention = true;
    confidence = 0.75;
  } else if (hasUnresolvedActions) {
    containmentStatus = 'Pending Action';
    needsHumanIntervention = hasUnresolvedActions && actionItems.actionRequired.length > 2;
    confidence = 0.70;
  } else {
    containmentStatus = 'In Progress';
    confidence = 0.60;
  }

  return {
    status: containmentStatus,
    needsHumanIntervention,
    confidence,
    isContained: !needsHumanIntervention && containmentStatus === 'Resolved'
  };
}

// ============================================================================
// 6. ENTITY LINKING (Knowledge Graph)
// ============================================================================

const ENTITY_TYPES = {
  companies: ['microsoft', 'apple', 'google', 'amazon', 'facebook', 'meta', 'tesla', 'netflix', 'twitter', 'linkedin', 'github', 'openai', 'anthropic', 'oracle', 'ibm', 'intel', 'nvidia', 'salesforce', 'adobe', 'spotify'],
  technologies: ['python', 'javascript', 'react', 'node', 'typescript', 'java', 'c++', 'rust', 'go', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp'],
  places: ['new york', 'san francisco', 'london', 'tokyo', 'paris', 'berlin', 'sydney', 'toronto', 'seattle', 'boston', 'austin', 'silicon valley'],
  products: ['iphone', 'ipad', 'macbook', 'windows', 'linux', 'macos', 'android', 'ios', 'chrome', 'firefox', 'safari', 'edge'],
  people: ['elon', 'musk', 'bill', 'gates', 'steve', 'jobs', 'mark', 'zuckerberg', 'jeff', 'bezos', 'sundar', 'pichai', 'satya', 'nadella']
};

const ENTITY_CATEGORIES = {
  companies: 'Organization',
  technologies: 'Technology',
  places: 'Location',
  products: 'Product',
  people: 'Person'
};

export function linkEntities(entities) {
  const linkedEntities = {
    people: [],
    places: [],
    organizations: [],
    technologies: [],
    products: [],
    unknown: []
  };

  const processEntity = (entity, sourceArray) => {
    const lowerEntity = entity.toLowerCase().replace(/[.,!?;:]+$/, '');

    // Check against known entities
    for (const [category, list] of Object.entries(ENTITY_TYPES)) {
      for (const knownEntity of list) {
        if (lowerEntity.includes(knownEntity) || knownEntity.includes(lowerEntity)) {
          return {
            name: entity,
            category: ENTITY_CATEGORIES[category],
            linkedTo: knownEntity,
            confidence: 0.9,
            source: sourceArray
          };
        }
      }
    }

    // Unknown entity - categorize by source
    return {
      name: entity,
      category: sourceArray === 'people' ? 'Person' :
                sourceArray === 'places' ? 'Location' :
                sourceArray === 'organizations' ? 'Organization' : 'Unknown',
      linkedTo: null,
      confidence: 0.5,
      source: sourceArray
    };
  };

  if (entities?.people) {
    entities.people.forEach(e => {
      const linked = processEntity(e, 'people');
      if (linked.category === 'Person') linkedEntities.people.push(linked);
      else linkedEntities.unknown.push(linked);
    });
  }

  if (entities?.places) {
    entities.places.forEach(e => {
      const linked = processEntity(e, 'places');
      linkedEntities.places.push(linked);
    });
  }

  if (entities?.organizations) {
    entities.organizations.forEach(e => {
      const linked = processEntity(e, 'organizations');
      if (linked.category === 'Organization') linkedEntities.organizations.push(linked);
      else linkedEntities.unknown.push(linked);
    });
  }

  return linkedEntities;
}

// ============================================================================
// 7. KEYWORD SALIENCY (Importance Scoring)
// ============================================================================

export function calculateKeywordSaliency(keywords, text) {
  if (!keywords || keywords.length === 0) {
    return [];
  }

  const words = text.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  const keywordScores = [];

  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    const keywordWords = lowerKeyword.split(/\s+/);

    // Frequency score
    let frequency = 0;
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const slice = words.slice(i, i + keywordWords.length).join(' ');
      if (slice === lowerKeyword) frequency++;
    }

    // Position score (earlier = more important)
    const firstIndex = text.toLowerCase().indexOf(lowerKeyword);
    const positionScore = firstIndex >= 0 ? 1 - (firstIndex / text.length) : 0;

    // Length score (multi-word phrases often more important)
    const lengthScore = Math.min(1, keywordWords.length / 3);

    // Uniqueness score (rarer words = more important)
    const wordFrequency = words.filter(w => w === lowerKeyword).length;
    const uniquenessScore = 1 / (1 + wordFrequency / totalWords);

    // Calculate combined saliency score
    const saliency = (
      frequency * 0.3 +
      positionScore * 0.25 +
      lengthScore * 0.15 +
      uniquenessScore * 0.3
    );

    // Determine importance level
    let importance = 'Low';
    let heatLevel = 1;
    if (saliency >= 0.7) {
      importance = 'Critical';
      heatLevel = 4;
    } else if (saliency >= 0.5) {
      importance = 'High';
      heatLevel = 3;
    } else if (saliency >= 0.3) {
      importance = 'Medium';
      heatLevel = 2;
    }

    keywordScores.push({
      keyword,
      saliency: Math.round(saliency * 100) / 100,
      importance,
      heatLevel,
      frequency,
      position: firstIndex,
      wordCount: keywordWords.length
    });
  }

  // Sort by saliency
  return keywordScores.sort((a, b) => b.saliency - a.saliency);
}

// ============================================================================
// 8. INTENT PATHING (Sequence Tracking)
// ============================================================================

export function trackIntentPath(intentHistory) {
  if (!intentHistory || intentHistory.length === 0) {
    return { path: [], transitions: [], frustrationDetected: false, summary: 'No conversation history' };
  }

  const path = intentHistory.map(h => h.intent);
  const transitions = [];
  let frustrationDetected = false;
  const frustrationPatterns = ['Question', 'Complaint', 'Complaint'];

  // Detect transitions
  for (let i = 1; i < intentHistory.length; i++) {
    const from = intentHistory[i - 1].intent;
    const to = intentHistory[i].intent;
    transitions.push({ from, to, step: i });
  }

  // Check for frustration pattern (repeated questions/complaints)
  const recentIntents = intentHistory.slice(-3).map(h => h.intent);
  const complaintCount = recentIntents.filter(i => i === 'Complaint').length;
  const questionLoop = recentIntents.filter(i => i === 'Question').length >= 2;

  if (complaintCount >= 2 || (questionLoop && recentIntents.length >= 2)) {
    frustrationDetected = true;
  }

  // Generate summary
  const uniqueIntents = [...new Set(path)];
  const summary = path.length <= 3
    ? path.join(' → ')
    : `${path[0]} → ... → ${path[path.length - 1]} (${uniqueIntents.length} unique intents)`;

  return {
    path,
    transitions,
    frustrationDetected,
    summary,
    uniqueIntentCount: uniqueIntents.length,
    totalMessages: path.length
  };
}

// ============================================================================
// 9. BEHAVIORAL METRICS (Conversation Health)
// ============================================================================

export function calculateConversationHealth(messages, assistantResponses = []) {
  if (!messages || messages.length === 0) {
    return {
      healthScore: 50,
      healthLevel: 'Moderate',
      deadEndRate: 0,
      responseLengthRatio: 1,
      userTalkRatio: 0.5,
      assistantTalkRatio: 0.5,
      avgUserMessageLength: 0,
      avgAssistantResponseLength: 0,
      engagementScore: 50,
      issues: []
    };
  }

  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');

  // Calculate average message lengths
  const userLengths = userMessages.map(m => m.content?.length || 0);
  const assistantLengths = assistantMessages.map(m => m.content?.length || 0);

  const avgUserLength = userLengths.length > 0
    ? userLengths.reduce((a, b) => a + b, 0) / userLengths.length
    : 0;
  const avgAssistantLength = assistantLengths.length > 0
    ? assistantLengths.reduce((a, b) => a + b, 0) / assistantLengths.length
    : 0;

  // Response Length Ratio (Assistant/User)
  // Ideal ratio: 1.0-1.5 (assistant slightly more verbose for explanations)
  // Too high (>2): Assistant is too wordy
  // Too low (<0.5): Assistant is too brief
  const responseLengthRatio = avgUserLength > 0 ? avgAssistantLength / avgUserLength : 1;

  // User vs Assistant Talk Ratio
  const totalUserWords = userMessages.reduce((sum, m) => sum + (m.content?.split(/\s+/).length || 0), 0);
  const totalAssistantWords = assistantMessages.reduce((sum, m) => sum + (m.content?.split(/\s+/).length || 0), 0);
  const totalWords = totalUserWords + totalAssistantWords;

  const userTalkRatio = totalWords > 0 ? totalUserWords / totalWords : 0.5;
  const assistantTalkRatio = totalWords > 0 ? totalAssistantWords / totalWords : 0.5;

  // Dead-end Detection
  // A dead-end is when user sends a very short message after a long assistant response
  // Or when user message shows frustration after assistant response
  let deadEndCount = 0;
  const deadEndPatterns = [/^ok$/i, /^k$/i, /^thanks?$/i, /^alright$/i, /^fine$/i, /^got it$/i, /^see$/i, /^right$/i];

  for (let i = 1; i < messages.length; i++) {
    const prevMsg = messages[i - 1];
    const currMsg = messages[i];

    if (prevMsg.role === 'assistant' && currMsg.role === 'user') {
      const prevLength = prevMsg.content?.length || 0;
      const currLength = currMsg.content?.length || 0;

      // Dead-end: Long assistant response followed by very short user acknowledgment
      if (prevLength > 200 && currLength < 20 && deadEndPatterns.some(p => p.test(currMsg.content.trim()))) {
        deadEndCount++;
      }

      // Dead-end: User shows frustration after assistant response
      const frustrationWords = ['confusing', 'not helpful', 'wrong', 'useless', 'frustrated', 'annoying'];
      if (frustrationWords.some(w => currMsg.content.toLowerCase().includes(w))) {
        deadEndCount++;
      }
    }
  }

  const deadEndRate = userMessages.length > 0 ? deadEndCount / userMessages.length : 0;

  // Calculate Engagement Score
  // Based on: user message length, question frequency, continuation rate
  const questionCount = userMessages.filter(m => m.content?.includes('?')).length;
  const continuationMessages = userMessages.filter((m, i, arr) => {
    if (i === 0) return false;
    const prevMsg = arr[i - 1];
    return prevMsg.role === 'assistant' && m.content.length > 50;
  }).length;

  const engagementScore = Math.min(100, Math.max(0,
    50 +
    (avgUserLength > 50 ? 20 : avgUserLength > 20 ? 10 : 0) +
    (questionCount > 0 ? Math.min(20, questionCount * 5) : 0) +
    (continuationMessages > 0 ? Math.min(10, continuationMessages * 3) : 0) -
    (deadEndRate * 30)
  ));

  // Calculate Overall Health Score
  let healthScore = 100;
  const issues = [];

  // Penalty for high dead-end rate
  if (deadEndRate > 0.3) {
    healthScore -= 25;
    issues.push('High dead-end rate - users disengaging');
  } else if (deadEndRate > 0.15) {
    healthScore -= 15;
    issues.push('Moderate dead-end rate');
  }

  // Penalty for imbalanced talk ratio
  if (assistantTalkRatio > 0.7) {
    healthScore -= 15;
    issues.push('Assistant too verbose');
  } else if (assistantTalkRatio < 0.3) {
    healthScore -= 10;
    issues.push('Assistant responses too brief');
  }

  // Penalty for extreme response length ratio
  if (responseLengthRatio > 2.5) {
    healthScore -= 20;
    issues.push('Assistant responses much longer than user messages');
  } else if (responseLengthRatio < 0.3) {
    healthScore -= 15;
    issues.push('Assistant responses too short');
  }

  // Bonus for good engagement
  if (engagementScore > 70) {
    healthScore += 10;
  }

  healthScore = Math.min(100, Math.max(0, healthScore));

  let healthLevel = 'Moderate';
  let healthColor = 'bg-yellow-600';
  if (healthScore >= 80) {
    healthLevel = 'Excellent';
    healthColor = 'bg-green-600';
  } else if (healthScore >= 60) {
    healthLevel = 'Good';
    healthColor = 'bg-lime-600';
  } else if (healthScore >= 40) {
    healthLevel = 'Fair';
    healthColor = 'bg-orange-600';
  } else {
    healthLevel = 'Poor';
    healthColor = 'bg-red-600';
  }

  return {
    healthScore: Math.round(healthScore),
    healthLevel,
    healthColor,
    deadEndRate: Math.round(deadEndRate * 100) / 100,
    deadEndCount,
    responseLengthRatio: Math.round(responseLengthRatio * 100) / 100,
    userTalkRatio: Math.round(userTalkRatio * 100) / 100,
    assistantTalkRatio: Math.round(assistantTalkRatio * 100) / 100,
    avgUserMessageLength: Math.round(avgUserLength),
    avgAssistantResponseLength: Math.round(avgAssistantLength),
    engagementScore: Math.round(engagementScore),
    issues
  };
}

// ============================================================================
// 10. LANGUAGE & DIALECT DETECTION
// ============================================================================

const LANGUAGE_PATTERNS = {
  English: {
    common: ['the', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'and', 'but', 'or', 'if', 'then', 'else', 'when', 'what', 'where', 'who', 'how', 'why', 'which'],
    regex: [/[a-zA-Z]/],
    threshold: 0.6
  },
  Spanish: {
    common: ['el', 'la', 'los', 'las', 'es', 'son', 'era', 'eran', 'tiene', 'tienen', 'había', 'han', 'habían', 'y', 'pero', 'o', 'si', 'entonces', 'cuando', 'qué', 'dónde', 'quién', 'cómo', 'por', 'para', 'con', 'sin', 'sobre', 'bajo', 'entre'],
    regex: [/[áéíóúñ¿¡]/, /\b(a|al|con|de|del|en|es|la|las|lo|los|me|mi|mis|no|por|que|se|su|sus|te|tu|un|una|uno|y)\b/i],
    threshold: 0.4
  },
  French: {
    common: ['le', 'la', 'les', 'un', 'une', 'est', 'sont', 'était', 'être', 'avoir', 'ai', 'as', 'a', 'avons', 'avez', 'ont', 'et', 'mais', 'ou', 'donc', 'or', 'ni', 'car', 'que', 'qui', 'où', 'quoi', 'dont', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles'],
    regex: [/[àâçéèêëïîôùûüœ]/, /\b(au|aux|ce|cet|cette|ces|de|des|du|en|et|j\'|je|la|le|les|leur|leurs|l\'|ma|mes|mon|ne|pas|que|qui|se|ses|son|sur|un|une|vous)\b/i],
    threshold: 0.4
  },
  German: {
    common: ['der', 'die', 'das', 'den', 'dem', 'des', 'ist', 'sind', 'war', 'waren', 'haben', 'hat', 'hatte', 'hatten', 'und', 'aber', 'oder', 'wenn', 'dann', 'als', 'ob', 'was', 'wer', 'wie', 'wo', 'warum', 'nicht', 'noch', 'schon', 'nur', 'auch', 'nur'],
    regex: [/[äöüß]/, /\b(der|die|das|den|dem|des|ein|eine|einer|einem|einen|ich|du|er|sie|es|wir|ihr|nicht|und|oder|aber|denn)\b/i],
    threshold: 0.4
  },
  Portuguese: {
    common: ['o', 'a', 'os', 'as', 'um', 'uma', 'é', 'são', 'era', 'eram', 'tem', 'têm', 'tinha', 'tinham', 'e', 'mas', 'ou', 'se', 'quando', 'onde', 'quem', 'como', 'por', 'para', 'com', 'sem', 'sobre', 'entre', 'de', 'do', 'da', 'dos', 'das'],
    regex: [/[ãõçáéíóú]/, /\b(ao|aos|à|às|de|do|da|dos|das|dum|duma|e|em|no|nos|na|nas|num|nums|numa|nums|o|os|a|as|um|uma|uns|umas)\b/i],
    threshold: 0.4
  },
  Italian: {
    common: ['il', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'è', 'sono', 'era', 'erano', 'aveva', 'avevano', 'e', 'ma', 'o', 'se', 'quando', 'dove', 'chi', 'come', 'per', 'con', 'senza', 'su', 'giù', 'tra', 'fra', 'di', 'del', 'della', 'dei', 'delle'],
    regex: [/[àèéìòù]/, /\b(a|ad|al|allo|alla|ai|agli|alle|con|da|dal|dalla|dei|degli|delle|di|del|della|e|ed|in|nel|nella|nei|nelle|il|lo|la|i|gli|le|ma|o|per|se|su|tra|fra|un|uno|una)\b/i],
    threshold: 0.4
  }
};

const STYLE_INDICATORS = {
  Formal: {
    markers: ['please', 'kindly', 'would you', 'could you', 'i would appreciate', 'thank you for', 'dear', 'sincerely', 'regards', 'respectfully', 'i am writing to', 'i wish to', 'may i', 'might i', 'furthermore', 'moreover', 'however', 'therefore', 'consequently', 'nevertheless'],
    patterns: [/^\s*(dear|hello|good\s+(morning|afternoon|evening))/i, /\s+(sir|madam|mr\.|mrs\.|ms\.|dr\.|professor)\b/i, /thank\s+you\s+for\s+your/i, /i\s+would\s+(like|appreciate|prefer)/i, /could\s+you\s+please/i, /would\s+you\s+mind/i],
    noContractions: true,
    completeSentences: true
  },
  Informal: {
    markers: ['hey', 'hi', 'yo', 'sup', 'thanks', 'thx', 'ok', 'okay', 'cool', 'awesome', 'great', 'lol', 'lmao', 'omg', 'btw', 'idk', 'imo', 'imho', 'gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'yeah', 'yep', 'nope', 'yup', 'cuz', 'bc'],
    patterns: [/^(hey|hi|yo|sup|hello|hiya)/i, /!\s*$/, /\?\?\s*$/, /\.\.\.\s*$/, /lol|lmao|rofl/i, /thx|tx|ty/i, /gonna|wanna|gotta|kinda|sorta/i],
    contractions: true,
    emojis: true,
    slang: true
  }
};

export function detectLanguage(text) {
  if (!text || text.trim().length === 0) {
    return { language: 'Unknown', confidence: 0, script: 'Unknown' };
  }

  const scores = {};
  const totalWords = text.split(/\s+/).length;

  for (const [language, config] of Object.entries(LANGUAGE_PATTERNS)) {
    let score = 0;

    // Check common words
    const commonWordMatches = config.common.filter(word =>
      text.toLowerCase().includes(` ${word} `) ||
      text.toLowerCase().startsWith(`${word} `) ||
      text.toLowerCase().endsWith(` ${word}`)
    ).length;

    if (commonWordMatches > 0) {
      score += (commonWordMatches / config.common.length) * 0.6;
    }

    // Check regex patterns
    for (const regex of config.regex) {
      if (regex.test(text)) {
        score += 0.3;
      }
    }

    // Check word count ratio
    const wordRatio = commonWordMatches / totalWords;
    if (wordRatio >= config.threshold) {
      score += 0.1;
    }

    if (score > 0) {
      scores[language] = Math.min(1, score);
    }
  }

  // Find best match
  const entries = Object.entries(scores);
  if (entries.length === 0) {
    // Default to English if no pattern matches but text exists
    return { language: 'English', confidence: 0.3, script: 'Latin' };
  }

  entries.sort((a, b) => b[1] - a[1]);
  const topLanguage = entries[0][0];
  const topConfidence = entries[0][1];

  // Determine script
  const scripts = {
    English: 'Latin',
    Spanish: 'Latin',
    French: 'Latin',
    German: 'Latin',
    Portuguese: 'Latin',
    Italian: 'Latin'
  };

  return {
    language: topLanguage,
    confidence: Math.round(topConfidence * 100) / 100,
    script: scripts[topLanguage] || 'Unknown',
    allLanguages: entries.map(([lang, conf]) => ({ language: lang, confidence: conf }))
  };
}

export function detectStyle(text) {
  if (!text || text.trim().length === 0) {
    return { style: 'Neutral', confidence: 0.5, indicators: [] };
  }

  let formalScore = 0;
  let informalScore = 0;
  const indicators = [];

  // Check Formal indicators
  for (const marker of STYLE_INDICATORS.Formal.markers) {
    if (text.toLowerCase().includes(marker)) {
      formalScore += 0.1;
      indicators.push({ type: 'formal', marker });
    }
  }

  for (const pattern of STYLE_INDICATORS.Formal.patterns) {
    if (pattern.test(text)) {
      formalScore += 0.15;
      indicators.push({ type: 'formal', pattern: pattern.toString() });
    }
  }

  // Check for contractions (informal indicator)
  const contractions = (text.match(/\b(can't|won't|don't|doesn't|didn't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|wouldn't|couldn't|shouldn't|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|we'd|they'd|let's|that's|there's|here's)\b/gi) || []).length;
  if (contractions > 0) {
    informalScore += Math.min(0.3, contractions * 0.05);
    indicators.push({ type: 'informal', marker: `${contractions} contractions` });
  }

  // Check Informal indicators
  for (const marker of STYLE_INDICATORS.Informal.markers) {
    if (text.toLowerCase().includes(marker)) {
      informalScore += 0.1;
      indicators.push({ type: 'informal', marker });
    }
  }

  for (const pattern of STYLE_INDICATORS.Informal.patterns) {
    if (pattern.test(text)) {
      informalScore += 0.15;
      indicators.push({ type: 'informal', pattern: pattern.toString() });
    }
  }

  // Check for emojis (informal)
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(text)) {
    informalScore += 0.2;
    indicators.push({ type: 'informal', marker: 'emoji detected' });
  }

  // Determine style
  const totalScore = formalScore + informalScore;
  if (totalScore === 0) {
    return { style: 'Neutral', confidence: 0.5, indicators: [] };
  }

  let style, confidence;
  if (formalScore > informalScore) {
    style = 'Formal';
    confidence = formalScore / (formalScore + informalScore * 0.5);
  } else if (informalScore > formalScore) {
    style = 'Informal';
    confidence = informalScore / (informalScore + formalScore * 0.5);
  } else {
    style = 'Neutral';
    confidence = 0.5;
  }

  return {
    style,
    confidence: Math.min(1, Math.round(confidence * 100) / 100),
    formalScore: Math.round(formalScore * 100) / 100,
    informalScore: Math.round(informalScore * 100) / 100,
    indicators
  };
}

// ============================================================================
// 11. SUGGESTED NEXT STEPS (Actionable AI Recommendations)
// ============================================================================

const RECOMMENDATION_RULES = [
  {
    name: 'Escalate to Human',
    trigger: (nlp) =>
      nlp.urgency?.score >= 8 ||
      nlp.containment?.needsHumanIntervention ||
      nlp.emotion?.emotion === 'Anger' ||
      nlp.intent?.intent === 'Complaint' && nlp.sentiment?.comparative < -0.5,
    recommendation: 'Escalate to a human agent immediately',
    priority: 'Critical',
    color: 'bg-red-600',
    icon: '🚨'
  },
  {
    name: 'Offer Discount/Compensation',
    trigger: (nlp) =>
      nlp.intent?.intent === 'Complaint' &&
      (nlp.entities?.topics?.some(t => ['refund', 'money', 'price', 'cost', 'charge', 'billing'].includes(t.toLowerCase())) ||
       nlp.keywords?.some(k => ['refund', 'money', 'price', 'cost', 'charge', 'billing', 'compensate'].includes(k.toLowerCase()))),
    recommendation: 'Offer a discount code or compensation',
    priority: 'High',
    color: 'bg-orange-600',
    icon: '🎁'
  },
  {
    name: 'Provide Detailed Explanation',
    trigger: (nlp) =>
      nlp.intent?.intent === 'Question' &&
      nlp.sentiment?.comparative < 0 &&
      nlp.emotion?.emotion === 'Fear',
    recommendation: 'Provide a detailed, reassuring explanation',
    priority: 'High',
    color: 'bg-orange-600',
    icon: '📚'
  },
  {
    name: 'Simplify Response',
    trigger: (nlp) =>
      nlp.health?.deadEndRate > 0.2 ||
      nlp.health?.responseLengthRatio > 2,
    recommendation: 'Simplify your response - be more concise',
    priority: 'Medium',
    color: 'bg-yellow-600',
    icon: '📝'
  },
  {
    name: 'Ask Clarifying Questions',
    trigger: (nlp) =>
      nlp.intent?.intent === 'Question' &&
      nlp.enhancedIntent?.confidencePercent < 70,
    recommendation: 'Ask clarifying questions to better understand the need',
    priority: 'Medium',
    color: 'bg-yellow-600',
    icon: '❓'
  },
  {
    name: 'Provide Step-by-Step Guide',
    trigger: (nlp) =>
      nlp.intent?.intent === 'Command' ||
      nlp.questionType?.type === 'Procedural',
    recommendation: 'Provide a clear step-by-step guide',
    priority: 'Medium',
    color: 'bg-yellow-600',
    icon: '📋'
  },
  {
    name: 'Offer Additional Help',
    trigger: (nlp) =>
      nlp.sentiment?.label === 'Positive' &&
      nlp.emotion?.emotion === 'Joy',
    recommendation: 'User is satisfied - offer additional assistance',
    priority: 'Low',
    color: 'bg-green-600',
    icon: '✨'
  },
  {
    name: 'Summarize and Close',
    trigger: (nlp) =>
      nlp.intent?.intent === 'Farewell' ||
      nlp.actionItems?.resolved?.length > 0,
    recommendation: 'Summarize what was accomplished and offer future help',
    priority: 'Low',
    color: 'bg-green-600',
    icon: '✅'
  },
  {
    name: 'Switch to User Language',
    trigger: (nlp) =>
      nlp.language?.language &&
      nlp.language.language !== 'English' &&
      nlp.language.confidence > 0.7,
    getRecommendation: (nlp) => `Respond in ${nlp.language?.language || 'user language'} to match user's language`,
    priority: 'Medium',
    color: 'bg-blue-600',
    icon: '🌐'
  },
  {
    name: 'Match User Tone',
    trigger: (nlp) =>
      nlp.style?.style &&
      nlp.style.confidence > 0.7,
    getRecommendation: (nlp) => nlp.style?.style === 'Formal'
      ? 'Use formal, professional language'
      : 'Use casual, friendly tone',
    priority: 'Low',
    color: 'bg-blue-600',
    icon: '🎭'
  },
  {
    name: 'Reduce Verbosity',
    trigger: (nlp) =>
      nlp.health?.assistantTalkRatio > 0.7 ||
      nlp.health?.responseLengthRatio > 2.5,
    recommendation: 'Keep responses shorter - user may be overwhelmed',
    priority: 'Medium',
    color: 'bg-yellow-600',
    icon: '🤐'
  },
  {
    name: 'Increase Engagement',
    trigger: (nlp) =>
      nlp.health?.engagementScore < 40 ||
      nlp.health?.deadEndRate > 0.15,
    recommendation: 'Ask engaging questions to re-involve the user',
    priority: 'Medium',
    color: 'bg-yellow-600',
    icon: '🎯'
  }
];

export function generateRecommendations(nlp) {
  const recommendations = [];

  for (const rule of RECOMMENDATION_RULES) {
    try {
      if (rule.trigger(nlp)) {
        const recommendationText = rule.getRecommendation
          ? rule.getRecommendation(nlp)
          : rule.recommendation;

        recommendations.push({
          name: rule.name,
          recommendation: recommendationText,
          priority: rule.priority,
          color: rule.color,
          icon: rule.icon,
          matchedRule: rule.name
        });
      }
    } catch (e) {
      console.error('Recommendation rule failed:', rule.name, e);
    }
  }

  // Sort by priority
  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Limit to top 5 recommendations
  return recommendations.slice(0, 5);
}

export function getTopRecommendation(nlp) {
  const recommendations = generateRecommendations(nlp);
  return recommendations[0] || {
    name: 'Continue Conversation',
    recommendation: 'Continue with standard response',
    priority: 'Low',
    color: 'bg-gray-600',
    icon: '💬'
  };
}
