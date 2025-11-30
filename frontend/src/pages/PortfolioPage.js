import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import BuySellModal from '../stock/BuySellModel';
import Sidebar  from '../components/Sidebar';
const Portfolio = () => {

  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [portfolioData, setPortfolioData] = useState([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

  // SELL MODAL STATES
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          navigate('/');
          return;
        }

        const res = await api.getPortfolio();
        console.log('Portfolio API Response:', res.data);

        if (res.data.portfolio && res.data.portfolio.length > 0) {
          setPortfolioData(res.data.portfolio);
          setTotalPortfolioValue(res.data.summary?.totalCurrentValue || 0);
        } else {
          setPortfolioData([]);
          setTotalPortfolioValue(0);
        }
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setPortfolioData([]);
        setTotalPortfolioValue(0);

        if (err.response?.status === 401) {
          alert('Session expired. Please login again.');
          navigate('/');
        }
      }
    };

    fetchPortfolio();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };
const userRole = localStorage.getItem("role");

  const getRecommendations = () => {
    if (totalPortfolioValue < 10000) {
      return 'Consider investing in higher-growth stocks like Amazon (AMZN) or Nvidia (NVDA).';
    } else {
      return 'Your portfolio is strong! Diversify with international stocks like Alibaba (BABA) or Tesla (TSLA).';
    }
  };

  const aiAnalysis = totalPortfolioValue > 10000 ? 'Strong' : 'Moderate';

  const handleExecuteTrade = () => {
    navigate('/stocks');
  };

  // SELL API FUNCTION
  const handleSellStock = async (sellData) => {
    try {
      await api.sellStock(sellData);
      alert(`Successfully sold ${sellData.quantity} shares of ${sellData.symbol}`);

      setShowSellModal(false);

      const res = await api.getPortfolio();
      setPortfolioData(res.data.portfolio);
      setTotalPortfolioValue(res.data.summary.totalCurrentValue);

    } catch (err) {
      console.error("Sell error:", err);
      alert("Failed to sell stock");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">

      {/* Sidebar */}
  
    <Sidebar isSidebarOpen={isSidebarOpen} onToggle={()=>setIsSidebarOpen(!isSidebarOpen)}
    userRole={userRole}onLogout={handleLogout}/>

      {/* Main Content */}
      <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex justify-between items-center"
        >
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <span className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-gray-700 p-2 rounded hover:bg-gray-600"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >

          {/* Portfolio Summary */}
          <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Portfolio Summary</h2>

            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-400">Total Portfolio Value</p>
              <p className="text-2xl font-bold">₹{totalPortfolioValue.toFixed(2)}</p>
              <button
                onClick={handleExecuteTrade}
                className="w-full bg-green-500 p-2 rounded hover:bg-green-600 transition mt-4"
              >
                Execute Trade
              </button>
              <p className="text-sm text-gray-400 mt-4">Performance Analysis (AI):</p>
              <p className={`text-xl font-bold ${aiAnalysis === 'Strong' ? 'text-green-500' : 'text-yellow-500'}`}>
                {aiAnalysis}
              </p>
              <p className="text-sm text-gray-400 mt-4">Recommendations:</p>
              <p className="text-lg font-semibold text-blue-300">{getRecommendations()}</p>
            </div>

            {/* Portfolio Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3">Symbol</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Avg Buy Price</th>
                    <th className="p-3">Current Price</th>
                    <th className="p-3">Total Value</th>
                    <th className="p-3">Profit/Loss</th>
                    <th className="p-3">P/L %</th>
                    <th className="p-3">Sell</th>
                  </tr>
                </thead>

                <tbody>
                  {portfolioData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-6 text-center text-gray-400">
                        No stocks in portfolio. Buy some stocks to get started! 🚀
                      </td>
                    </tr>
                  ) : (
                    portfolioData.map((stock, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-t border-gray-700 hover:bg-gray-600"
                      >
                        <td className="p-3 font-bold">{stock.symbol}</td>
                        <td className="p-3">{stock.companyName || stock.symbol}</td>
                        <td className="p-3">{stock.quantity}</td>
                        <td className="p-3">₹{stock.avgBuyPrice?.toFixed(2)}</td>
                        <td className="p-3">₹{stock.currentPrice?.toFixed(2) || 'Loading...'}</td>
                        <td className="p-3">₹{stock.currentValue?.toFixed(2) || '0.00'}</td>
                        <td className={`p-3 font-bold ${(stock.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ₹{stock.profitLoss?.toFixed(2) || '0.00'}
                        </td>
                        <td className={`p-3 font-bold ${(stock.profitLossPercentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.profitLossPercentage?.toFixed(2) || '0.00'}%
                        </td>

                        {/* SELL BUTTON */}
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedStock(stock);
                              setShowSellModal(true);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg"
                          >
                            Sell
                          </button>
                        </td>

                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </motion.div>
      </main>

      {/* SELL MODAL */}
      {showSellModal && selectedStock && (
        <BuySellModal
          isOpen={showSellModal}
          onClose={() => setShowSellModal(false)}
          stock={{
            symbol: selectedStock.symbol,
            latestPrice: selectedStock.currentPrice
          }}
          onBuy={handleSellStock}
          type="sell"
        />
      )}

    </div>
  );
};

export default Portfolio;
