import React, { useState, useEffect, useRef } from 'react';
  import ChatMessage from './ChatMessage';
  import ChatInput from './ChatInput';
  import AgentSelector from './AgentSelector';

  const ChatInterface = ({ isOpen, onClose, agents, selectedAgent }) => {
    const [messages, setMessages] = useState([]);
    const [currentAgent, setCurrentAgent] = useState(selectedAgent);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    useEffect(() => {
      if (currentAgent) {
        loadAgentMessages();
      }
    }, [currentAgent]);

    const loadAgentMessages = () => {
      const mockMessages = [
        {
          id: 1,
          sender: currentAgent?.name,
          content: `Hello! I'm ${currentAgent?.name}, your ${currentAgent?.role}. How can I assist you today?`,
          timestamp: new Date(Date.now() - 3600000),
          isAgent: true
        },
        {
          id: 2,
          sender: 'You',
          content: 'Can you help me with the dashboard implementation?',
          timestamp: new Date(Date.now() - 1800000),
          isAgent: false
        },
        {
          id: 3,
          sender: currentAgent?.name,
          content: `Of course! I'd be happy to help with the dashboard. I see we need to implement real-time data updates and responsive design. Let me break down the tasks:

1. Set up WebSocket connections
2. Create responsive grid layouts
3. Implement data visualization components
4. Add performance monitoring

Which aspect would you like to tackle first?`,
          timestamp: new Date(Date.now() - 900000),
          isAgent: true
        },
        {
          id: 4,
          sender: 'You',
          content: 'Let\'s start with the WebSocket connections for real-time updates.',
          timestamp: new Date(Date.now() - 600000),
          isAgent: false
        },
        {
          id: 5,
          sender: currentAgent?.name,
          content: `Great choice! I'll help you set up WebSocket connections. I'm ${currentAgent?.name}. How can I help you today?`,
          timestamp: new Date(Date.now() - 300000),
          isAgent: true
        }
      ];
      setMessages(mockMessages);
    };

    const handleSendMessage = (content) => {
      if (!content.trim() || !currentAgent) return;

      const userMessage = {
        id: Date.now(),
        sender: 'You',
        content,
        timestamp: new Date(),
        isAgent: false
      };

      setMessages(prev => [...prev, userMessage]);

      // Simulate agent response
      setTimeout(() => {
        const agentResponse = {
          id: Date.now() + 1,
          sender: currentAgent.name,
          content: generateAgentResponse(currentAgent, content),
          timestamp: new Date(),
          isAgent: true
        };
        setMessages(prev => [...prev, agentResponse]);
      }, 1000);
    };

    const generateAgentResponse = (agent, userMessage) => {
      const responses = {
        'Marcus': [
          "I'll coordinate that with the team right away.",
          "Let me check the project status and get back to you.",
          "I'll assign the right agents to handle this task.",
          "Good point. I'll update the project timeline accordingly."
        ],
        'Cameron': [
          "I can architect a solution for that.",
          "Let me design the technical implementation.",
          "That requires some database design. I'm on it!",
          "I'll create the backend structure for this feature."
        ],
        'Grace': [
          "I can create a beautiful interface for that!",
          "Let me design an engaging user experience.",
          "I'll make this feature visually stunning and intuitive.",
          "Perfect! I'll craft a responsive design for this."
        ],
        'Betty': [
          "I'll handle the backend implementation.",
          "Let me optimize the database for this feature.",
          "I can build the API endpoints you need.",
          "I'll ensure the backend is scalable and secure."
        ]
      };
      
      const agentResponses = responses[agent.name] || responses['Marcus'];
      return agentResponses[Math.floor(Math.random() * agentResponses.length)];
    };

    if (!isOpen) return null;

    return (
      <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            {currentAgent ? (
              <>
                <img 
                  src={currentAgent.avatar} 
                  alt={currentAgent.name}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
                />
                <div>
                  <h3 className="font-semibold text-slate-900">{currentAgent.name}</h3>
                  <p className="text-xs text-slate-600">{currentAgent.role}</p>
                </div>
              </>
            ) : (
              <div>
                <h3 className="font-semibold text-slate-900">Select an Agent</h3>
                <p className="text-xs text-slate-600">Choose an agent to chat with</p>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Agent Selector */}
        <AgentSelector 
          agents={agents}
          currentAgent={currentAgent}
          onSelectAgent={setCurrentAgent}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentAgent ? (
            <>
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} currentAgent={currentAgent} />
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              Select an agent to start chatting
            </div>
          )}
        </div>

        {/* Input Area */}
        {currentAgent && (
          <ChatInput onSendMessage={handleSendMessage} />
        )}
      </div>
    );
  };

  export default ChatInterface;