import React from 'react';

const Header = () => {
  return (
    <header className="bg-slate-950 border-b border-blue-900 px-6 py-4 fixed w-full top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">Agentic Command Central Dashboard</h1>
          <span className="px-4 py-2 text-base font-bold bg-gradient-to-r from-blue-500/30 to-yellow-400/30 text-white rounded-full border border-yellow-400/50">
            33 Agents Active
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right mr-4">
            <p className="text-base font-bold text-yellow-400">Magnificent Worldwide</p>
            <p className="text-sm font-medium text-gray-300">Founded by Kevin Gardner</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full flex items-center justify-center text-slate-900 font-black text-lg">
            MW
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;