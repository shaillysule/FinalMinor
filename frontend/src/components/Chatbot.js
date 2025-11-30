
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! I'm your NexgenStocks AI Assistant. I can help you with:\n\n💰 Stock recommendations\n📊 Market analysis\n📈 Investment strategies\n🔍 Stock comparisons\n\nWhat would you like to know?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "💰 Recommend stocks for $5000",
    "📊 Show market sentiment",
    "🔍 Compare AAPL vs TSLA",
    "📈 Best stocks for beginners",
    "⚡ Stock price of GOOGL"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractStockData = (text) => {
    // Extract stock symbols and prices from response
    const stockPattern = /([A-Z]{2,5}).*?\$?([\d,]+\.?\d*)/g;
    const matches = [...text.matchAll(stockPattern)];
    
    if (matches.length > 0) {
      return matches.slice(0, 3).map(match => ({
        symbol: match[1],
        price: match[2]
      }));
    }
    return null;
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = { 
      sender: "user", 
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setShowSuggestions(false);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://nexgenstocksbackend.onrender.com/api/chatbot/stock",
        {
          query: messageText,
          conversationHistory: messages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const stockData = extractStockData(res.data.response);

      const botMessage = {
        sender: "bot",
        text: res.data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stockData: stockData
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        sender: "bot",
        text: "⚠️ " + (err.response?.data?.error || "Something went wrong. Please try again later."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "bot",
        text: "👋 Chat cleared! How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setShowSuggestions(true);
  };

  const StockCard = ({ symbol, price }) => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 mt-2 inline-block"
    >
      <div className="flex items-center gap-3">
        <div className="bg-green-500/20 p-2 rounded">
          <span className="text-2xl">📊</span>
        </div>
        <div>
          <p className="text-green-400 font-bold text-lg">{symbol}</p>
          <p className="text-white text-sm">${price}</p>
        </div>
      </div>
    </motion.div>
  );

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl max-w-[100px]"
    >
      <div className="flex gap-1">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
          className="w-2 h-2 bg-green-400 rounded-full"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
          className="w-2 h-2 bg-green-400 rounded-full"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
          className="w-2 h-2 bg-green-400 rounded-full"
        />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col w-full max-w-4xl h-[85vh] bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-slate-700/50 p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">NexgenStocks AI</h2>
              <p className="text-xs text-gray-400">Your Personal Investment Assistant</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearChat}
              className="bg-slate-800/50 hover:bg-slate-700/50 p-2 rounded-lg transition-colors"
              title="Clear Chat"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-900/80">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.sender === "user" 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}>
                    <span className="text-white text-sm font-bold">
                      {msg.sender === "user" ? "👤" : "🤖"}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className="flex flex-col">
                    <div className={`p-4 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-tr-none"
                        : "bg-slate-800/50 backdrop-blur-sm text-white border border-slate-700/50 rounded-tl-none"
                    }`}>
                      <p className="whitespace-pre-line text-sm leading-relaxed">{msg.text}</p>
                      
                      {/* Stock Cards */}
                      {msg.stockData && msg.stockData.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {msg.stockData.map((stock, idx) => (
                            <StockCard key={idx} symbol={stock.symbol} price={stock.price} />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Message Footer */}
                    <div className={`flex items-center gap-2 mt-1 px-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                      {msg.sender === "bot" && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(msg.text)}
                          className="text-gray-500 hover:text-green-400 transition-colors"
                          title="Copy"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {loading && <TypingIndicator />}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {showSuggestions && messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 pb-4"
          >
            <p className="text-sm text-gray-400 mb-3">💡 Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage(question)}
                  className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 px-4 py-2 rounded-xl text-sm text-gray-300 transition-all"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input Area */}
        <div className="border-t border-slate-700/50 p-4 bg-slate-900/50 backdrop-blur-xl">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                placeholder="Ask about stocks, portfolios, or strategies..."
                disabled={loading}
                className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 rounded-2xl text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </motion.button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI-powered responses • Not financial advice
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Chatbot;