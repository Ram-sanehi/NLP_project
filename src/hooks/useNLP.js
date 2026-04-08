import { useState, useCallback, useMemo } from 'react';
import { analyzeMessageEnhanced } from '../utils/nlpEngineEnhanced';
import {
  detectIntentEnhanced,
  calculateSentimentVolatility,
  detectSarcasm,
  calculateUrgencyScore,
  extractActionItems,
  analyzeContainment,
  linkEntities,
  calculateKeywordSaliency,
  trackIntentPath,
  calculateConversationHealth,
  detectLanguage,
  detectStyle,
  generateRecommendations,
  getTopRecommendation
} from '../utils/nlpAdvanced';

/**
 * useNLP Hook - Enhanced with advanced features
 */
export function useNLP() {
  const [nlpResults, setNlpResults] = useState({});
  const [sentimentHistory, setSentimentHistory] = useState([]);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [topicHistory, setTopicHistory] = useState([]);
  const [toxicityHistory, setToxicityHistory] = useState([]);
  const [intentHistory, setIntentHistory] = useState([]);
  const [latestIntent, setLatestIntent] = useState(null);
  const [previousMessage, setPreviousMessage] = useState(null);
  const [previousNLP, setPreviousNLP] = useState(null);
  const [messages, setMessages] = useState([]);

  const analyzeMessageCallback = useCallback((text, timestamp, messageData = {}) => {
    const result = analyzeMessageEnhanced(text, {
      previousMessage,
      previousNLP,
      previousEntities: previousNLP?.entities ? [
        ...previousNLP.entities.people,
        ...previousNLP.entities.places,
        ...previousNLP.entities.organizations
      ] : []
    });

    // Enhanced intent detection with confidence
    const enhancedIntent = detectIntentEnhanced(text, { previousIntent: latestIntent });

    // Sarcasm detection
    const sarcasmResult = detectSarcasm(text, result.sentiment);

    // Urgency scoring
    const urgencyScore = calculateUrgencyScore(result.emotion, enhancedIntent, text);

    setNlpResults(prev => ({
      ...prev,
      [timestamp]: { ...result, enhancedIntent, sarcasmResult, urgencyScore }
    }));

    setSentimentHistory(prev => [...prev, result.sentiment]);
    setEmotionHistory(prev => [...prev, result.emotion]);
    setTopicHistory(prev => [...prev, result.topic]);
    setToxicityHistory(prev => [...prev, result.toxicity]);
    setIntentHistory(prev => [...prev, { intent: enhancedIntent.intent, confidence: enhancedIntent.confidence, timestamp }]);
    setMessages(prev => [...prev, { content: text, ...result, enhancedIntent, timestamp }]);
    setLatestIntent(enhancedIntent);
    setPreviousMessage(text);
    setPreviousNLP({ ...result, enhancedIntent, sarcasmResult, urgencyScore });

    return { ...result, enhancedIntent, sarcasmResult, urgencyScore };
  }, [previousMessage, previousNLP, latestIntent]);

  const clearNLPState = useCallback(() => {
    setNlpResults({});
    setSentimentHistory([]);
    setEmotionHistory([]);
    setTopicHistory([]);
    setToxicityHistory([]);
    setLatestIntent(null);
    setPreviousMessage(null);
    setPreviousNLP(null);
  }, []);

  const nlpStats = useMemo(() => {
    const results = Object.values(nlpResults);

    // Sentiment
    const recentSentiments = sentimentHistory.slice(-5);
    let overallSentiment = 'No data';
    let avgScore = 0;
    if (recentSentiments.length > 0) {
      avgScore = recentSentiments.reduce((sum, s) => sum + s.comparative, 0) / recentSentiments.length;
      if (avgScore >= 0.3) overallSentiment = 'Positive';
      else if (avgScore <= -0.3) overallSentiment = 'Negative';
      else overallSentiment = 'Neutral';
    }

    // Sentiment Volatility & Trend
    const sentimentVolatility = calculateSentimentVolatility(sentimentHistory);

    // Emotion Distribution
    const emotionCounts = {};
    emotionHistory.forEach(e => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });
    const dominantEmotion = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0];

    // Topic Distribution
    const topicCounts = {};
    topicHistory.forEach(t => {
      topicCounts[t.topic] = (topicCounts[t.topic] || 0) + 1;
    });
    const topicDistribution = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count, percentage: Math.round((count / topicHistory.length) * 100) || 0 }))
      .sort((a, b) => b.count - a.count);
    const dominantTopic = topicDistribution[0];

    // Toxicity
    const healthScore = toxicityHistory.length > 0
      ? Math.round(100 - (toxicityHistory.reduce((sum, t) => sum + t.score, 0) / toxicityHistory.length))
      : 100;
    const toxicMessageCount = toxicityHistory.filter(t => t.flagged).length;

    // Entities with linking
    const allEntities = {
      people: new Set(),
      places: new Set(),
      organizations: new Set(),
      topics: new Set()
    };

    results.forEach(result => {
      if (result.entities) {
        result.entities.people.forEach(p => allEntities.people.add(p));
        result.entities.places.forEach(p => allEntities.places.add(p));
        result.entities.organizations.forEach(o => allEntities.organizations.add(o));
        result.entities.topics.forEach(t => allEntities.topics.add(t));
      }
    });

    const linkedEntities = linkEntities({
      people: Array.from(allEntities.people),
      places: Array.from(allEntities.places),
      organizations: Array.from(allEntities.organizations)
    });

    // Keywords with saliency
    const keywordFrequency = {};
    const allKeywords = [];
    results.forEach(result => {
      if (result.keywords) {
        result.keywords.forEach(keyword => {
          const normalized = keyword.toLowerCase().trim();
          if (normalized.length > 2) {
            keywordFrequency[normalized] = (keywordFrequency[normalized] || 0) + 1;
            allKeywords.push(normalized);
          }
        });
      }
    });

    const topKeywords = Object.entries(keywordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    // Calculate keyword saliency for latest result
    const latestKeywords = results[results.length - 1]?.keywords || [];
    const latestText = results[results.length - 1] ?
      (messages.find(m => m.timestamp === Object.keys(nlpResults).find(k => nlpResults[k] === results[results.length - 1]))?.content || '') : '';
    const keywordSaliency = calculateKeywordSaliency(latestKeywords, latestText);

    // Intent Distribution & Pathing
    const intentCounts = {};
    results.forEach(result => {
      if (result.intent) {
        const intent = result.intent.intent;
        intentCounts[intent] = (intentCounts[intent] || 0) + 1;
      }
    });

    const dominantIntent = Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])[0];

    // Intent path tracking
    const intentPath = trackIntentPath(intentHistory);

    // Action items & containment from all messages
    const allActionItems = { actionRequired: [], questionAsked: [], decisionMade: [], resolved: [] };
    messages.forEach(m => {
      const items = extractActionItems(m.content);
      allActionItems.actionRequired.push(...items.actionRequired);
      allActionItems.questionAsked.push(...items.questionAsked);
      allActionItems.decisionMade.push(...items.decisionMade);
      allActionItems.resolved.push(...items.resolved);
    });

    const latestSentiment = results[results.length - 1]?.sentiment;
    const latestEmotion = results[results.length - 1]?.emotion;
    const containment = analyzeContainment(allActionItems, latestSentiment, latestEmotion);

    // Sarcasm detection for latest message
    const latestSarcasm = results[results.length - 1]?.sarcasmResult || { isSarcastic: false, confidence: 0 };

    // Urgency from latest
    const latestUrgency = results[results.length - 1]?.urgencyScore || { score: 1, level: 'Low', color: 'bg-green-600' };

    // Conversation Health
    const healthMetrics = calculateConversationHealth(messages);

    // Language Detection (from all messages combined)
    const allText = messages.map(m => m.content).join(' ');
    const languageResult = detectLanguage(allText);
    const styleResult = detectStyle(allText);

    // Generate Recommendations
    const latestNLP = {
      urgency: latestUrgency,
      containment,
      emotion: latestEmotion,
      intent: latestIntent,
      sentiment: latestSentiment,
      entities: results[results.length - 1]?.entities,
      keywords: latestKeywords,
      health: healthMetrics,
      language: languageResult,
      style: styleResult
    };
    const recommendations = generateRecommendations(latestNLP);
    const topRecommendation = getTopRecommendation(latestNLP);

    return {
      latestIntent,
      latestResult: results[results.length - 1] || null,
      overallSentiment,
      avgSentimentScore: Math.round(avgScore * 100) / 100,
      sentimentHistory: [...sentimentHistory],
      sentimentVolatility,
      emotionHistory: [...emotionHistory],
      emotionCounts,
      dominantEmotion: dominantEmotion ? { emotion: dominantEmotion[0], count: dominantEmotion[1] } : null,
      topicDistribution,
      dominantTopic: dominantTopic || null,
      healthScore,
      toxicMessageCount,
      toxicityHistory: [...toxicityHistory],
      entities: {
        people: Array.from(allEntities.people),
        places: Array.from(allEntities.places),
        organizations: Array.from(allEntities.organizations),
        topics: Array.from(allEntities.topics)
      },
      linkedEntities,
      topKeywords,
      keywordSaliency,
      keywordFrequency: { ...keywordFrequency },
      intentCounts,
      dominantIntent: dominantIntent ? dominantIntent[0] : null,
      intentHistory: [...intentHistory],
      intentPath,
      actionItems: allActionItems,
      containment,
      sarcasm: latestSarcasm,
      urgency: latestUrgency,
      health: healthMetrics,
      language: languageResult,
      style: styleResult,
      recommendations,
      topRecommendation
    };
  }, [nlpResults, sentimentHistory, emotionHistory, topicHistory, toxicityHistory, latestIntent, intentHistory, messages]);

  return {
    analyzeMessage: analyzeMessageCallback,
    clearNLPState,
    nlpStats
  };
}
