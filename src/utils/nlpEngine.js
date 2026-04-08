/**
 * NLP Engine - Client-side Natural Language Processing
 * Uses compromise for NER and keyword extraction, sentiment for sentiment analysis
 * All processing happens in the browser - no additional API calls needed
 */

import nlp from 'compromise';
import Sentiment from 'sentiment';

// Initialize sentiment analyzer (AFINN-based lexicon)
// Initialize immediately to avoid null reference issues
let sentimentAnalyzer;
try {
  sentimentAnalyzer = new Sentiment();
} catch (e) {
  console.error('Failed to initialize sentiment analyzer:', e);
  sentimentAnalyzer = {
    analyze: (text) => ({ score: 0, comparative: 0, tokens: [], words: [], positive: [], negative: [] })
  };
}

/**
 * Intent Detection using rule-based classification with compromise
 * Analyzes text structure and keywords to determine user intent
 *
 * @param {string} text - User message text
 * @returns {{ intent: string, confidence: string }} Detected intent and confidence level
 */
export function detectIntent(text) {
  const lowerText = text.toLowerCase().trim();

  // Greeting detection - high confidence for clear greetings
  const greetingPatterns = [
    /^hi[\s,!]/, /^hello[,!]?$/, /^hey[,!]?$/,
    /^good morning[,!]?$/, /^good afternoon[,!]?$/,
    /^good evening[,!]?$/, /^greetings[,!]?$/
  ];
  if (greetingPatterns.some(pattern => pattern.test(lowerText))) {
    return { intent: 'Greeting', confidence: 'high' };
  }

  // Gratitude detection - thanks, appreciate, etc.
  const gratitudePatterns = [
    /thanks?/, /thank you/, /appreciate/, /grateful/,
    /very kind/, /so helpful/, /much obliged/
  ];
  if (gratitudePatterns.some(pattern => pattern.test(lowerText))) {
    return { intent: 'Gratitude', confidence: 'high' };
  }

  // Question detection - wh-words or ending with ?
  const questionStarters = [
    /^who[\s?]/, /^what[\s?]/, /^when[\s?]/, /^where[\s?]/,
    /^why[\s?]/, /^how[\s?]/, /^which[\s?]/, /^whom[\s?]/,
    /^whose[\s?]/, /^is[\s?]/, /^are[\s?]/, /^do[\s?]/,
    /^does[\s?]/, /^can[\s?]/, /^could[\s?]/, /^would[\s?]/,
    /^should[\s?]/, /^will[\s?]/, /^may[\s?]/, /^might[\s?]/
  ];
  if (text.endsWith('?') || questionStarters.some(pattern => pattern.test(lowerText))) {
    return { intent: 'Question', confidence: text.endsWith('?') ? 'high' : 'medium' };
  }

  // Command detection - imperative verbs at start
  const commandVerbs = [
    /^tell /, /^show /, /^explain /, /^give /, /^find /, /^list /,
    /^describe /, /^calculate /, /^compute /, /^generate /,
    /^create /, /^make /, /^get /, /^fetch /, /^search /,
    /^look up /, /^check /, /^verify /, /^analyze /, /^run /,
    /^execute /, /^open /, /^close /, /^send /, /^delete /,
    /^remove /, /^add /, /^update /, /^change /, /^set /
  ];
  if (commandVerbs.some(pattern => pattern.test(lowerText))) {
    return { intent: 'Command', confidence: 'high' };
  }

  // Complaint detection - negative sentiment + frustration phrases
  const complaintPatterns = [
    /not working/, /doesn't work/, /doesn't work/, /broken/,
    /error/, /problem/, /issue/, /bug/, /glitch/,
    /frustrated/, /annoyed/, /useless/, /terrible/,
    /horrible/, /worst/, /hate/, /disappointed/,
    /waste of/, /not able to/, /can't get/, /unable to/
  ];
  if (complaintPatterns.some(pattern => pattern.test(lowerText))) {
    return { intent: 'Complaint', confidence: 'medium' };
  }

  // Default to Statement for everything else
  return { intent: 'Statement', confidence: 'low' };
}

