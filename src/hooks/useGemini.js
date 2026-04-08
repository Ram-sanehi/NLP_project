import { useState, useCallback, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt } from '../utils/buildSystemPrompt';

/**
 * Custom hook for Gemini AI integration.
 * Handles all API interactions with context-aware prompt building.
 *
 * Context Injection Flow:
 * 1. System prompt is built with user profile, mode, file content, summary, and NLP insights
 * 2. Prompt is rebuilt whenever any context changes (mode switch, profile update, new NLP data)
 * 3. Each message is sent with the full context embedded in systemInstruction
 *
 * @param {string} apiKey - Gemini API key
 * @param {Object} userProfile - User profile { name, role, language }
 * @param {string} mode - Current mode (General/Study/Support)
 * @param {string} fileContent - Extracted text from uploaded file
 * @param {string} conversationSummary - Summary of conversation history
 * @param {Object} nlpStats - Aggregated NLP insights from useNLP hook
 * @returns {Object} Gemini API methods and state
 */
export function useGemini(apiKey, userProfile, mode, fileContent, conversationSummary, nlpStats) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Store the chat session reference to maintain conversation history
  const chatSessionRef = useRef(null);
  // Track the current system prompt to know when to rebuild
  const currentSystemPromptRef = useRef(null);

  /**
   * Builds or rebuilds the system prompt and creates a new chat session.
   * This is called when context changes (mode switch, profile update, file upload, NLP insights).
   *
   * The system prompt includes:
   * - User profile (name, role, language)
   * - Mode-specific behavior instructions
   * - Current date/time for temporal context
   * - Uploaded file content (RAG context)
   * - Conversation summary (compressed history)
   * - NLP insights (sentiment patterns, detected entities, intent patterns)
   */
  const rebuildChatSession = useCallback(() => {
    // Don't initialize if no API key
    if (!apiKey) {
      return false;
    }

    try {
      // Build the complete system prompt with all context sources
      const systemPrompt = buildSystemPrompt({
        name: userProfile?.name || 'User',
        role: userProfile?.role || 'General',
        language: userProfile?.language || 'English',
        mode,
        fileContent,
        conversationSummary,
        nlpStats // NLP insights for adaptive responses
      });

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt
      });

      // Start a new chat session
      // If we had a previous session, we'll lose its history but gain new context
      chatSessionRef.current = model.startChat({
        history: []
      });

      currentSystemPromptRef.current = systemPrompt;
      setError(null);

      return true;
    } catch (err) {
      console.error('Failed to initialize Gemini chat:', err);
      setError('Failed to initialize AI. Please check your API key.');
      return false;
    }
  }, [apiKey, userProfile, mode, fileContent, conversationSummary, nlpStats]);

  /**
   * Sends a message to Gemini and returns the response.
   * Includes full conversation history for multi-turn memory.
   *
   * The system prompt is checked before each send to ensure context changes
   * (like mode switches or new NLP insights) are reflected immediately.
   *
   * @param {string} message - User's message content
   * @returns {Promise<string>} AI response text
   */
  const sendMessage = useCallback(async (message) => {
    if (!apiKey) {
      setError('API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    // Rebuild chat session if system prompt has changed or not initialized
    // This ensures context changes are reflected immediately
    const expectedPrompt = buildSystemPrompt({
      name: userProfile?.name || 'User',
      role: userProfile?.role || 'General',
      language: userProfile?.language || 'English',
      mode,
      fileContent,
      conversationSummary,
      nlpStats
    });

    if (expectedPrompt !== currentSystemPromptRef.current || !chatSessionRef.current) {
      const success = rebuildChatSession();
      if (!success) {
        setIsLoading(false);
        return null;
      }
    }

    try {
      const chatSession = chatSessionRef.current;

      // Send message - Gemini's startChat maintains history internally
      const result = await chatSession.sendMessage(message);
      const response = await result.response;

      setIsLoading(false);
      return response.text();
    } catch (err) {
      console.error('Gemini API error:', err);
      setIsLoading(false);

      // Handle specific error types
      if (err.message.includes('API key')) {
        setError('Invalid API key. Please check your VITE_GEMINI_API_KEY.');
      } else if (err.message.includes('quota')) {
        setError('API quota exceeded. Please try again later.');
      } else {
        setError('Failed to get response. Please try again.');
      }

      return null;
    }
  }, [apiKey, userProfile, mode, fileContent, conversationSummary, nlpStats, rebuildChatSession]);

  /**
   * Clears the current chat session and resets state.
   */
  const clearChat = useCallback(() => {
    chatSessionRef.current = null;
    currentSystemPromptRef.current = null;
    setError(null);
    rebuildChatSession();
  }, [rebuildChatSession]);

  return {
    isLoading,
    error,
    sendMessage,
    clearChat,
    rebuildChatSession
  };
}
