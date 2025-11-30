// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import MarketNews from "../components/MarketNews";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";
import AIRecommendedStocks from "../components/AIRecommendedStocks";
import TrendingStocks from "../components/TrendingStocks";
import { getTrendingStocks } from "../services/stockService";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import RealTimeStockChart from "../components/RealTimeStockChart";
import Chatbot from "../components/Chatbot";
import QuickStats from "../components/QuickStats";
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [news, setNews] = useState([]);
  const [userRole, setUserRole] = useState("user");
  const [mockWatchlist, setMockWatchlist] = useState([]);
  const [stockData, setStockData] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [trendingError, setTrendingError] = useState(null);
const [trendingLoading, setTrendingLoading] = useState(false);
const [selectedStock, setSelectedStock] = useState("AAPL");

  // ✅ Sidebar toggle
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  
useEffect(() => {
  const fetchSubscription = async () => {
    try {
      // keep your subscription logic (mock or real)
      setIsSubscribed(true);
    } catch (error) {
      console.error('subscription check failed:', error);
    }
  };

  // fetch trending stocks from API
  const fetchTrending = async () => {
    setTrendingLoading(true);
    setTrendingError(null);
    try {
      const stocks = await getTrendingStocks();
      // optional: map/normalize each item to { symbol, change, price }
      const normalized = stocks.map((s) => {
        // support a few possible shapes
        return {
          symbol: s.symbol || s.ticker || s.code || s.name?.toUpperCase(),
          change: parseFloat(s.changePercent ?? s.change ?? 0),
          price: parseFloat(s.latestPrice ?? s.price ?? s.last ?? 0),
          ...s,
        };
      });
      setTrendingStocks(normalized);
      console.log("Fetched trending stocks:", normalized);
    } catch (err) {
      console.error("Failed to fetch trending stocks:", err);
      setTrendingError(err.message || "Failed to load trending stocks");
      // fallback to mock so UI still shows something
      setTrendingStocks([
        { symbol: "AAPL", change: 1.5, price: 189.34 },
        { symbol: "GOOG", change: -0.7, price: 2823.54 },
        { symbol: "TSLA", change: 2.3, price: 765.23 },
      ]);
    } finally {
      setTrendingLoading(false);
    }
  };

  fetchSubscription();
  fetchTrending();

  // (existing code in this effect like setNews, setMockWatchlist, setStockData, etc.)
}, []);
  // ✅ Fetch live business news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const apiKey = process.env.REACT_APP_NEWS_API_KEY;
      const res = await fetch(
  `https://newsapi.org/v2/everything?q=stocks%20OR%20stock%20market%20OR%20investing%20OR%20NASDAQ%20OR%20S&P%20500%20OR%20Dow%20Jones%20OR%20trading&language=en&domains=marketwatch.com,bloomberg.com,reuters.com,finance.yahoo.com,cnbc.com&sortBy=publishedAt&apiKey=${apiKey}`
);

        const data = await res.json();

   if (data.articles && data.articles.length > 0) {
  const filtered = data.articles.filter(article => {
    const text = `${article.title} ${article.description}`.toLowerCase();
    return (
      text.includes("stock") ||
      text.includes("market") ||
      text.includes("nasdaq") ||
      text.includes("dow jones") ||
      text.includes("s&p") ||
      text.includes("invest")
    );
  });

  setNews(filtered.slice(0, 6));
} else {
  setNews([]);
}


      } catch (err) {
        console.error("Error fetching news:", err);
        setNews([]);
      }
    };
    fetchNews();
  }, []);

  // ✅ Watchlist mock data
  useEffect(() => {
    setMockWatchlist([
      { symbol: "NFLX", price: 356.89 },
      { symbol: "MSFT", price: 234.12 },
    ]);
  }, []);

  // ✅ Weekly Overview chart data
  useEffect(() => {
    setStockData({
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      datasets: [
        {
          label: "AAPL",
          data: [180, 182, 185, 183, 189],
          borderColor: "rgb(75, 192, 192)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "TSLA",
          data: [710, 730, 725, 740, 765],
          borderColor: "rgb(255, 99, 132)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "AMZN",
          data: [3100, 3120, 3150, 3130, 3180],
          borderColor: "rgb(153, 102, 255)",
          tension: 0.4,
          fill: false,
        },
      ],
    });
  }, []);

  // ✅ Chatbot toggle
  const handleChatbotToggle = () => {
    if (!isSubscribed) {
      alert("Please subscribe to access the AI chatbot.");
      return;
    }
    setShowChatbot(!showChatbot);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex">
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        userRole={userRole}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main
        className={`flex-1 p-6 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center"
        >
          <div className="flex items-center space-x-4">
          <motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={toggleSidebar}
  className="text-gray-800 text-2xl"
>
  ☰

            </motion.button>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </motion.header>

        {/* Dashboard Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* <TrendingStocks stocks={trendingStocks} /> */}
          {trendingLoading ? (
  <div className="p-4">Loading trending stocks...</div>
) : trendingError ? (
  <div className="p-4 text-red-500">Trending: {trendingError}</div>
) : (
  <TrendingStocks stocks={trendingStocks} />
)}

          <MarketNews news={news} />

          {/* Real-Time Chart */}
          <section className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">
              📈 AAPL Real-Time Stock Chart
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <RealTimeStockChart symbol="AAPL" />
            </div>
          </section>

          {/* Weekly Overview */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">
              📊 Weekly Overview
            </h2>
            <div className="bg-white p-4 rounded-lg">
              {stockData?.datasets?.[0]?.data ? (
                <Line
                  data={stockData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          color: "#333",
                          font: { size: 14 },
                        },
                      },
                      title: {
                        display: true,
                        text: "Weekly Stock Comparison",
                        color: "#333",
                        font: { size: 18 },
                      },
                    },
                    scales: {
                      x: { ticks: { color: "#333" }, grid: { display: false } },
                      y: { ticks: { color: "#333" }, grid: { color: "#ddd" } },
                    },
                  }}
                />
              ) : (
                <p className="text-gray-500">Loading chart data...</p>
              )}
            </div>
          </section>
          {/* <WeeklyOverview stockData={stockData}/> */}

          {/* Quick Stats */}
   
<QuickStats portfolioValue={12345.67} dailyChange={1.05} />

          {/* Watchlist */}
        <AIRecommendedStocks/>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
