/**
 * Summarizes conversation history using Ollama.
 * Called after every 10 user messages to maintain context without exceeding token limits.
 *
 * @param {Array} messages - Array of message objects with { role, content } properties
 * @returns {Promise<string>} Conversation summary (approximately 5 sentences)
 */
export async function summarizeHistory(messages) {
  try {
    // Format messages for the summarization prompt
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    // Create a summarization prompt
    // IMPORTANT: Must return exactly 5 sentences focusing on key topics and decisions
    const summaryPrompt = `Summarize the following conversation in exactly 5 sentences, focusing on key topics and decisions.

Rules:
- Write exactly 5 sentences, no more and no less
- Focus on the main topics discussed
- Note any decisions, conclusions, or action items
- Keep it concise and informative

---
${conversationText}
---

Summary (exactly 5 sentences):`;

    // Call Ollama API for summarization
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: summaryPrompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response?.trim() || 'Conversation summary unavailable.';
  } catch (error) {
    console.error('Failed to summarize conversation:', error);
    // Return a fallback summary if summarization fails
    return 'Conversation summary unavailable due to API error. Previous topics included various user queries and assistant responses.';
  }
}

/**
 * Checks if summarization should be triggered.
 * Summarization happens after every 10 user messages.
 *
 * @param {number} userMessageCount - Total number of user messages sent
 * @param {boolean} hasSummarized - Whether a summary already exists for this threshold
 * @returns {boolean} True if summarization should be triggered
 */
export function shouldSummarize(userMessageCount, hasSummarized) {
  // Trigger summarization at 10, 20, 30, etc. user messages
  // but only if we haven't already summarized at this threshold
  const isAtThreshold = userMessageCount > 0 && userMessageCount % 10 === 0;
  return isAtThreshold && !hasSummarized;
}
