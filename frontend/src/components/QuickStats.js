// src/components/QuickStats.js
import React from "react";

const QuickStats = ({ portfolioValue, dailyChange }) => {
  return (
    <section className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">Quick Stats</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Portfolio Value</p>
          <p className="text-lg font-bold">${portfolioValue.toLocaleString()}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Daily Gain/Loss</p>
          <p
            className={`text-lg font-bold ${
              dailyChange >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {dailyChange >= 0 ? "+" : ""}
            {dailyChange.toFixed(2)}%
          </p>
        </div>
      </div>
    </section>
  );
};

export default QuickStats;
