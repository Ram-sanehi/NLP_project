import { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import UserSetupModal from './components/UserSetupModal';
import { useOllama } from './hooks/useOllama';
import { useConversation } from './hooks/useConversation';
import { useNLP } from './hooks/useNLP';
import { extractFileText } from './utils/extractFileText';
import { analyzeMessageEnhanced } from './utils/nlpEngineEnhanced';

// Storage keys
const PROFILE_STORAGE_KEY = 'chatbot_user_profile';
const FILE_STORAGE_KEY = 'chatbot_uploaded_file';

function App() {
  // User profile state
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Show setup modal on first visit
  const [showSetup, setShowSetup] = useState(() => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    return !saved;
  });

  // App state
  const [mode, setMode] = useState('General');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [ollamaModel, setOllamaModel] = useState('llama3.2:latest');

  // Conversation hook - manages message history
  const {
    messages,
    conversationSummary,
    addUserMessage,
    addAssistantMessage,
    addErrorMessage,
    clearConversation,
    resetSummarization
  } = useConversation();

  // NLP hook - SEPARATE unit, only for sidebar display
  const {
    analyzeMessage,
    clearNLPState,
    nlpStats
  } = useNLP();

  // Ollama hook - handles AI interactions
  const {
    isLoading,
    error: ollamaError,
    sendMessage,
    clearChat
  } = useOllama(
    userProfile,
    mode,
    fileContent,
    conversationSummary,
    nlpStats,
    ollamaModel
  );

  // Ref to prevent double-sending
  const isSendingRef = useRef(false);

  // Load uploaded file info from localStorage on mount
  useEffect(() => {
    try {
      const savedFile = localStorage.getItem(FILE_STORAGE_KEY);
      if (savedFile) {
        const parsed = JSON.parse(savedFile);
        if (parsed.name) {
          setUploadedFile({ name: parsed.name, size: parsed.size, type: parsed.type });
          setFileContent(parsed.content || '');
        }
      }
    } catch (error) {
      console.error('Failed to load file info:', error);
    }
  }, []);

  // Listen for storage events (for profile edits)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (saved) {
          setUserProfile(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to reload profile:', e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save user profile
  const saveUserProfile = useCallback((profile) => {
    setUserProfile(profile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    setShowSetup(false);
  }, []);

  // Reset user profile
  const resetUserProfile = useCallback(() => {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    setUserProfile(null);
    setShowSetup(true);
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (file) => {
    try {
      const text = await extractFileText(file);
      setUploadedFile(file);
      setFileContent(text);

      localStorage.setItem(FILE_STORAGE_KEY, JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
        content: text.slice(0, 3000)
      }));
    } catch (error) {
      console.error('File upload error:', error);
      addErrorMessage(`Failed to process file: ${error.message}`);
    }
  }, [addErrorMessage]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    // Prevent double-sending
    if (isSendingRef.current || isLoading) {
      console.log('Already sending...');
      return;
    }

    isSendingRef.current = true;
    const timestamp = Date.now();

    console.log('=== SENDING MESSAGE ===');
    console.log('Content:', content);

    // STEP 1: Run NLP analysis first to get results for display
    let nlpResult = null;
    try {
      nlpResult = analyzeMessageEnhanced(content);
      console.log('NLP analysis result:', nlpResult);
    } catch (nlpErr) {
      console.error('NLP analysis failed (non-critical):', nlpErr);
    }

    // STEP 2: Add user message to chat with NLP result attached
    addUserMessage(content, nlpResult);

    // STEP 3: Send to Ollama for response
    try {
      console.log('Calling Ollama API...');
      const response = await sendMessage(content);
      console.log('Ollama response received:', response ? 'YES' : 'NO');

      if (response) {
        addAssistantMessage(response);
        console.log('Assistant message added to chat');
      } else {
        console.warn('No response from Ollama');
      }
    } catch (err) {
      console.error('Ollama error:', err);
      addErrorMessage(`Failed to get response: ${err.message}`);
    } finally {
      isSendingRef.current = false;
    }
  }, [addUserMessage, addAssistantMessage, addErrorMessage, sendMessage, analyzeMessage, isLoading]);

  // Handle new chat
  const handleNewChat = useCallback(() => {
    clearConversation();
    clearChat();
    resetSummarization();
    clearNLPState();
    setUploadedFile(null);
    setFileContent('');
    localStorage.removeItem(FILE_STORAGE_KEY);
    isSendingRef.current = false;
  }, [clearConversation, clearChat, resetSummarization, clearNLPState]);

  // Handle mode change
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
  }, []);

  // Handle analyzing all content (messages + document)
  const handleAnalyzeAllContent = useCallback(() => {
    try {
      // Combine all user messages and document content
      const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
      const allContent = [...userMessages];

      // Add document content if available
      if (fileContent && fileContent.trim().length > 0) {
        allContent.unshift(`[Document: ${uploadedFile?.name || 'Uploaded File'}]\n${fileContent}`);
      }

      // Analyze combined content
      const combinedText = allContent.join('\n\n');
      if (combinedText.trim().length === 0) {
        return { error: 'No content to analyze' };
      }

      const nlpResult = analyzeMessageEnhanced(combinedText);
      return {
        ...nlpResult,
        hasDocument: !!uploadedFile,
        documentName: uploadedFile?.name,
        messageCount: userMessages.length
      };
    } catch (err) {
      console.error('Analysis failed:', err);
      return { error: err.message };
    }
  }, [messages, fileContent, uploadedFile, analyzeMessage]);

  // Handle setup completion
  const handleSetupComplete = useCallback((profile) => {
    saveUserProfile(profile);
  }, [saveUserProfile]);

  return (
    <div className="flex h-screen bg-chat-bg overflow-hidden">
      {/* Setup Modal */}
      {showSetup && (
        <UserSetupModal onComplete={handleSetupComplete} />
      )}

      {/* Left Sidebar */}
      <Sidebar
        mode={mode}
        onModeChange={handleModeChange}
        userProfile={userProfile}
        uploadedFile={uploadedFile}
        onFileUpload={handleFileUpload}
        onNewChat={handleNewChat}
        onResetProfile={resetUserProfile}
        nlpStats={nlpStats}
        ollamaModel={ollamaModel}
        onModelChange={setOllamaModel}
        messages={messages}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          ollamaError={ollamaError}
          onAnalyzeAllContent={handleAnalyzeAllContent}
          uploadedFile={uploadedFile}
          fileContent={fileContent}
        />
        <InputBar onSend={handleSendMessage} disabled={isLoading} />
      </main>
    </div>
  );
}

export default App;
