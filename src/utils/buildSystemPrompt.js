/**
 * Builds a dynamic system prompt by combining multiple context sources.
 * This function is called on every message to ensure the AI has full context.
 *
 * Context Injection Strategy:
 * 1. User Profile - Personalizes responses based on name, role, language
 * 2. Mode Instructions - Shapes AI behavior for different use cases
 * 3. Temporal Context - Current date/time for time-aware responses
 * 4. File Context - Uploaded document content for RAG-style Q&A
 * 5. Conversation Summary - Compressed history after 10+ messages
 * 6. NLP Insights - Detected patterns in intent, sentiment, and entities
 *
 * @param {Object} params - Parameters for building the system prompt
 * @param {string} params.name - User's name
 * @param {string} params.role - User's role (Student/Professional/General)
 * @param {string} params.language - User's preferred language
 * @param {string} params.mode - Current mode (General/Study/Support)
 * @param {string} params.fileContent - Extracted text from uploaded file (optional)
 * @param {string} params.conversationSummary - Summary of conversation after 10+ messages (optional)
 * @param {Object} params.nlpInsights - Aggregated NLP analysis results (optional)
 * @returns {string} Complete system prompt string
 */
export function buildSystemPrompt({
  name,
  role,
  language,
  mode,
  fileContent,
  conversationSummary,
  nlpInsights
}) {
  const now = new Date();
  const dateTimeString = now.toLocaleString(
    language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  );

  // Mode-specific instructions that define the AI's behavior
  // Each mode has distinct tone, goals, and response patterns
  const modeInstructions = {
    General: `You are a helpful, balanced assistant providing conversational responses.
- Be friendly and engaging while remaining informative
- Adapt your tone to match the user's communication style
- Provide concise answers unless more detail is requested
- Feel free to ask follow-up questions to better understand user needs`,

    Study: `You are an expert tutor and study helper. Your goal is to help the user learn and understand concepts deeply.
- Explain concepts clearly with step-by-step reasoning
- Provide relevant examples to illustrate points
- Use analogies when helpful for understanding
- Offer to quiz the user or ask check-in questions
- Break complex topics into manageable parts
- Encourage the user's learning progress`,

    Support: `You are a professional customer support agent. Your goal is to help resolve user issues efficiently.
- Be empathetic and acknowledge user frustrations
- Use a structured approach: understand the problem, provide clear steps, confirm resolution
- Offer alternative solutions if the first doesn't work
- Maintain a professional, patient tone
- Summarize next steps at the end of your response`
  };

  // Build the base system prompt with user context
  let prompt = `## SYSTEM CONTEXT

### User Profile
- **Name**: ${name || 'User'}
- **Role**: ${role || 'General'}
- **Preferred Language**: ${language || 'English'}
- **Current Date/Time**: ${dateTimeString}

### Current Mode: ${mode}
${modeInstructions[mode] || modeInstructions.General}

`;

  // Add file context if available (limited to 3000 chars to preserve tokens)
  // This enables RAG-style question answering on uploaded documents
  if (fileContent && fileContent.trim().length > 0) {
    prompt += `### UPLOADED DOCUMENT CONTEXT
The user has uploaded a document. Use this content to answer questions about it.

---
${fileContent.slice(0, 3000)}
---

When answering questions about the document, reference specific details from the content above.

`;
  }

  // Add conversation summary if available (after 10+ messages)
  // This compressed history allows maintaining context without exceeding token limits
  if (conversationSummary && conversationSummary.trim().length > 0) {
    prompt += `### CONVERSATION SUMMARY
Here is a summary of the earlier conversation to maintain context:

${conversationSummary}

Build upon this context in your responses.

`;
  }

  // Add NLP insights if available
  // These insights help the AI understand user patterns and adapt responses
  if (nlpInsights) {
    const nlpSection = buildNLPInsightsSection(nlpInsights);
    if (nlpSection) {
      prompt += nlpSection;
    }
  }

  // Final instructions for the AI
  prompt += `## RESPONSE GUIDELINES
- Respond in the user's preferred language: ${language || 'English'}
- Use Markdown formatting for better readability
- For code examples, use proper syntax highlighting with triple backticks and language identifier
- Be helpful, accurate, and mindful of the context provided above
- If you don't know something, admit it rather than making up information

### Adaptive Response Guidelines
- Match your tone to the user's detected sentiment (empathetic for negative, enthusiastic for positive)
- Recognize user intent type (question vs command vs statement) and respond appropriately
- Reference entities and topics the user has mentioned to show contextual awareness`;

  return prompt;
}

/**
 * Builds the NLP Insights section of the system prompt
 * This injects client-side NLP analysis results into the AI's context
 *
 * @param {Object} nlpInsights - Aggregated NLP statistics from useNLP hook
 * @returns {string} Formatted NLP insights section or empty string
 */
function buildNLPInsightsSection(nlpInsights) {
  if (!nlpInsights) return '';

  const sections = [];

  // Add overall sentiment insight
  if (nlpInsights.overallSentiment && nlpInsights.overallSentiment !== 'No data') {
    sections.push(`- **Overall User Sentiment**: ${nlpInsights.overallSentiment} (avg score: ${nlpInsights.avgSentimentScore})`);
  }

  // Add dominant intent pattern
  if (nlpInsights.dominantIntent) {
    sections.push(`- **Primary User Intent Pattern**: ${nlpInsights.dominantIntent}`);
  }

  // Add key entities detected across conversation
  const allEntities = [
    ...nlpInsights.entities.people,
    ...nlpInsights.entities.places,
    ...nlpInsights.entities.organizations
  ];
  if (allEntities.length > 0) {
    sections.push(`- **Key Entities Mentioned**: ${allEntities.slice(0, 10).join(', ')}`);
  }

  // Add top topics
  if (nlpInsights.entities.topics.length > 0) {
    sections.push(`- **Main Topics**: ${nlpInsights.entities.topics.slice(0, 8).join(', ')}`);
  }

  if (sections.length === 0) return '';

  return `
### NLP ANALYSIS INSIGHTS
The following patterns have been detected from user messages through client-side NLP analysis:

${sections.join('\n')}

Use these insights to tailor your responses appropriately.

`;
}
