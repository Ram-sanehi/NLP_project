import { useRef, useEffect, useState, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({ messages, isLoading, ollamaError, onAnalyzeAllContent, uploadedFile }) {
  const messagesEndRef = useRef(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Listen for analyze event from sidebar
  useEffect(() => {
    const handleAnalyzeEvent = () => {
      const result = onAnalyzeAllContent();
      setAnalysisResult(result);
      setShowAnalysis(true);
    };

    window.addEventListener('analyze-signal', handleAnalyzeEvent);
    return () => window.removeEventListener('analyze-signal', handleAnalyzeEvent);
  }, [onAnalyzeAllContent]);

  const handleAnalyze = useCallback(() => {
    const result = onAnalyzeAllContent();
    setAnalysisResult(result);
    setShowAnalysis(true);
  }, [onAnalyzeAllContent]);

  const getSentimentColor = (label) => {
    switch (label) {
      case 'Positive': return 'bg-green-600 text-white';
      case 'Negative': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
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
      Neutral: '😐'
    };
    return emojis[emotion] || '😐';
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

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Ollama Error Banner */}
        {ollamaError && (
          <div className="mb-4 bg-red-900/30 border border-red-700 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-red-200 font-medium">Ollama Connection Error</p>
                <p className="text-red-300/80 text-sm mt-1">{ollamaError}</p>
                <div className="mt-2 text-xs text-red-400/70 bg-red-900/20 rounded p-2 font-mono">
                  Try: ollama serve
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results Panel */}
        {showAnalysis && analysisResult && (
          <div className="mb-6 bg-chat-input border border-chat-border rounded-xl p-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                NLP Analysis Results
              </h3>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {analysisResult.error ? (
              <div className="text-yellow-400 text-sm">{analysisResult.error}</div>
            ) : (
              <>
                {/* Content Source Info */}
                <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
                  {analysisResult.hasDocument && (
                    <span className="px-2 py-1 rounded bg-blue-900/50 text-blue-400 border border-blue-800">
                      📄 Document: {analysisResult.documentName}
                    </span>
                  )}
                  {analysisResult.messageCount > 0 && (
                    <span className="px-2 py-1 rounded bg-purple-900/50 text-purple-400 border border-purple-800">
                      💬 {analysisResult.messageCount} message(s)
                    </span>
                  )}
                  {!analysisResult.hasDocument && analysisResult.messageCount === 0 && (
                    <span className="text-gray-500">No content to analyze</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Intent with Confidence */}
                  <div className="bg-chat-bubble-bot rounded-lg p-3 border border-chat-border">
                    <div className="text-xs text-gray-500 mb-2">Intent Detection</div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 text-lg">
                          {getIntentIcon(analysisResult.intent?.intent)}
                        </span>
                        <span className="text-white font-medium">{analysisResult.intent?.intent || 'N/A'}</span>
                      </div>
                      {analysisResult.enhancedIntent?.confidencePercent && (
                        <div className="text-xs">
                          <span className="text-gray-400">Confidence: </span>
                          <span className={analysisResult.enhancedIntent.confidencePercent < 70 ? 'text-amber-400' : 'text-green-400'}>
                            {analysisResult.enhancedIntent.confidencePercent}%
                          </span>
                        </div>
                      )}
                      {analysisResult.enhancedIntent?.isLowConfidence && (
                        <div className="text-xs text-amber-400">⚠️ Low confidence</div>
                      )}
                    </div>
                  </div>

                  {/* Sentiment */}
                  <div className="bg-chat-bubble-bot rounded-lg p-3 border border-chat-border">
                    <div className="text-xs text-gray-500 mb-2">Overall Sentiment</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(analysisResult.sentiment?.label)}`}>
                          {analysisResult.sentiment?.label || 'Neutral'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">score: {analysisResult.sentiment?.score || 0} (comparative: {analysisResult.sentiment?.comparative || 0})</div>
                    </div>
                  </div>

                  {/* Emotion with Urgency */}
                  <div className="bg-chat-bubble-bot rounded-lg p-3 border border-chat-border">
                    <div className="text-xs text-gray-500 mb-2">Emotion & Priority</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{analysisResult.emotion?.emoji || '😐'}</span>
                        <span className="text-white font-medium">{analysisResult.emotion?.emotion || 'Neutral'}</span>
                      </div>
                      {analysisResult.urgency && (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${analysisResult.urgency.color}`}>
                            Priority: {analysisResult.urgency.score}/10
                          </span>
                          <span className="text-xs text-gray-400">{analysisResult.urgency.level}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="bg-chat-bubble-bot rounded-lg p-3 border border-chat-border">
                    <div className="text-xs text-gray-500 mb-2">Topic Classification</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${analysisResult.topic?.color || 'bg-gray-600'}`}>
                        🏷️ {analysisResult.topic?.topic || 'General'}
                      </span>
                      <span className="text-xs text-gray-500">({Math.round((analysisResult.topic?.confidence || 0) * 100)}%)</span>
                    </div>
                  </div>

                  {/* Entities */}
                  <div className="bg-chat-bubble-bot rounded-lg p-3 border border-chat-border md:col-span-2">
                    <div className="text-xs text-gray-500 mb-2">Entities Detected</div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.entities?.people?.length > 0 && (
                        <span className="text-xs px-2 py-1 rounded bg-amber-600/80 text-white">
                          👤 {analysisResult.entities.people.join(', ')}
                        </span>
                      )}
                      {analysisResult.entities?.places?.length > 0 && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-600/80 text-white">
                          📍 {analysisResult.entities.places.join(', ')}
                        </span>
                      )}
                      {analysisResult.entities?.organizations?.length > 0 && (
                        <span className="text-xs px-2 py-1 rounded bg-indigo-600/80 text-white">
                          🏢 {analysisResult.entities.organizations.join(', ')}
                        </span>
                      )}
                      {analysisResult.entities?.topics?.length > 0 && (
                        <span className="text-xs px-2 py-1 rounded bg-teal-600/80 text-white">
                          🏷️ {analysisResult.entities.topics.join(', ')}
                        </span>
                      )}
                      {(!analysisResult.entities?.people?.length &&
                        !analysisResult.entities?.places?.length &&
                        !analysisResult.entities?.organizations?.length &&
                        !analysisResult.entities?.topics?.length) && (
                        <span className="text-gray-500 text-sm">No entities detected</span>
                      )}
                    </div>
                  </div>

                  {/* Keywords with Saliency */}
                  <div className="bg-chat-bubble-bot rounded-lg p-3 border border-chat-border md:col-span-2">
                    <div className="text-xs text-gray-500 mb-2">Keywords (Saliency Map)</div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywordSaliency && analysisResult.keywordSaliency.length > 0 ? (
                        analysisResult.keywordSaliency.map(({ keyword, saliency, heatLevel }, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded transition-all ${
                              heatLevel === 4 ? 'bg-red-600 text-white font-semibold' :
                              heatLevel === 3 ? 'bg-orange-600 text-white' :
                              heatLevel === 2 ? 'bg-yellow-600 text-white' :
                              'bg-teal-900/30 text-teal-400'
                            }`}
                            style={{
                              fontSize: heatLevel >= 3 ? '0.85rem' : '0.7rem',
                              opacity: 0.5 + (saliency * 0.5)
                            }}
                            title={`Saliency: ${saliency}`}
                          >
                            {keyword}
                          </span>
                        ))
                      ) : analysisResult.keywords?.length > 0 ? (
                        analysisResult.keywords.map((keyword, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded-full bg-teal-600/80 text-white">
                            #{keyword}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No keywords detected</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Advanced Features Row */}
                <div className="mt-4 space-y-3">
                  {/* Sarcasm Detection */}
                  {analysisResult.sarcasm && analysisResult.sarcasm.isSarcastic && (
                    <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🙃</span>
                        <div className="flex-1">
                          <div className="text-amber-200 font-medium text-sm">Potential Sarcasm Detected</div>
                          <div className="text-xs text-amber-400/70">
                            Confidence: {analysisResult.sarcasm.confidence}% | Indicators: {analysisResult.sarcasm.indicators?.join(', ') || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Urgency Banner */}
                  {analysisResult.urgency && analysisResult.urgency.score >= 7 && (
                    <div className={`rounded-lg p-3 border ${analysisResult.urgency.color} bg-opacity-20 border-opacity-50`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🚨</span>
                        <div>
                          <div className="text-white font-medium text-sm">High Priority Conversation</div>
                          <div className="text-xs text-gray-300">
                            Urgency Score: {analysisResult.urgency.score}/10 | Level: {analysisResult.urgency.level}
                            {analysisResult.urgency.factors?.length > 0 && ` | Factors: ${analysisResult.urgency.factors.join(', ')}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Analyze Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleAnalyze}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Analyze {uploadedFile ? 'Document + Chat' : messages.length > 0 ? 'Chat' : ''}
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <div className="w-20 h-20 bg-chat-input rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to Context Chat
            </h2>
            <p className="text-gray-400 max-w-md">
              Your AI assistant with full conversation memory.
              Upload documents, switch modes, and have natural conversations.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={`${message.timestamp}-${index}`}
                message={message}
                isLast={index === messages.length - 1}
              />
            ))}

            {isLoading && (
              <div className="flex justify-start mb-4">
                <TypingIndicator />
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
