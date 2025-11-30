// src/components/MarketNews.js
import React from "react";
import { motion } from "framer-motion";

const MarketNews = ({ news }) => {
  if (!news || news.length === 0) {
    return (
      <section className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">📰 Market News</h2>
        <p className="text-gray-500">No news available right now.</p>
      </section>
    );
  }

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">📰 Market News</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((article, i) => (
          <motion.a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            className="bg-white p-4 rounded-lg block shadow-md hover:bg-gray-200 transition"
          >
            <h3 className="text-lg font-bold">{article.title}</h3>
            <p className="text-sm text-gray-600">{article.source?.name}</p>
            <p className="text-sm text-gray-700 mt-2">{article.description}</p>
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default MarketNews;
