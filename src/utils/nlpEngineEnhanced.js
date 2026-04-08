/**
 * Simplified NLP Engine - Core features only
 * All processing happens in the browser
 */

import nlp from 'compromise';
import Sentiment from 'sentiment';

// Import functions from nlpEngine for local use
import { detectIntent, analyzeSentiment, extractEntities, extractKeywords, analyzeMessage } from './nlpEngine.js';

// Re-export for external use
export { detectIntent, analyzeSentiment, extractEntities, extractKeywords, analyzeMessage };

// ============================================================================
// 1. EMOTION DETECTION (Simplified)
// ============================================================================

const EMOTION_KEYWORDS = {
  'Joy': ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'excellent', 'brilliant', 'delighted', 'pleased', 'thrilled', 'love', 'thankful', 'grateful', 'yay', 'awesome', 'fun', 'enjoy', 'celebrate'],
  'Anger': ['angry', 'mad', 'furious', 'outraged', 'irate', 'annoyed', 'frustrated', 'infuriated', 'hate', 'loathe', 'despise', 'resent', 'hostile', 'rage'],
  'Fear': ['scared', 'afraid', 'fear', 'frightened', 'terrified', 'horrified', 'panicked', 'alarmed', 'worried', 'anxious', 'nervous', 'apprehensive', 'terror', 'panic'],
  'Surprise': ['surprised', 'shocked', 'astonished', 'amazed', 'astounded', 'stunned', 'wow', 'omg', 'unbelievable', 'incredible', 'unexpected', 'whoa'],
  'Sadness': ['sad', 'unhappy', 'depressed', 'miserable', 'gloomy', 'down', 'blue', 'heartbroken', 'devastated', 'crushed', 'disappointed', 'upset', 'tear', 'cry', 'grief', 'sorrow', 'lonely', 'hopeless'],
  'Disgust': ['disgusted', 'gross', 'revolted', 'repulsed', 'nauseated', 'sick', 'vomit', 'eww', 'yuck', 'disgusting', 'repulsive', 'offensive'],
  'Neutral': ['okay', 'fine', 'alright', 'whatever', 'meh', 'normal', 'average', 'typical', 'usual']
};

export function detectEmotion(text) {
  const lowerText = text.toLowerCase();
  const scores = {};

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    }
    if (score > 0) {
      scores[emotion] = score;
    }
  }

  const entries = Object.entries(scores);
  if (entries.length === 0) {
    return { emotion: 'Neutral', emoji: '😐', confidence: 0.5 };
  }

  entries.sort((a, b) => b[1] - a[1]);
  const topEmotion = entries[0][0];
  const topScore = entries[0][1];
  const totalScore = entries.reduce((sum, [, s]) => sum + s, 0);

  const emojis = {
    'Joy': '😊', 'Anger': '😠', 'Fear': '😨', 'Surprise': '😮',
    'Sadness': '😢', 'Disgust': '🤢', 'Neutral': '😐'
  };

  return {
    emotion: topEmotion,
    emoji: emojis[topEmotion] || '😐',
    confidence: Math.round((topScore / totalScore) * 100) / 100
  };
}

// ============================================================================
// 2. TOPIC MODELING (Simplified)
// ============================================================================

const TOPIC_KEYWORDS = {
  'Technology': ['software', 'hardware', 'computer', 'programming', 'code', 'algorithm', 'data', 'api', 'database', 'server', 'cloud', 'ai', 'ml', 'python', 'javascript', 'react', 'internet', 'web', 'app', 'mobile', 'tech', 'digital'],
  'Health': ['health', 'medical', 'doctor', 'hospital', 'medicine', 'disease', 'treatment', 'therapy', 'patient', 'vaccine', 'virus', 'mental health', 'depression', 'anxiety', 'exercise', 'fitness', 'diet', 'nutrition'],
  'Finance': ['money', 'bank', 'investment', 'stock', 'market', 'trading', 'finance', 'economy', 'currency', 'bitcoin', 'crypto', 'tax', 'budget', 'savings', 'loan', 'credit', 'profit', 'income'],
  'Education': ['school', 'university', 'college', 'student', 'teacher', 'learning', 'study', 'course', 'class', 'exam', 'degree', 'research', 'education', 'academic', 'training'],
  'Entertainment': ['movie', 'film', 'music', 'song', 'artist', 'concert', 'show', 'tv', 'series', 'actor', 'gaming', 'game', 'streaming', 'netflix', 'youtube', 'fun', 'comedy'],
  'Science': ['science', 'research', 'experiment', 'physics', 'chemistry', 'biology', 'astronomy', 'space', 'quantum', 'energy', 'evolution', 'genetics', 'dna', 'climate'],
  'Sports': ['sports', 'game', 'team', 'player', 'coach', 'score', 'win', 'championship', 'football', 'basketball', 'tennis', 'cricket', 'olympics', 'athlete'],
  'Business': ['business', 'company', 'startup', 'entrepreneur', 'management', 'marketing', 'sales', 'customer', 'product', 'brand', 'ceo', 'employee', 'career', 'job'],
  'Travel': ['travel', 'trip', 'vacation', 'holiday', 'flight', 'hotel', 'destination', 'tourism', 'passport', 'beach', 'mountain', 'city', 'country'],
  'Food': ['food', 'restaurant', 'meal', 'recipe', 'cooking', 'chef', 'cuisine', 'taste', 'delicious', 'hungry', 'breakfast', 'lunch', 'dinner', 'pizza', 'sushi']
};

