import { useState, useCallback, useEffect } from 'react';
import { summarizeHistory, shouldSummarize } from '../utils/summarizeHistory';

export function useConversation(storageKey = 'chatbot_conversation') {
  const [messages, setMessages] = useState([]);
  const [conversationSummary, setConversationSummary] = useState('');
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [hasSummarized, setHasSummarized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.messages || []);
        setConversationSummary(parsed.conversationSummary || '');
        setUserMessageCount(parsed.userMessageCount || 0);
        setHasSummarized(parsed.hasSummarized || false);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  }, [storageKey]);

  // Save to localStorage when messages change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        messages: messages.map(({ nlp, ...rest }) => rest),
        conversationSummary,
        userMessageCount,
        hasSummarized
      }));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }, [messages, conversationSummary, userMessageCount, hasSummarized, storageKey]);

  /**
   * Add a user message - SYNCHRONOUS, message shows immediately
   */
  const addUserMessage = useCallback((content, nlpResult) => {
    console.log('[useConversation] addUserMessage:', content.substring(0, 50));

    const newMessage = {
      role: 'user',
      content,
      timestamp: Date.now(),
      nlp: nlpResult || null
    };

    // Synchronously update state - message will render immediately
    setMessages(prev => {
      const updated = [...prev, newMessage];
      console.log('[useConversation] Messages updated:', updated.length);
      return updated;
    });

    // Update count separately
    setUserMessageCount(prev => prev + 1);

    // Check for summarization (don't block)
    const newCount = userMessageCount + 1;
    if (shouldSummarize(newCount, hasSummarized)) {
      setTimeout(() => {
        setMessages(current => {
          summarizeHistory(current.slice(-10))
            .then(summary => {
              setConversationSummary(prev => {
                const summaries = prev ? prev.split('\n\n---\n\n') : [];
                summaries.push(summary);
                return summaries.slice(-2).join('\n\n---\n\n');
              });
              setHasSummarized(true);
            })
            .catch(err => console.error('Summarization failed:', err));
          return current;
        });
      }, 100);
    }
  }, [userMessageCount, hasSummarized]);

  /**
   * Add an assistant message
   */
  const addAssistantMessage = useCallback((content) => {
    console.log('[useConversation] addAssistantMessage:', content.substring(0, 50));

    const newMessage = {
      role: 'assistant',
      content,
      timestamp: Date.now()
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      console.log('[useConversation] Messages after assistant:', updated.length);
      return updated;
    });
  }, []);

  /**
   * Add an error message
   */
  const addErrorMessage = useCallback((content) => {
    const newMessage = {
      role: 'assistant',
      content: `⚠️ ${content}`,
      timestamp: Date.now(),
      isError: true
    };

    setMessages(prev => [...prev, newMessage]);
  }, []);

  /**
   * Clear all messages
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationSummary('');
    setUserMessageCount(0);
    setHasSummarized(false);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  /**
   * Reset summarization flag
   */
  const resetSummarization = useCallback(() => {
    setHasSummarized(false);
  }, []);

  return {
    messages,
    conversationSummary,
    userMessageCount,
    addUserMessage,
    addAssistantMessage,
    addErrorMessage,
    clearConversation,
    resetSummarization
  };
}