/**
 * Sentiment Analysis using AFINN-based lexicon
 * Returns polarity (positive/negative/neutral) and intensity score
 *
 * @param {string} text - User message text
 * @returns {{ label: 'Positive'|'Negative'|'Neutral', score: number, comparative: number }}
 */
export function analyzeSentiment(text) {
  // Run sentiment analysis using the AFINN lexicon
  const result = sentimentAnalyzer.analyze(text);

  // score: total sentiment score (sum of AFINN values for matched words)
  // comparative: score normalized by word count (better for comparison)
  const { score, comparative } = result;

  // Determine label based on score thresholds
  // Using comparative score for better accuracy across different message lengths
  let label;
  if (comparative >= 0.5) {
    label = 'Positive';
  } else if (comparative <= -0.5) {
    label = 'Negative';
  } else {
    label = 'Neutral';
  }

  return {
    label,
    score,
    comparative: Math.round(comparative * 100) / 100
  };
}

/**
 * Named Entity Recognition using compromise
 * Extracts people, places, organizations, and topic nouns from text
 * Includes blacklist filtering for harmful/profane content
 *
 * @param {string} text - User message text
 * @returns {{ people: string[], places: string[], organizations: string[], topics: string[] }}
 */

// Blacklist for harmful/unwanted entities
const ENTITY_BLACKLIST = new Set([
  'kill', 'murder', 'attack', 'violence', 'violent', 'death', 'dead',
  'hate', 'hurt', 'pain', 'destroy', 'bomb', 'weapon', 'gun', 'knife',
  'drugs', 'drug', 'alcohol', 'abuse', 'rape', 'assault', 'crime',
  'hell', 'damn', 'shit', 'fuck', 'ass', 'crap'
]);

const isBlacklisted = (word) => {
  const lower = word.toLowerCase();
  return ENTITY_BLACKLIST.has(lower) || 
         /^(kill|murder|attack|violence|death|hate|hurt|bomb|weapon|drug|abuse|rape|assault|crime)s?$/i.test(lower);
};

export function extractEntities(text) {
  // Parse text with compromise NLP engine
  const doc = nlp(text);

  // Helper to clean extracted entities (remove trailing punctuation)
  const cleanEntity = (str) => str.replace(/[.,!?;:]+$/, '').trim();

  // Extract people names using compromise's #Person matcher
  const people = doc.match('#Person').out('array')
    .map(cleanEntity)
    .filter(name => name.length > 1 && !isBlacklisted(name));

  // Extract places using compromise's #Place matcher
  const places = doc.match('#Place').out('array')
    .map(cleanEntity)
    .filter(place => place.length > 1 && !isBlacklisted(place));

  // Extract organizations using compromise's #Organization matcher
  const organizations = doc.match('#Organization').out('array')
    .map(cleanEntity)
    .filter(org => org.length > 1 && !isBlacklisted(org));

  // Also try to extract proper nouns as potential entities (fallback)
  const properNouns = doc.match('#ProperNoun').out('array')
    .map(cleanEntity)
    .filter(n => n.length > 2 && !isBlacklisted(n));

  // Extract topics as meaningful nouns (excluding common pronouns and very short words)
  const topics = doc.match('#Noun').out('array')
    .map(cleanEntity)
    .filter(topic => {
      const lower = topic.toLowerCase();
      return topic.length > 2 &&
             !['i', 'you', 'we', 'they', 'it', 'thing', 'things', 'time', 'way', 'day', 'year', 'people', 'man', 'woman'].includes(lower) &&
             !isBlacklisted(topic);
    })
    .slice(0, 15);

  return {
    people: [...new Set(people)],
    places: [...new Set(places)],
    organizations: [...new Set(organizations)],
    topics: [...new Set(topics)]
  };
}

/**
 * Keyword Extraction using compromise
 * Extracts top noun phrases and important terms from text
 * Includes blacklist filtering for harmful/profane content
 *
 * @param {string} text - User message text
 * @returns {string[]} Array of top 5 keyword phrases
 */

