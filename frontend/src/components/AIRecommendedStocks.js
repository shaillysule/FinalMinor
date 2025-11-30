// src/components/AIRecommendedStocks.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const AIRecommendedStocks = () => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // ✅ Mock data for now — replace with API call later
    const mockRecommendations = [
      {
        symbol: "AAPL",
        predictedChange: 2.4,
        sentiment: "Bullish",
        reason: "Strong earnings and AI growth potential.",
      },
      {
        symbol: "TSLA",
        predictedChange: -1.2,
        sentiment: "Bearish",
        reason: "Short-term volatility after production slowdown.",
      },
      {
        symbol: "MSFT",
        predictedChange: 3.1,
        sentiment: "Bullish",
        reason: "Cloud expansion driving revenue momentum.",
      },
    ];
    setRecommendations(mockRecommendations);
  }, []);

  return (
    <section className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        🤖 AI Recommended Stocks
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((stock, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            className={`p-4 rounded-lg shadow-md border-l-4 ${
              stock.predictedChange >= 0 ? "border-green-500" : "border-red-500"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">{stock.symbol}</h3>
              <p
                className={`font-semibold ${
                  stock.predictedChange >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {stock.predictedChange >= 0 ? "▲" : "▼"}{" "}
                {stock.predictedChange}%
              </p>
            </div>
            <p
              className={`text-sm font-medium ${
                stock.sentiment === "Bullish"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stock.sentiment} sentiment
            </p>
            <p className="text-sm text-gray-600 mt-2">{stock.reason}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AIRecommendedStocks;
