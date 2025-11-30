// src/components/StockAIChatbot.js
import React, { useState, useEffect, useRef } from 'react';
import './StockAIChatbot.css';
import Sidebar from './Sidebar';

const StockAIChatbot = () => {

  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your Stock AI Assistant. Ask me anything about stocks, market trends, or investments.",
      sender: "bot"
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const userRole = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot/stock', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input })
      });

      const data = await response.json();

      setMessages(prev => [...prev, { text: data.response, sender: "bot" }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        { text: "Sorry, something went wrong.", sender: "bot" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="stock-chatbot-container flex">

      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>

        {/* Header */}
        <div className="stock-chatbot-header bg-gray-800 text-white p-4 shadow-md">
          <h3 className="text-xl font-bold">Stock AI Assistant</h3>
        </div>

        {/* Messages */}
        <div className="stock-chatbot-messages p-4">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.text}
            </div>
          ))}

          {isLoading && (
            <div className="message bot">
              <div className="typing-indicator"><span></span><span></span><span></span></div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="stock-chatbot-input flex p-4 bg-gray-900">
          <input
            type="text"
            className="flex-1 p-3 rounded-l bg-gray-800 text-white focus:outline-none"
            placeholder="Ask anything…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="bg-green-600 px-6 rounded-r text-white font-bold"
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? "Thinking…" : "Send"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default StockAIChatbot;
