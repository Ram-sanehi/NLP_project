import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MessageBubble({ message, isLast }) {
  const isUser = message.role === 'user';
  const isError = message.isError || false;
  const nlp = message.nlp;

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSentimentColor = (label) => {
    switch (label) {
      case 'Positive': return 'bg-green-600 text-white';
      case 'Negative': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getIntentIcon = (intent) => {
    const icons = {
      Question: '?',
      Command: '⚡',
      Greeting: '👋',
      Complaint: '⚠',
      Gratitude: '❤',
      Statement: '💬'
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
      Neutral: '😐'
    };
    return emojis[emotion] || '😐';
  };

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-chat-bubble-user text-white rounded-br-sm'
          : isError
          ? 'bg-red-900/30 border border-red-800 text-red-200 rounded-bl-sm'
          : 'bg-chat-bubble-bot text-gray-100 rounded-bl-sm'
      }`}>
        {/* Message content */}
        <div className="prose prose-invert prose-sm max-w-none mb-3">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                if (inline) {
                  return <code className={className} {...props}>{children}</code>;
                }
                return match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg mt-2 mb-2"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} style={{
                    background: '#1e1e1e',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    display: 'block',
                    overflowX: 'auto'
                  }} {...props}>
                    {String(children).replace(/\n$/, '')}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* NLP Badges for user messages - Simplified */}
        {isUser && nlp && (
          <div className="space-y-2 border-t border-white/10 pt-2">
            {/* Row 1: Intent, Emotion */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {nlp.intent && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-600 text-white font-medium">
                  <span>{getIntentIcon(nlp.intent.intent)}</span>
                  <span>{nlp.intent.intent}</span>
                </span>
              )}

              {nlp.emotion && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-pink-600 text-white font-medium">
                  <span>{getEmotionEmoji(nlp.emotion.emotion)}</span>
                  <span>{nlp.emotion.emotion}</span>
                </span>
              )}
            </div>

            {/* Row 2: Sentiment, Topic */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {nlp.sentiment && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${getSentimentColor(nlp.sentiment.label)}`}>
                  <span>{nlp.sentiment.label}</span>
                  <span className="opacity-75">({nlp.sentiment.score > 0 ? '+' : ''}{nlp.sentiment.score})</span>
                </span>
              )}

              {nlp.topic && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${getTopicColor(nlp.topic.topic)}`}>
                  <span>🏷️</span>
                  <span>{nlp.topic.topic}</span>
                </span>
              )}
            </div>

            {/* Entities (compact display) */}
            {nlp.entities && (nlp.entities.people?.length > 0 || nlp.entities.places?.length > 0 || nlp.entities.organizations?.length > 0) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {nlp.entities.people?.slice(0, 3).map((entity, idx) => (
                  <span key={`person-${idx}`} className="text-xs px-1.5 py-0.5 rounded bg-amber-600/80 text-white">
                    👤 {entity}
                  </span>
                ))}
                {nlp.entities.places?.slice(0, 3).map((entity, idx) => (
                  <span key={`place-${idx}`} className="text-xs px-1.5 py-0.5 rounded bg-blue-600/80 text-white">
                    📍 {entity}
                  </span>
                ))}
                {nlp.entities.organizations?.slice(0, 3).map((entity, idx) => (
                  <span key={`org-${idx}`} className="text-xs px-1.5 py-0.5 rounded bg-indigo-600/80 text-white">
                    🏢 {entity}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs mt-2 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