export function classifyTopic(text) {
  const lowerText = text.toLowerCase();
  const scores = {};

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    }
    if (score > 0) {
      scores[topic] = score;
    }
  }

  const entries = Object.entries(scores);
  if (entries.length === 0) {
    return { topic: 'General', confidence: 0.3, color: 'bg-gray-500' };
  }

  entries.sort((a, b) => b[1] - a[1]);
  const topTopic = entries[0][0];
  const topScore = entries[0][1];
  const totalScore = entries.reduce((sum, [, s]) => sum + s, 0);

  const colors = {
    'Technology': 'bg-blue-600', 'Health': 'bg-red-500', 'Finance': 'bg-green-600',
    'Education': 'bg-yellow-600', 'Entertainment': 'bg-purple-500', 'Science': 'bg-indigo-500',
    'Sports': 'bg-orange-500', 'Business': 'bg-slate-600', 'Travel': 'bg-teal-500', 'Food': 'bg-pink-500', 'General': 'bg-gray-500'
  };

  return {
    topic: topTopic,
    confidence: Math.round((topScore / totalScore) * 100) / 100,
    color: colors[topTopic] || 'bg-gray-500'
  };
}

// ============================================================================
// 3. QUESTION TYPE CLASSIFIER (Simplified)
// ============================================================================

const QUESTION_PATTERNS = {
  'Factual': [/^what (is|are|was|were)/i, /^who (is|are|was|were)?/i, /^when (is|are|was|were|did|does)/i, /^where (is|are|was|were)/i, /^how many/i, /^how much/i, /^how old/i, /^define/i],
  'Opinion': [/what do you think/i, /what is your opinion/i, /do you agree/i, /do you think/i, /is it better/i, /which is (better|worse)/i, /should i/i],
  'Clarification': [/what do you mean/i, /can you clarify/i, /could you explain/i, /i don'?t understand/i, /what does/i, /meaning of/i],
  'Hypothetical': [/what if/i, /what would happen if/i, /suppose (that)?/i, /imagine if/i, /hypothetically/i, /let'?s say/i],
  'Procedural': [/how do i/i, /how can i/i, /how to/i, /what are the steps/i, /guide me/i, /walk me through/i, /steps to/i]
};

export function classifyQuestionType(text) {
  const scores = {};

  for (const [qType, patterns] of Object.entries(QUESTION_PATTERNS)) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        score += 2;
      }
    }
    if (score > 0) {
      scores[qType] = score;
    }
  }

  const entries = Object.entries(scores);
  if (entries.length === 0) {
    return { type: 'General', description: 'General question', confidence: 0.5 };
  }

  entries.sort((a, b) => b[1] - a[1]);
  const topType = entries[0][0];
  const descriptions = {
    'Factual': 'Seeking factual information',
    'Opinion': 'Seeking opinion or judgment',
    'Clarification': 'Seeking clarification',
    'Hypothetical': 'Hypothetical scenario',
    'Procedural': 'Seeking procedure or instructions'
  };

  return {
    type: topType,
    description: descriptions[topType] || 'General question',
    confidence: Math.min(1, scores[topType] / 4)
  };
}

// ============================================================================
// 4. TOXICITY DETECTION (Simplified)
// ============================================================================

const TOXICITY_WORDS = {
  mild: ['stupid', 'idiot', 'dumb', 'annoying', 'hate', 'damn', 'hell', 'sucks', 'useless'],
  moderate: ['bastard', 'bitch', 'asshole', 'bullshit', 'shit', 'piss', 'screw you'],
  severe: ['nigger', 'faggot', 'cunt', 'tranny']
};

export function detectToxicity(text) {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  let mildCount = 0;
  let moderateCount = 0;
  let severeCount = 0;
  const reasons = [];

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z0-9]/g, '');
    if (TOXICITY_WORDS.severe.includes(cleanWord)) {
      severeCount++;
      reasons.push('severe language');
    } else if (TOXICITY_WORDS.moderate.includes(cleanWord)) {
      moderateCount++;
      reasons.push('moderate language');
    } else if (TOXICITY_WORDS.mild.includes(cleanWord)) {
      mildCount++;
      reasons.push('mild language');
    }
  }

  const score = Math.min(100, (mildCount * 10) + (moderateCount * 30) + (severeCount * 60));
  let level = 'Clean';
  if (severeCount > 0) level = 'Severe';
  else if (moderateCount > 0) level = 'Moderate';
  else if (mildCount > 0) level = 'Mild';

  return { level, score, flagged: level !== 'Clean', reasons: [...new Set(reasons)] };
}

