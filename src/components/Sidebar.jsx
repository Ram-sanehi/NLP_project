import { useState, useEffect, useCallback } from 'react';
import ModeSelector from './ModeSelector';
import NLPInsightsPanel from './NLPInsightsPanel';

/**
 * Left sidebar component containing mode selector, user profile, file upload, and NLP insights.
 */
export default function Sidebar({
  mode,
  onModeChange,
  userProfile,
  uploadedFile,
  onFileUpload,
  onNewChat,
  onResetProfile,
  nlpStats,
  ollamaModel,
  onModelChange,
  messages
}) {
  const [ollamaModels, setOllamaModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', language: 'English' });

  // Fetch available models from Ollama
  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
          const data = await response.json();
          const modelNames = data.models?.map(m => m.name) || [];
          setOllamaModels(modelNames);
          console.log('[Sidebar] Available models:', modelNames);
        }
      } catch (err) {
        console.warn('Could not fetch Ollama models:', err.message);
      }
      setModelsLoading(false);
    };

    fetchModels();
  }, []);

  // Update edit form when user profile changes
  useEffect(() => {
    if (userProfile) {
      setEditForm({
        name: userProfile.name || '',
        language: userProfile.language || 'English'
      });
    }
  }, [userProfile]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleSaveProfile = useCallback(() => {
    if (editForm.name.trim()) {
      const newProfile = {
        ...userProfile,
        name: editForm.name.trim(),
        language: editForm.language
      };
      localStorage.setItem('chatbot_user_profile', JSON.stringify(newProfile));
      window.dispatchEvent(new Event('storage'));
      setIsEditingProfile(false);
    }
  }, [editForm, userProfile]);

  return (
    <aside className="w-72 bg-chat-sidebar border-r border-chat-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-chat-border">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          Context Chat
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                   text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>

        {/* Mode Selector */}
        <ModeSelector currentMode={mode} onModeChange={onModeChange} />

        {/* User Profile Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Your Profile
            </h3>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Edit
            </button>
          </div>

          {isEditingProfile ? (
            <div className="bg-chat-input rounded-lg p-3 border border-chat-border space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-chat-bg border border-chat-border rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Language</label>
                <select
                  value={editForm.language}
                  onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                  className="w-full bg-chat-bg border border-chat-border rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditForm({ name: userProfile?.name || '', language: userProfile?.language || 'English' });
                    setIsEditingProfile(false);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs py-1.5 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-chat-input rounded-lg p-3 border border-chat-border">
              <div className="text-white font-medium">{userProfile?.name || 'Not set'}</div>
              <div className="text-sm text-gray-400">{userProfile?.role || 'Not set'}</div>
              <div className="text-xs text-gray-500 mt-1">
                Language: {userProfile?.language || 'English'}
              </div>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Document Context
          </h3>
          <label
            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed
                     border-chat-border rounded-lg cursor-pointer hover:border-blue-500/50
                     bg-chat-input transition-colors duration-200"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-xs text-gray-400">
                {uploadedFile ? uploadedFile.name : 'Upload .txt, .pdf or .docx'}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".txt,.pdf,.docx"
              onChange={handleFileChange}
            />
          </label>
          {uploadedFile && (
            <div className="text-xs text-green-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              File loaded ({uploadedFile.name})
            </div>
          )}
        </div>

        {/* Model Selector */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            AI Model
          </h3>
          <select
            value={ollamaModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full bg-chat-input border border-chat-border rounded-xl px-3 py-2
                     text-white text-sm focus:outline-none focus:border-blue-500
                     focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            {modelsLoading ? (
              <option disabled>Loading models...</option>
            ) : ollamaModels.length > 0 ? (
              ollamaModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))
            ) : (
              <>
                <option value="llama3.2">Llama 3.2</option>
                <option value="qwen2.5-coder:7b">Qwen 2.5 Coder</option>
              </>
            )}
          </select>
          {ollamaModels.length > 0 && (
            <p className="text-xs text-gray-500">
              {ollamaModels.length} model(s) available
            </p>
          )}
        </div>

        {/* NLP Insights Panel */}
        <div className="pt-2 border-t border-chat-border">
          <NLPInsightsPanel
            nlpStats={nlpStats}
            messages={messages}
            ollamaModel={ollamaModel}
            onAnalyzeAll={() => {
              // Trigger analysis from sidebar
              window.dispatchEvent(new CustomEvent('analyze-signal', {}));
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-chat-border">
        <p className="text-xs text-gray-500 text-center">
          Powered by Ollama + Local NLP
        </p>
      </div>
    </aside>
  );
}