// Blacklist for harmful/unwanted keywords
const KEYWORD_BLACKLIST = new Set([
  'kill', 'murder', 'attack', 'violence', 'violent', 'death', 'dead',
  'hate', 'hurt', 'pain', 'destroy', 'bomb', 'weapon', 'gun', 'knife',
  'drugs', 'drug', 'alcohol', 'abuse', 'rape', 'assault', 'crime',
  'hell', 'damn', 'shit', 'fuck', 'ass', 'crap', 'bitch', 'whore',
  'slut', 'bastard', 'stupid', 'retard', 'moron', 'idiot'
]);

const isKeywordBlacklisted = (word) => {
  const lower = word.toLowerCase().trim();
  return KEYWORD_BLACKLIST.has(lower) ||
         /^(kill|murder|attack|violence|death|hate|hurt|bomb|weapon|drug|abuse|rape|assault|crime|hell|damn|shit|fuck|bitch|whore|slut|bastard|stupid|retard)s?$/i.test(lower);
};

export function extractKeywords(text) {
  // Parse text with compromise
  const doc = nlp(text);

  // Helper to clean keywords
  const cleanKeyword = (str) => str.replace(/[.,!?;:]+$/, '').trim().toLowerCase();

  // Extract noun phrases - multi-word noun constructions
  const nounPhrases = doc.match('#NounPhrase')
    .out('array')
    .map(cleanKeyword)
    .filter(phrase => {
      const words = phrase.split(/\s+/);
      return phrase.length > 3 &&
             words.length <= 4 &&
             !['the', 'a', 'an', 'this', 'that', 'some', 'any', 'all', 'it', 'is', 'are', 'was', 'were'].includes(phrase) &&
             !isKeywordBlacklisted(phrase);
    });

  // Extract important nouns (proper nouns and significant common nouns)
  const importantNouns = doc.match('#Noun')
    .out('array')
    .map(cleanKeyword)
    .filter(n => {
      const words = n.split(/\s+/);
      return n.length > 3 &&
             words.length <= 2 &&
             !['time', 'way', 'day', 'year', 'people', 'man', 'woman', 'thing', 'things', 'stuff', 'lot', 'kind', 'sort'].includes(n) &&
             !isKeywordBlacklisted(n);
    });

  // Extract meaningful verbs (actions)
  const verbs = doc.match('#Verb')
    .out('array')
    .map(cleanKeyword)
    .filter(v => v.length > 3 && !['is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'].includes(v) &&
             !isKeywordBlacklisted(v));

  // Extract adjectives for additional context
  const adjectives = doc.match('#Adjective')
    .out('array')
    .map(cleanKeyword)
    .filter(adj => adj.length > 3 && !['good', 'bad', 'new', 'old', 'first', 'last', 'long', 'little', 'great', 'own'].includes(adj) &&
             !isKeywordBlacklisted(adj));

  // Combine all keywords, prioritizing noun phrases, then nouns, then verbs
  const allKeywords = [...new Set([...nounPhrases, ...importantNouns, ...verbs, ...adjectives])];

  // Return top 5-7 keywords
  return allKeywords.slice(0, 7);
}

/**
 * Full NLP Analysis - runs all 4 techniques on a message
 * This is the main entry point for analyzing user messages
 *
 * @param {string} text - User message text
 * @returns {{
 *   intent: { intent: string, confidence: string },
 *   sentiment: { label: string, score: number, comparative: number },
 *   entities: { people: string[], places: string[], organizations: string[], topics: string[] },
 *   keywords: string[]
 * }}
 */
export function analyzeMessage(text) {
  // Run all NLP techniques in parallel for efficiency
  const intent = detectIntent(text);
  const sentiment = analyzeSentiment(text);
  const entities = extractEntities(text);
  const keywords = extractKeywords(text);

  return {
    intent,
    sentiment,
    entities,
    keywords
  };
}
