import { useState, useCallback, useEffect } from 'react';
import { buildSystemPrompt } from '../utils/buildSystemPrompt';

/**
 * Ollama AI Integration Hook
 * Communicates with local Ollama server at http://localhost:11434
 */
export function useOllama(userProfile, mode, fileContent, conversationSummary, nlpStats, model = 'llama3.2') {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

  // Build system prompt when context changes
  useEffect(() => {
    try {
      const prompt = buildSystemPrompt({
        name: userProfile?.name || 'User',
        role: userProfile?.role || 'General',
        language: userProfile?.language || 'English',
        mode,
        fileContent,
        conversationSummary,
        nlpStats
      });
      setSystemPrompt(prompt);
      setError(null);
      setIsInitialized(true);
      console.log('[useOllama] System prompt built for mode:', mode);
    } catch (err) {
      console.error('Failed to build system prompt:', err);
      setError('Failed to initialize AI');
    }
  }, [userProfile, mode, fileContent, conversationSummary, nlpStats]);

  /**
   * Send message to Ollama and get response
   * @param {string} message - User message content
   */
  const sendMessage = useCallback(async (message) => {
    console.log('[Ollama] sendMessage called:', message);

    if (!isInitialized) {
      console.log('[Ollama] Not initialized yet');
      return null;
    }

    setIsLoading(true);
    setError(null);

    // Build messages array with system prompt only (fresh conversation per call)
    const messagesPayload = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ];

    const payload = {
      model: model,
      messages: messagesPayload,
      stream: false
    };

    console.log('[Ollama] Sending request...');
    console.log('[Ollama] Model:', model);
    console.log('[Ollama] URL: http://localhost:11434/api/chat');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('[Ollama] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Ollama] Error response:', errorText);
        throw new Error(`Ollama error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[Ollama] Full response:', data);

      // Handle the response properly
      const assistantMessage = data?.message?.content;

      if (!assistantMessage) {
        console.error('[Ollama] No message content in response:', data);
        setIsLoading(false);
        return 'No response received';
      }

      console.log('[Ollama] Message extracted:', assistantMessage.substring(0, 100));
      setIsLoading(false);
      return assistantMessage;

    } catch (err) {
      console.error('[Ollama] Fetch error:', err);
      setIsLoading(false);

      if (err.name === 'AbortError') {
        setError('Request timed out. Ollama took too long to respond.');
      } else if (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        setError('Cannot connect to Ollama. Start it with: ollama serve');
      } else if (err.message.includes('404')) {
        setError(`Model '${model}' not found. Run: ollama pull ${model}`);
      } else {
        setError(`Error: ${err.message}`);
      }

      return null;
    }
  }, [model, isInitialized, systemPrompt]);

  /**
   * Clear conversation history
   */
  const clearChat = useCallback(() => {
    setError(null);
    console.log('[useOllama] clearChat called');
  }, []);

  return {
    isLoading,
    error,
    sendMessage,
    clearChat
  };
}
