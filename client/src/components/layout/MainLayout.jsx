import React, { useState } from 'react';
  import Header from './Header';
  import MobileSidebar from '../mobile/MobileSidebar';

  const MainLayout = ({ children, activeView, onNavigate }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'agents', label: 'Agents', icon: '🤖' },
      { id: 'projects', label: 'Projects', icon: '📁' },
      { id: 'tasks', label: 'Tasks', icon: '✅' },
    ];

    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-grow bg-slate-900 border-r border-slate-800 pt-16 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center px-4 py-4 text-lg font-medium rounded-lg transition-colors ${
                    activeView === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="mr-4 text-2xl">{item.icon}</span>
                  <span className="text-lg font-semibold">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          navigation={navigation}
          activeView={activeView}
          onNavigate={onNavigate}
        />

        {/* Mobile Menu Button - only visible on mobile */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-4 right-4 z-30 p-3 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Main Content */}
        <div className="lg:pl-64 pt-16">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    );
  };

  export default MainLayout;