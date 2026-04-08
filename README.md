# Context-Aware Chatbot with NLP (Ollama Edition)

A production-ready, full-featured chatbot web application with context awareness, multiple modes, file upload support, and client-side NLP analysis. Powered by **Ollama** for local LLM inference.

## Features

### 1. Context Awareness
- **Full conversation history**: Every API call includes the complete conversation history for multi-turn memory
- **User profile injection**: Name, role, and language are dynamically injected into the system prompt
- **Auto-summarization**: After every 10 messages, the conversation is summarized using Ollama
- **Dynamic system prompt**: Rebuilt on every mode change or profile update

### 2. Mode Switching
Three distinct modes that change the bot's behavior:
- **General Assistant**: Balanced, conversational responses for everyday queries
- **Study Helper**: Explains concepts in detail, provides examples, and can quiz the user
- **Support Agent**: Structured, empathetic, solution-focused responses for customer support scenarios

### 3. File Upload Context
- Upload `.txt` or `.pdf` files
- Text is extracted and injected into the system prompt
- Bot can answer questions about the uploaded document content
- Maximum 3000 characters from the file are used

### 4. First-Time Setup
- Modal on first load collects: Name, Role (Student/Professional/General), Preferred Language
- Preferences stored in localStorage
- Setup skipped on return visits

### 5. Client-Side NLP Pipeline
All NLP processing happens in the browser - no additional API calls needed:

#### Intent Detection
- **How it works**: Uses rule-based classification with the `compromise` library
- **Detects**: Question, Command, Greeting, Complaint, Gratitude, Statement
- **Display**: Purple badge on each user message

#### Sentiment Analysis
- **How it works**: AFINN-based lexicon via the `sentiment` npm package
- **Output**: Positive / Negative / Neutral with score
- **Display**: Color-coded badge on user messages

#### Named Entity Recognition (NER)
- **How it works**: Uses `compromise`'s built-in entity matchers
- **Extracts**: People, Places, Organizations, Topics
- **Display**: Amber tags below user messages; full list in sidebar

#### Keyword Extraction
- **How it works**: Uses `compromise` to extract top noun phrases
- **Output**: Top 3-5 keywords per message
- **Display**: Teal tags below user messages; top 10 by frequency in sidebar

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS (dark themed)
- **AI**: Ollama (local LLM) via REST API
- **NLP**: 
  - `compromise` - NER, intent detection, keyword extraction
  - `sentiment` - AFINN-based sentiment analysis
- **Markdown**: `react-markdown` for rich text rendering
- **Code Highlighting**: `react-syntax-highlighter`

## Setup Instructions

### 1. Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com/download

### 2. Pull a Model

```bash
ollama pull llama3.2
```

Other supported models: `llama3.1`, `mistral`, `gemma2`, `qwen2.5`, `phi3`

### 3. Start Ollama Server

```bash
ollama serve
```

### 4. Install Node Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 6. Build for Production

```bash
npm run build
```

## How Context Awareness Works

### System Prompt Construction

The system prompt is dynamically built from multiple sources:

1. **User Profile**: Name, role, and language preferences
2. **Mode Instructions**: Behavior guidelines for General/Study/Support modes
3. **Timestamp**: Current date and time for temporal context
4. **File Content**: Up to 3000 characters from uploaded documents
5. **Conversation Summary**: Auto-generated summary after 10+ messages
6. **NLP Insights**: Detected patterns including sentiment, intent, entities, topics

### Ollama Integration

The app communicates with Ollama's REST API at `http://localhost:11434`:

- **Chat Endpoint**: `/api/chat` for multi-turn conversations
- **Generate Endpoint**: `/api/generate` for summarization
- **Models**: Switchable via dropdown in sidebar

### NLP Injection Flow

```
User sends message
       ↓
NLP analysis runs (client-side, instant)
       ↓
Results stored on message object
       ↓
Aggregated stats updated (useNLP hook)
       ↓
System prompt rebuilt with NLP insights
       ↓
Message sent to Ollama with full context
       ↓
Ollama responds with context-aware answer
```

## File Structure

```
src/
  components/
    ChatWindow.jsx       # Main chat container
    MessageBubble.jsx    # Individual message with NLP badges
    InputBar.jsx         # Text input and send button
    Sidebar.jsx          # Left sidebar with controls + NLP panel
    UserSetupModal.jsx   # First-time setup modal
    ModeSelector.jsx     # Mode switching UI
    TypingIndicator.jsx  # Animated typing indicator
    NLPInsightsPanel.jsx # NLP stats display in sidebar
    ErrorBoundary.jsx    # Error handling
  hooks/
    useOllama.js         # Ollama API integration
    useConversation.js   # Conversation state management
    useNLP.js            # NLP state and analysis wrapper
  utils/
    buildSystemPrompt.js # System prompt construction with NLP
    extractFileText.js   # File text extraction
    summarizeHistory.js  # Conversation summarization via Ollama
    nlpEngine.js         # Core NLP functions
  App.jsx                # Main app component
  main.jsx               # Entry point
  index.css              # Global styles
```

## Adding More NLP Techniques

To add a new NLP technique:

1. **Add to `nlpEngine.js`**:
   ```js
   export function newTechnique(text) {
     return { result: 'data' };
   }
   ```

2. **Update `analyzeMessage()` in `nlpEngine.js`**:
   ```js
   export function analyzeMessage(text) {
     return {
       // ... existing
       newTechnique: newTechnique(text)
     };
   }
   ```

3. **Update `useNLP.js`** to include in `nlpStats`

4. **Update `MessageBubble.jsx`** to display as badge

5. **Update `NLPInsightsPanel.jsx`** for sidebar display

## NLP Libraries Used

### compromise
- Lightweight NLP library for browser
- Tokenization, POS tagging, NER
- Noun phrase extraction
- Website: https://github.com/spencermountain/compromise

### sentiment
- AFINN-based sentiment analysis
- Returns score and comparative values
- Handles negation and emphasis
- Website: https://github.com/thisandagain/sentiment

## Ollama Models

Recommended models:
- **llama3.2** - Fast, efficient, good for chat (default)
- **llama3.1** - More capable, larger context
- **mistral** - Good balance of speed and quality
- **gemma2** - Google's open model
- **qwen2.5** - Alibaba's model, good for code
- **phi3** - Microsoft's small but capable model

## Troubleshooting

### "Cannot connect to Ollama"
- Make sure Ollama is running: `ollama serve`
- Check if port 11434 is accessible

### "Model not found"
- Pull the model: `ollama pull llama3.2`
- Or select a different model from the dropdown

### Blank screen
- Open browser console (F12) and check for errors
- Clear localStorage: `localStorage.clear()` then reload

## License

MIT
