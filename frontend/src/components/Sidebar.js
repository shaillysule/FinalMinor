// src/components/Sidebar.js
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Sidebar = ({ isSidebarOpen, onToggle, userRole, onLogout }) => {
  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: isSidebarOpen ? 0 : -250 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-64 bg-white shadow-md fixed h-full z-50 flex text-black flex-col justify-between border-r border-gray-300"
      // className="w-64 bg-white shadow-md fixed h-full z-50 flex flex-col justify-between border-z"
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-600">NexgenStocks</h2>
        <nav className="mt-8 space-y-4">
          <Link to="/dashboard" className="block p-3 rounded-md hover:bg-gray-200">
            Dashboard
          </Link>
          <Link to="/portfolio" className="block p-3 rounded-md hover:bg-gray-200">
            Portfolio
          </Link>
          <Link to="/stocks" className="block p-3 rounded-md hover:bg-gray-200">
            Stocks
          </Link>
          <Link to="/chatbot" className="block p-3 rounded-md hover:bg-gray-200">
            Chatbot
          </Link>
          <Link to="/learning" className="block p-3 rounded-md hover:bg-gray-200">
            Learning
          </Link>

          {userRole === "admin" && (
            <div className="border-t border-gray-300 pt-4">
              <p className="text-sm font-semibold text-red-600 px-3 mb-2 flex items-center">
                <i className="fas fa-user-shield mr-2"></i> Admin Tools
              </p>
              <Link to="/admin" className="block p-2 pl-4 rounded-md text-red-600 hover:bg-red-100">
                Admin Panel
              </Link>
              <Link to="/admin/learning" className="block p-2 pl-4 rounded-md text-red-600 hover:bg-red-100">
                Manage Learning
              </Link>
            </div>
          )}
        </nav>
      </div>

      <div className="p-6">
        <button onClick={onLogout} className="w-full bg-red-500 text-white p-2 rounded-md">
          Logout
        </button>
      </div>
</motion.aside>  );
};

export default Sidebar;