// ============================================================================
// 5. READABILITY SCORE (Flesch-Kincaid)
// ============================================================================

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/e$/, '');
  const vowelGroups = word.match(/[aeiouy]+/g);
  return vowelGroups ? vowelGroups.length : 1;
}

export function calculateReadability(text) {
  if (!text || text.trim().length === 0) {
    return { score: 50, level: 'Moderate', description: 'Average readability' };
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = Math.max(1, words.length);

  let syllableCount = 0;
  for (const word of words) {
    syllableCount += countSyllables(word);
  }

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  const clampedScore = Math.max(0, Math.min(100, score));

  let level, description;
  if (clampedScore >= 90) { level = 'Very Easy'; description = 'Easily understood by 11-year-olds'; }
  else if (clampedScore >= 80) { level = 'Easy'; description = 'Conversational English'; }
  else if (clampedScore >= 70) { level = 'Fairly Easy'; description = 'Plain English'; }
  else if (clampedScore >= 60) { level = 'Moderate'; description = 'Standard readability'; }
  else if (clampedScore >= 50) { level = 'Fairly Difficult'; description = 'Some college education needed'; }
  else if (clampedScore >= 30) { level = 'Difficult'; description = 'College level'; }
  else { level = 'Very Difficult'; description = 'Academic/technical writing'; }

  return { score: Math.round(clampedScore), level, description };
}

// ============================================================================
// 6. TEXT COMPLEXITY (Simplified)
// ============================================================================

export function measureTextComplexity(text) {
  if (!text || text.trim().length === 0) {
    return { score: 30, level: 'Simple', barWidth: 'w-1/4' };
  }

  const words = text.split(/\s+/).filter(w => w.length > 0);
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  const complexWords = words.filter(w => w.length > 10 || countSyllables(w) >= 3).length;
  const rareWordRatio = complexWords / words.length;

  const totalScore = Math.min(100, (avgWordLength - 3) * 8 + rareWordRatio * 100);
  const clampedScore = Math.max(0, totalScore);

  let level, barWidth;
  if (clampedScore <= 25) { level = 'Simple'; barWidth = 'w-1/4'; }
  else if (clampedScore <= 45) { level = 'Conversational'; barWidth = 'w-2/4'; }
  else if (clampedScore <= 65) { level = 'Moderate'; barWidth = 'w-3/4'; }
  else if (clampedScore <= 85) { level = 'Complex'; barWidth = 'w-4/4'; }
  else { level = 'Technical'; barWidth = 'w-full'; }

  return { score: Math.round(clampedScore), level, barWidth };
}

// ============================================================================
// 7. CONVERSATION SUMMARIZER
// ============================================================================

export async function summarizeConversation(messages, model = 'llama3.2') {
  const messageTexts = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const prompt = `Summarize the following conversation briefly in 3-5 sentences:\n\n${messageTexts}\n\nProvide a concise summary that captures the main topics discussed.`;

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });

    if (!response.ok) throw new Error('Ollama request failed');

    const data = await response.json();
    const summary = data.message?.content || 'Unable to generate summary';
    const wordCount = summary.split(/\s+/).length;
    const allText = messages.map(m => m.content).join(' ');
    const topicResult = classifyTopic(allText);

    return {
      summary,
      wordCount,
      messageCount: messages.length,
      dominantTopic: topicResult.topic
    };
  } catch (error) {
    console.error('Conversation summarization failed:', error);
    return {
      summary: 'Failed to generate summary. Please ensure Ollama is running.',
      wordCount: 0,
      messageCount: messages.length,
      dominantTopic: 'Unknown'
    };
  }
}

// ============================================================================
// COMPREHENSIVE ANALYSIS FUNCTION
// ============================================================================

export function analyzeMessageEnhanced(text, options = {}) {
  const { previousMessage = '', previousNLP = null, previousEntities = [] } = options;

  const intent = detectIntent(text);
  const sentiment = analyzeSentiment(text);
  const entities = extractEntities(text);
  const keywords = extractKeywords(text);
  const topic = classifyTopic(text);
  const emotion = detectEmotion(text);
  const toxicity = detectToxicity(text);
  const readability = calculateReadability(text);
  const complexity = measureTextComplexity(text);
  const questionType = intent.intent === 'Question' ? classifyQuestionType(text) : null;

  return {
    intent,
    sentiment,
    entities,
    keywords,
    topic,
    questionType,
    toxicity,
    readability,
    emotion,
    complexity
  };
}
