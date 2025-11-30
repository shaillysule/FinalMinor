// src/components/TrendingStocks.js
import React from "react";
import { motion } from "framer-motion";

const TrendingStocks = ({ stocks }) => {
  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        🔥 Trending Stocks
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {stocks.map((stock, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="p-5 rounded-lg bg-white shadow-md border-l-4 border-blue-500"
          >
            <div className="flex justify-between">
              <h3 className="text-lg font-bold">{stock.symbol}</h3>
              <p
                className={`font-semibold ${
                  stock.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {stock.change >= 0 ? "▲" : "▼"} {stock.change}%
              </p>
            </div>
            <p className="text-xl font-semibold">${stock.price.toFixed(2)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrendingStocks;
