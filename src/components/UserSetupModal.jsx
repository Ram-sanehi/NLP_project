import { useState } from 'react';

/**
 * First-time setup modal for collecting user profile information.
 * Shown on first visit, data stored in localStorage.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onComplete - Callback with user profile data
 */
export default function UserSetupModal({ onComplete }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('General');
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    onComplete({
      name: name.trim(),
      role,
      language
    });
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'it', name: 'Italiano' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
    { code: 'hi', name: 'हिन्दी' }
  ];

  const roles = [
    { id: 'Student', label: 'Student', description: 'Get help with learning and studying' },
    { id: 'Professional', label: 'Professional', description: 'Work-focused assistance' },
    { id: 'General', label: 'General', description: 'Balanced everyday use' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-chat-sidebar border border-chat-border rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-chat-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Welcome!</h2>
              <p className="text-sm text-gray-400">Let's set up your profile</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              What's your name?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-chat-input border border-chat-border rounded-xl px-4 py-3
                       text-white placeholder-gray-500 focus:outline-none focus:border-blue-500
                       focus:ring-1 focus:ring-blue-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Which best describes you?
            </label>
            <div className="space-y-2">
              {roles.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                           ${role === r.id
                             ? 'border-blue-500 bg-blue-600/10'
                             : 'border-chat-border bg-chat-input hover:border-gray-500'
                           }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.id}
                    checked={role === r.id}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{r.label}</div>
                    <div className="text-xs text-gray-400">{r.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Preferred language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-chat-input border border-chat-border rounded-xl px-4 py-3
                       text-white focus:outline-none focus:border-blue-500 focus:ring-1
                       focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium
                     py-3 px-4 rounded-xl transition-colors duration-200"
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}
