import { useState, useCallback } from 'react';
import { summarizeConversation } from '../utils/nlpEngineEnhanced';

/**
 * NLP Insights Panel - Enhanced with advanced features
 */
export default function NLPInsightsPanel({ nlpStats, messages, ollamaModel, onAnalyzeAll }) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [conversationSummary, setConversationSummary] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showSarcasm, setShowSarcasm] = useState(false);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return 'text-green-400 bg-green-900/30 border-green-800';
      case 'Negative': return 'text-red-400 bg-red-900/30 border-red-800';
      case 'Neutral': return 'text-gray-400 bg-gray-900/30 border-gray-800';
      default: return 'text-gray-500 bg-gray-900/20 border-gray-800';
    }
  };

  const getIntentIcon = (intent) => {
    const icons = {
      Question: '?',
      Command: '⚡',
      Greeting: '👋',
      Complaint: '⚠',
      Gratitude: '❤',
      Statement: '💬',
      Request: '📥',
      Farewell: '👋',
      Confirmation: '✅',
      Denial: '❌'
    };
    return icons[intent] || '💬';
  };

  const getTopicColor = (topic) => {
    const colors = {
      Technology: 'bg-blue-600',
      Health: 'bg-red-500',
      Finance: 'bg-green-600',
      Education: 'bg-yellow-600',
      Entertainment: 'bg-purple-500',
      Science: 'bg-indigo-500',
      Sports: 'bg-orange-500',
      Business: 'bg-slate-600',
      Travel: 'bg-teal-500',
      Food: 'bg-pink-500',
      General: 'bg-gray-500'
    };
    return colors[topic] || 'bg-gray-500';
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      Joy: '😊',
      Anger: '😠',
      Fear: '😨',
      Surprise: '😮',
      Sadness: '😢',
      Disgust: '🤢',
      Neutral: '😐',
      Trust: '🤝',
      Anticipation: '👀'
    };
    return emojis[emotion] || '😐';
  };

  const {
    latestIntent,
    overallSentiment,
    avgSentimentScore,
    emotionCounts,
    dominantEmotion,
    topicDistribution,
    dominantTopic,
    entities,
    topKeywords,
    intentCounts,
    sentimentVolatility,
    linkedEntities,
    keywordSaliency,
    intentPath,
    actionItems,
    containment,
    sarcasm,
    urgency,
    health,
    language,
    style,
    recommendations,
    topRecommendation
  } = nlpStats || {};

  const allEntities = [
    ...entities?.people.map(e => ({ value: e, type: 'Person' })) || [],
    ...entities?.places.map(e => ({ value: e, type: 'Place' })) || [],
    ...entities?.organizations.map(e => ({ value: e, type: 'Organization' })) || [],
    ...entities?.topics.map(e => ({ value: e, type: 'Topic' })) || []
  ];

  const handleSummarize = useCallback(async () => {
    if (!messages || messages.length === 0) return;

    setIsSummarizing(true);
    try {
      const result = await summarizeConversation(messages, ollamaModel || 'llama3.2');
      setConversationSummary(result);
      setExpandedSection('summary');
    } catch (err) {
      console.error('Summarization failed:', err);
    } finally {
      setIsSummarizing(false);
    }
  }, [messages, ollamaModel]);

  const handleAnalyzeAll = useCallback(() => {
    if (onAnalyzeAll) {
      onAnalyzeAll();
      setExpandedSection('analysis');
    }
  }, [onAnalyzeAll]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Render sentiment sparkline
  const renderSparkline = () => {
    if (!sentimentVolatility?.sparkline || sentimentVolatility.sparkline.length < 2) {
      return <span className="text-gray-500 text-xs">Not enough data</span>;
    }
    const points = sentimentVolatility.sparkline;
    const height = 30;
    const width = 100;
    const stepX = width / (points.length - 1);

    const polylinePoints = points.map((p, i) => `${i * stepX},${height - (p / 100) * height}`).join(' ');

    let trendColor = 'stroke-gray-400';
    if (sentimentVolatility.trend === 'improving') trendColor = 'stroke-green-400';
    if (sentimentVolatility.trend === 'declining') trendColor = 'stroke-red-400';

    return (
      <div className="flex items-center gap-2">
        <svg width={width} height={height} className="overflow-visible">
          <polyline
            points={polylinePoints}
            fill="none"
            strokeWidth="2"
            className={`${trendColor} transition-colors`}
          />
        </svg>
        <span className={`text-xs ${trendColor.replace('stroke-', 'text-')}`}>
          {sentimentVolatility.trend === 'improving' && '↗ Improving'}
          {sentimentVolatility.trend === 'declining' && '↘ Declining'}
          {sentimentVolatility.trend === 'stable' && '→ Stable'}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          NLP Insights
        </h3>
        <button
          onClick={handleAnalyzeAll}
          disabled={!messages || messages.length === 0}
          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
          title="Analyze all messages"
        >
          🔍 Analyze
        </button>
      </div>

      {/* Quick Stats Grid - Enhanced */}
      <div className="grid grid-cols-2 gap-2">
        {/* Intent Card - with confidence */}
        <button
          onClick={() => toggleSection('intent')}
          className="bg-chat-input rounded-lg p-3 border border-chat-border hover:border-blue-500 transition-colors text-left"
        >
          <div className="text-xs text-gray-500 mb-1">Latest Intent</div>
          {latestIntent ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="text-purple-400">{getIntentIcon(latestIntent.intent)}</span>
                <span className="text-white font-medium text-sm">{latestIntent.intent}</span>
              </div>
              {latestIntent.confidencePercent && (
                <div className="text-xs text-gray-400">Confidence: {latestIntent.confidencePercent}%</div>
              )}
              {latestIntent.isLowConfidence && (
                <div className="text-xs text-amber-400 flex items-center gap-1">
                  <span>⚠️ Low confidence</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-xs">No messages</div>
          )}
        </button>

        {/* Sentiment Card - with volatility */}
        <button
          onClick={() => toggleSection('sentiment')}
          className="bg-chat-input rounded-lg p-3 border border-chat-border hover:border-blue-500 transition-colors text-left"
        >
          <div className="text-xs text-gray-500 mb-1">Sentiment</div>
          {overallSentiment && overallSentiment !== 'No data' ? (
            <div className="flex flex-col gap-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border w-fit ${getSentimentColor(overallSentiment)}`}>
                {overallSentiment}
              </span>
              {sentimentVolatility && (
                <div className="text-xs text-gray-400">
                  Volatility: {sentimentVolatility.volatility}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-xs">No messages</div>
          )}
        </button>

        {/* Emotion Card - with urgency */}
        <button
          onClick={() => toggleSection('emotion')}
          className="bg-chat-input rounded-lg p-3 border border-chat-border hover:border-blue-500 transition-colors text-left"
        >
          <div className="text-xs text-gray-500 mb-1">Emotion</div>
          {dominantEmotion ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="text-lg">{getEmotionEmoji(dominantEmotion.emotion)}</span>
                <span className="text-white font-medium text-sm">{dominantEmotion.emotion}</span>
              </div>
              {urgency && (
                <div className={`text-xs px-1.5 py-0.5 rounded w-fit ${urgency.color}`}>
                  Priority: {urgency.score}/10
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-xs">No messages</div>
          )}
        </button>

        {/* Topic Card */}
        <button
          onClick={() => toggleSection('topic')}
          className="bg-chat-input rounded-lg p-3 border border-chat-border hover:border-blue-500 transition-colors text-left"
        >
          <div className="text-xs text-gray-500 mb-1">Topic</div>
          {dominantTopic ? (
            <div className={`px-2 py-0.5 rounded text-xs font-medium inline-block ${getTopicColor(dominantTopic.topic)}`}>
              {dominantTopic.topic}
            </div>
          ) : (
            <div className="text-gray-500 text-xs">No messages</div>
          )}
        </button>

        {/* Conversation Health Card */}
        <button
          onClick={() => toggleSection('health')}
          className="bg-chat-input rounded-lg p-3 border border-chat-border hover:border-blue-500 transition-colors text-left"
        >
          <div className="text-xs text-gray-500 mb-1">Conversation Health</div>
          {health ? (
            <div className="flex flex-col gap-1">
              <div className={`text-xs px-2 py-0.5 rounded w-fit ${health.healthColor} text-white`}>
                {health.healthLevel}
              </div>
              <div className="text-xs text-gray-400">Score: {health.healthScore}/100</div>
            </div>
          ) : (
            <div className="text-gray-500 text-xs">No data</div>
          )}
        </button>

        {/* Language & Style Card */}
        <button
          onClick={() => toggleSection('language')}
          className="bg-chat-input rounded-lg p-3 border border-chat-border hover:border-blue-500 transition-colors text-left"
        >
          <div className="text-xs text-gray-500 mb-1">Language & Style</div>
          {language && language.language ? (
            <div className="flex flex-col gap-0.5">
              <div className="text-xs text-white">{language.language} ({Math.round(language.confidence * 100)}%)</div>
              {style && style.style && (
                <div className="text-xs text-gray-400">{style.style}</div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-xs">No data</div>
          )}
        </button>
      </div>

      {/* AI Recommendations Banner - Top Priority */}
      {topRecommendation && (
        <div className={`rounded-lg p-3 border ${topRecommendation.color} bg-opacity-20 border-opacity-50`}>
          <div className="flex items-start gap-3">
            <span className="text-xl">{topRecommendation.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">AI Recommendation</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${topRecommendation.color} text-white`}>
                    {topRecommendation.priority}
                  </span>
                </div>
                {recommendations && recommendations.length > 1 && (
                  <button
                    onClick={() => toggleSection('recommendations')}
                    className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                  >
                    View All ({recommendations.length})
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-200">{topRecommendation.recommendation}</div>
            </div>
          </div>
        </div>
      )}

      {/* Urgency & Containment Banner */}
      {urgency && urgency.score >= 6 && (
        <div className={`rounded-lg p-3 border ${urgency.color} bg-opacity-20 border-opacity-50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚨</span>
              <div>
                <div className="text-white font-medium text-sm">High Priority Detected</div>
                <div className="text-xs text-gray-300">Urgency Score: {urgency.score}/10</div>
              </div>
            </div>
            {containment?.needsHumanIntervention && (
              <div className="text-xs px-2 py-1 bg-red-600 rounded text-white animate-pulse">
                ⚠️ Human Review Needed
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sarcasm Detection Toggle */}
      {sarcasm && sarcasm.isSarcastic && (
        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🙃</span>
              <div>
                <div className="text-amber-200 font-medium text-sm">Potential Sarcasm Detected</div>
                <div className="text-xs text-amber-400/70">Confidence: {sarcasm.confidence}%</div>
              </div>
            </div>
            <button
              onClick={() => setShowSarcasm(!showSarcasm)}
              className="text-xs px-2 py-1 bg-amber-700 hover:bg-amber-600 rounded text-white"
            >
              {showSarcasm ? 'Hide' : 'Details'}
            </button>
          </div>
          {showSarcasm && sarcasm.indicators && sarcasm.indicators.length > 0 && (
            <div className="mt-2 text-xs text-amber-300/80">
              Indicators: {sarcasm.indicators.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Expanded Sections */}
      {expandedSection === 'intent' && (
        <div className="bg-chat-input rounded-lg p-3 border border-chat-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Intent Analysis</div>
            <button onClick={() => setExpandedSection(null)} className="text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Intent Path */}
          {intentPath && intentPath.path && intentPath.path.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-2">Intent Path</div>
              <div className="flex flex-wrap items-center gap-1 text-xs">
                {intentPath.path.slice(0, 8).map((intent, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-400 border border-purple-800">
                      {getIntentIcon(intent)} {intent}
                    </span>
                    {i < intentPath.path.length - 1 && <span className="text-gray-600">→</span>}
                  </span>
                ))}
                {intentPath.path.length > 8 && (
                  <span className="text-gray-500">... +{intentPath.path.length - 8} more</span>
                )}
              </div>
            </div>
          )}

          {/* Frustration Detection */}
          {intentPath?.frustrationDetected && (
            <div className="bg-red-900/30 border border-red-700 rounded p-2">
              <div className="text-xs text-red-300 flex items-center gap-1">
                <span>⚠️</span>
                <span>User frustration detected - consider escalation</span>
              </div>
            </div>
          )}

          {/* Intent Breakdown */}
          {intentCounts && Object.keys(intentCounts).length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-2">Intent Breakdown</div>
              <div className="space-y-1">
                {Object.entries(intentCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([intent, count]) => (
                    <div key={intent} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-gray-300">
                        {getIntentIcon(intent)}
                        {intent}
                      </span>
                      <span className="text-gray-500">{count}x</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {expandedSection === 'sentiment' && (
        <div className="bg-chat-input rounded-lg p-3 border border-chat-border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500">Sentiment Details</div>
            <button onClick={() => setExpandedSection(null)} className="text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Overall</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSentimentColor(overallSentiment || 'Neutral')}`}>
                {overallSentiment || 'Neutral'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Avg Score</span>
              <span className="text-white text-sm">{avgSentimentScore > 0 ? '+' : ''}{avgSentimentScore}</span>
            </div>
            <div className="border-t border-gray-700 pt-2">
              <div className="text-xs text-gray-400 mb-2">Sentiment Trend</div>
              {renderSparkline()}
            </div>
            {sentimentVolatility && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Volatility</span>
                  <span className="text-white text-sm">{sentimentVolatility.volatility}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Mean Score</span>
                  <span className="text-white text-sm">{sentimentVolatility.mean}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {expandedSection === 'emotion' && (
        <div className="bg-chat-input rounded-lg p-3 border border-chat-border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500">Emotion & Urgency</div>
            <button onClick={() => setExpandedSection(null)} className="text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {emotionCounts && Object.entries(emotionCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([emotion, count]) => (
                <div key={emotion} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <span>{getEmotionEmoji(emotion)}</span>
                    <span className="text-gray-300">{emotion}</span>
                  </span>
                  <span className="text-gray-500">{count}x</span>
                </div>
              ))}
          </div>
          {urgency && (
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="text-xs text-gray-400 mb-2">Urgency Score</div>
              <div className="flex items-center gap-2">
                <div className={`text-lg font-bold ${urgency.color.replace('bg-', 'text-')}`}>
                  {urgency.score}/10
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${urgency.color} text-white`}>
                  {urgency.level}
                </span>
              </div>
              {urgency.factors && urgency.factors.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Factors: {urgency.factors.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {expandedSection === 'topic' && topicDistribution && topicDistribution.length > 0 && (
        <div className="bg-chat-input rounded-lg p-3 border border-chat-border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500">Topic Distribution</div>
            <button onClick={() => setExpandedSection(null)} className="text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-1.5">
            {topicDistribution.slice(0, 5).map(({ topic, percentage }) => (
              <div key={topic} className="flex items-center gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded ${getTopicColor(topic)} text-white`}>
                  {topic}
                </span>
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getTopicColor(topic).replace('bg-', 'bg-opacity-80 bg-')}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entities Section with Linking */}
      <div className="bg-chat-input rounded-lg border border-chat-border overflow-hidden">
        <button
          onClick={() => toggleSection('entities')}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-chat-bubble-bot transition-colors"
        >
          <span className="text-xs text-gray-500">Entities (Knowledge Graph)</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'entities' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSection === 'entities' && (
          <div className="px-3 pb-3 max-h-64 overflow-y-auto">
            {linkedEntities && (linkedEntities.people.length > 0 || linkedEntities.places.length > 0 || linkedEntities.organizations.length > 0) ? (
              <div className="space-y-3">
                {linkedEntities.people.length > 0 && (
                  <div>
                    <div className="text-xs text-amber-400 mb-1">People</div>
                    {linkedEntities.people.map((entity, idx) => (
                      <div key={`person-${idx}`} className="flex items-center gap-2 text-sm mb-1">
                        <span className="text-gray-300">{entity.name}</span>
                        {entity.linkedTo && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-400 border border-amber-800">
                            🔗 {entity.linkedTo}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {linkedEntities.places.length > 0 && (
                  <div>
                    <div className="text-xs text-blue-400 mb-1">Places</div>
                    {linkedEntities.places.map((entity, idx) => (
                      <div key={`place-${idx}`} className="flex items-center gap-2 text-sm mb-1">
                        <span className="text-gray-300">{entity.name}</span>
                        {entity.linkedTo && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-400 border border-blue-800">
                            🔗 {entity.linkedTo}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {linkedEntities.organizations.length > 0 && (
                  <div>
                    <div className="text-xs text-indigo-400 mb-1">Organizations</div>
                    {linkedEntities.organizations.map((entity, idx) => (
                      <div key={`org-${idx}`} className="flex items-center gap-2 text-sm mb-1">
                        <span className="text-gray-300">{entity.name}</span>
                        {entity.linkedTo && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-900/50 text-indigo-400 border border-indigo-800">
                            🔗 {entity.linkedTo}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : allEntities.length > 0 ? (
              <div className="space-y-2">
                {allEntities.map((entity, idx) => (
                  <div key={`${entity.type}-${entity.value}-${idx}`} className="flex items-center gap-2 text-sm">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      entity.type === 'Person' ? 'bg-amber-900/50 text-amber-400' :
                      entity.type === 'Place' ? 'bg-blue-900/50 text-blue-400' :
                      entity.type === 'Organization' ? 'bg-indigo-900/50 text-indigo-400' :
                      'bg-teal-900/50 text-teal-400'
                    }`}>
                      {entity.type}
                    </span>
                    <span className="text-gray-300">{entity.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-2">No entities detected yet</div>
            )}
          </div>
        )}
      </div>

      {/* Keywords Section with Saliency Heat Map */}
      <div className="bg-chat-input rounded-lg border border-chat-border overflow-hidden">
        <button
          onClick={() => toggleSection('keywords')}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-chat-bubble-bot transition-colors"
        >
          <span className="text-xs text-gray-500">Keywords (Saliency Map)</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'keywords' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSection === 'keywords' && (
          <div className="px-3 pb-3">
            {keywordSaliency && keywordSaliency.length > 0 ? (
              <div className="space-y-2">
                {keywordSaliency.map(({ keyword, saliency, heatLevel }) => (
                  <div key={keyword} className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded transition-all ${
                        heatLevel === 4 ? 'bg-red-600 text-white font-semibold scale-105' :
                        heatLevel === 3 ? 'bg-orange-600 text-white' :
                        heatLevel === 2 ? 'bg-yellow-600 text-white' :
                        'bg-teal-900/30 text-teal-400'
                      }`}
                      style={{
                        fontSize: heatLevel >= 3 ? '0.85rem' : '0.7rem',
                        opacity: 0.5 + (saliency * 0.5)
                      }}
                    >
                      {keyword}
                    </span>
                    <span className="text-xs text-gray-500 w-12 text-right">{saliency}</span>
                  </div>
                ))}
              </div>
            ) : topKeywords && topKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {topKeywords.map(({ keyword, count }) => (
                  <span
                    key={keyword}
                    className="text-xs px-2 py-1 rounded-full bg-teal-900/30 text-teal-400 border border-teal-800/50"
                    title={`Mentioned ${count} time${count > 1 ? 's' : ''}`}
                  >
                    {keyword}
                    <span className="text-teal-600 ml-1">×{count}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-2">No keywords yet</div>
            )}
          </div>
        )}
      </div>

      {/* Action Items & Containment */}
      {actionItems && (actionItems.actionRequired.length > 0 || actionItems.questionAsked.length > 0 || actionItems.decisionMade.length > 0 || actionItems.resolved.length > 0) && (
        <div className="bg-chat-input rounded-lg border border-chat-border overflow-hidden">
          <button
            onClick={() => toggleSection('actions')}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-chat-bubble-bot transition-colors"
          >
            <span className="text-xs text-gray-500">Action Items</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'actions' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'actions' && (
            <div className="px-3 pb-3 max-h-48 overflow-y-auto space-y-2">
              {actionItems.actionRequired.length > 0 && (
                <div>
                  <div className="text-xs text-amber-400 mb-1 flex items-center gap-1">
                    <span>📋</span> Action Required
                  </div>
                  {actionItems.actionRequired.slice(0, 3).map((item, i) => (
                    <div key={i} className="text-xs text-gray-300 bg-amber-900/20 rounded px-2 py-1 mb-1">
                      {item.length > 80 ? item.substring(0, 80) + '...' : item}
                    </div>
                  ))}
                </div>
              )}
              {actionItems.questionAsked.length > 0 && (
                <div>
                  <div className="text-xs text-blue-400 mb-1 flex items-center gap-1">
                    <span>❓</span> Questions Asked
                  </div>
                  {actionItems.questionAsked.slice(0, 3).map((item, i) => (
                    <div key={i} className="text-xs text-gray-300 bg-blue-900/20 rounded px-2 py-1 mb-1">
                      {item.length > 80 ? item.substring(0, 80) + '...' : item}
                    </div>
                  ))}
                </div>
              )}
              {actionItems.decisionMade.length > 0 && (
                <div>
                  <div className="text-xs text-green-400 mb-1 flex items-center gap-1">
                    <span>✅</span> Decisions Made
                  </div>
                  {actionItems.decisionMade.slice(0, 3).map((item, i) => (
                    <div key={i} className="text-xs text-gray-300 bg-green-900/20 rounded px-2 py-1 mb-1">
                      {item.length > 80 ? item.substring(0, 80) + '...' : item}
                    </div>
                  ))}
                </div>
              )}
              {actionItems.resolved.length > 0 && (
                <div>
                  <div className="text-xs text-emerald-400 mb-1 flex items-center gap-1">
                    <span>✨</span> Resolved
                  </div>
                  {actionItems.resolved.slice(0, 3).map((item, i) => (
                    <div key={i} className="text-xs text-gray-300 bg-emerald-900/20 rounded px-2 py-1 mb-1">
                      {item.length > 80 ? item.substring(0, 80) + '...' : item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Containment Status */}
      {containment && (
        <div className={`rounded-lg p-3 border ${
          containment.status === 'Resolved' ? 'bg-green-900/30 border-green-700' :
          containment.status === 'Escalation Risk' ? 'bg-red-900/30 border-red-700' :
          containment.status === 'Pending Action' ? 'bg-amber-900/30 border-amber-700' :
          'bg-gray-900/30 border-gray-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {containment.status === 'Resolved' && <span className="text-lg">✅</span>}
              {containment.status === 'Escalation Risk' && <span className="text-lg">⚠️</span>}
              {containment.status === 'Pending Action' && <span className="text-lg">⏳</span>}
              {containment.status === 'In Progress' && <span className="text-lg">🔄</span>}
              <div>
                <div className="text-white font-medium text-sm">Containment: {containment.status}</div>
                <div className="text-xs text-gray-400">
                  {containment.needsHumanIntervention ? 'Requires human intervention' : 'AI handled'}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Confidence: {Math.round(containment.confidence * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Conversation Health Expanded Section */}
      {expandedSection === 'health' && health && (
        <div className="bg-chat-input rounded-lg p-3 border border-chat-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Conversation Health Metrics</div>
            <button onClick={() => setExpandedSection(null)} className="text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Health Score Gauge */}
          <div className="flex items-center gap-3">
            <div className={`text-2xl font-bold ${health.healthColor.replace('bg-', 'text-')}`}>
              {health.healthScore}/100
            </div>
            <span className={`text-xs px-2 py-1 rounded ${health.healthColor} text-white`}>
              {health.healthLevel}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-400">Dead-end Rate</div>
              <div className={`text-white font-medium ${health.deadEndRate > 0.2 ? 'text-red-400' : 'text-green-400'}`}>
                {health.deadEndRate * 100}%
              </div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-400">Response Ratio</div>
              <div className={`text-white font-medium ${health.responseLengthRatio > 2 || health.responseLengthRatio < 0.3 ? 'text-amber-400' : 'text-green-400'}`}>
                {health.responseLengthRatio}x
              </div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-400">User Talk</div>
              <div className="text-white font-medium">{health.userTalkRatio * 100}%</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-400">Assistant Talk</div>
              <div className="text-white font-medium">{health.assistantTalkRatio * 100}%</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-400">Avg User Length</div>
              <div className="text-white font-medium">{health.avgUserMessageLength} chars</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-400">Engagement</div>
              <div className={`text-white font-medium ${health.engagementScore > 70 ? 'text-green-400' : health.engagementScore > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {health.engagementScore}/100
              </div>
            </div>
          </div>

          {/* Issues List */}
          {health.issues && health.issues.length > 0 && (
            <div className="bg-red-900/20 border border-red-800 rounded p-2">
              <div className="text-xs text-red-300 font-medium mb-1">Issues Detected:</div>
              {health.issues.map((issue, i) => (
                <div key={i} className="text-xs text-red-400/80 flex items-center gap-1">
                  <span>⚠️</span> {issue}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Language & Style Expanded Section */}
      {expandedSection === 'language' && (
        <div className="bg-chat-input rounded-lg p-3 border border-chat-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Language & Style Analysis</div>
            <button onClick={() => setExpandedSection(null)} className="text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Language Detection */}
          {language && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Detected Language</div>
              <div className="flex items-center gap-2">
                <span className="text-lg px-3 py-1 rounded bg-blue-900/50 text-blue-400 border border-blue-800">
                  {language.language}
                </span>
                <span className="text-xs text-gray-400">Confidence: {Math.round(language.confidence * 100)}%</span>
              </div>
              {language.script && (
                <div className="text-xs text-gray-500">Script: {language.script}</div>
              )}
            </div>
          )}

          {/* Style Detection */}
          {style && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Communication Style</div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded ${style.style === 'Formal' ? 'bg-purple-900/50 text-purple-400 border border-purple-800' : style.style === 'Informal' ? 'bg-pink-900/50 text-pink-400 border border-pink-800' : 'bg-gray-700 text-gray-400'}`}>
                  {style.style || 'Neutral'}
                </span>
                <span className="text-xs text-gray-400">Confidence: {Math.round(style.confidence * 100)}%</span>
              </div>
              {style.indicators && style.indicators.length > 0 && (
                <div className="text-xs text-gray-500">
                  Indicators: {style.indicators.slice(0, 5).map(ind => ind.marker).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Tone Matching Recommendation */}
          {style && style.style && style.confidence > 0.6 && (
            <div className="bg-blue-900/20 border border-blue-800 rounded p-2">
              <div className="text-xs text-blue-300 flex items-center gap-1">
                <span>🎭</span>
                <span>Recommendation: Match user's {style.style.toLowerCase()} tone</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Expanded Section */}
      {expandedSection === 'recommendations' && recommendations && recommendations.length > 0 && (
        <div className="bg-chat-input rounded-lg p-3 border border-chat-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">All AI Recommendations</div>
            <button onClick={() => setExpandedSection(null)} className="text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {recommendations.map((rec, idx) => (
            <div key={idx} className={`rounded p-2 border ${rec.color} bg-opacity-10 border-opacity-30`}>
              <div className="flex items-start gap-2">
                <span className="text-lg">{rec.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">{rec.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${rec.color} text-white`}>
                      {rec.priority}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300">{rec.recommendation}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conversation Summary Card */}
      <div className="bg-chat-input rounded-lg border border-chat-border overflow-hidden">
        <div className="p-3 border-b border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-500">Conversation Summary</span>
          <button
            onClick={handleSummarize}
            disabled={isSummarizing || !messages || messages.length === 0}
            className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center gap-1"
          >
            {isSummarizing ? (
              <>
                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Summarize
              </>
            )}
          </button>
        </div>

        {conversationSummary && (
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>📝 {conversationSummary.messageCount} messages</span>
              <span>📄 {conversationSummary.wordCount} words</span>
              <span className={`px-1.5 py-0.5 rounded ${getTopicColor(conversationSummary.dominantTopic)} text-white`}>
                {conversationSummary.dominantTopic}
              </span>
            </div>
            <div className="text-sm text-gray-300 leading-relaxed bg-gray-800/50 rounded p-2">
              {conversationSummary.summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
