import React from 'react';

  const MobileNavigation = ({ activeView, onNavigate }) => {
    const navigation = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'agents', label: 'Agents', icon: '🤖' },
      { id: 'projects', label: 'Projects', icon: '📁' },
      { id: 'tasks', label: 'Tasks', icon: '✅' },
    ];

    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200">
        <div className="grid grid-cols-4">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
                activeView === item.id
                  ? 'text-slate-900'
                  : 'text-slate-600'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    );
  };

  export default MobileNavigation;