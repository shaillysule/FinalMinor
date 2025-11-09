import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BuySellModal = ({ 
  isOpen, 
  onClose, 
  stock, 
  onBuy, 
  type = 'buy' 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !stock) return null;

  const price = parseFloat(stock.latestPrice) || 0;
  const totalCost = (price * quantity).toFixed(2);

  const handleSubmit = async () => {
    // Validation
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (takeProfit && parseFloat(takeProfit) <= price) {
      setError('Take Profit must be higher than current price');
      return;
    }

    if (stopLoss && parseFloat(stopLoss) >= price) {
      setError('Stop Loss must be lower than current price');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onBuy({
        symbol: stock.symbol,
        quantity: parseInt(quantity),
        price: price,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        totalCost: parseFloat(totalCost)
      });
      
      // Reset
      setQuantity(1);
      setTakeProfit('');
      setStopLoss('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to complete transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {type === 'buy' ? '🛒 Buy' : '💰 Sell'} {stock.symbol}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stock Info */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Current Price</p>
                  <p className="text-2xl font-bold text-white">₹{price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Change</p>
                  <p className={`text-lg font-semibold ${
                    parseFloat(stock.changePercent) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stock.changePercent}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Quantity */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded-lg transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 bg-gray-800 text-white text-center rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded-lg transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Take Profit (Optional) */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Take Profit (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder={`e.g., ₹${(price * 1.05).toFixed(2)}`}
                  className="w-full bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Auto-sell when price reaches this level
                </p>
              </div>

              {/* Stop Loss (Optional) */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Stop Loss (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder={`e.g., ₹${(price * 0.95).toFixed(2)}`}
                  className="w-full bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Auto-sell to limit losses
                </p>
              </div>

              {/* Total Cost */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Cost</span>
                  <span className="text-2xl font-bold text-white">₹{totalCost}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `${type === 'buy' ? 'Buy' : 'Sell'} ${quantity} Share${quantity > 1 ? 's' : ''} for ₹${totalCost}`
                )}
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              This is a simulated trading environment. No real money is involved.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BuySellModal;