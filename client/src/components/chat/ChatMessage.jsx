import React from 'react';

  const ChatMessage = ({ message, currentAgent }) => {
    const isAgent = message.isAgent;

    return (
      <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
        <div className={`max-w-[80%] ${isAgent ? 'order-2' : 'order-1'}`}>
          <div className={`px-4 py-2 rounded-lg ${
            isAgent 
              ? 'bg-slate-100 text-slate-900' 
              : 'bg-slate-900 text-white'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className={`text-xs text-slate-500 mt-1 ${isAgent ? 'text-left' : 'text-right'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {isAgent && (
          <img 
            src={currentAgent.avatar} 
            alt={currentAgent.name}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 order-1 mr-2"
          />
        )}
      </div>
    );
  };

  export default ChatMessage;