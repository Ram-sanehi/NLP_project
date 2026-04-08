/**
 * Mode selector component with three mode options.
 * Allows switching between General, Study, and Support modes.
 *
 * @param {Object} props - Component props
 * @param {string} props.currentMode - Currently selected mode
 * @param {Function} props.onModeChange - Callback when mode changes
 */
export default function ModeSelector({ currentMode, onModeChange }) {
  const modes = [
    {
      id: 'General',
      label: 'General',
      description: 'Balanced assistant',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      id: 'Study',
      label: 'Study',
      description: 'Explains concepts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'green'
    },
    {
      id: 'Support',
      label: 'Support',
      description: 'Solution-focused',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'purple'
    }
  ];

  const colorClasses = {
    blue: {
      active: 'bg-blue-600 border-blue-500 text-white',
      inactive: 'border-gray-600 text-gray-400 hover:border-blue-500/50'
    },
    green: {
      active: 'bg-green-600 border-green-500 text-white',
      inactive: 'border-gray-600 text-gray-400 hover:border-green-500/50'
    },
    purple: {
      active: 'bg-purple-600 border-purple-500 text-white',
      inactive: 'border-gray-600 text-gray-400 hover:border-purple-500/50'
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Mode
      </h3>
      <div className="space-y-2">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          const colors = colorClasses[mode.color];

          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200
                       ${isActive ? colors.active : colors.inactive}`}
            >
              <span className={isActive ? 'text-white' : 'text-gray-400'}>
                {mode.icon}
              </span>
              <div className="text-left">
                <div className="text-sm font-medium">{mode.label}</div>
                <div className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                  {mode.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
