// controllers/portfolioController.js
const Transaction = require('../models/BuySellModel');
const User = require('../models/User'); // Assuming you have a User model
const axios = require('axios');
const Portfolio=require("../models/Portfolio");
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Buy a stock
exports.buyStock = async (req, res) => {
  const { symbol, quantity = 1, price, takeProfit, stopLoss } = req.body;
  const userId = req.user.id;
  
  if (!symbol || !price) {
    return res.status(400).json({ error: 'Symbol and price are required' });
  }
  
  try {
    // Verify the stock exists
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    const quote = response.data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    // Fetch company info
    const overviewResponse = await axios.get(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    );
    const companyName = overviewResponse.data.Name || symbol;

    // Calculate total cost
    const totalAmount = price * quantity;

    // ✅ STEP 1: Create the transaction record
    const transaction = new Transaction({
      userId,
      symbol,
      companyName,
      type: 'BUY',
      quantity,
      price,
      totalAmount,
      takeProfit,
      stopLoss,
      status: 'COMPLETED',
      transactionDate: new Date()
    });
    await transaction.save();

    // ✅ STEP 2: Update or create portfolio record
    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = new Portfolio({
        userId,
        name: 'Default Portfolio',
        stocks: []
      });
    }

    const existingStock = portfolio.stocks.find(s => s.symbol === symbol);
    if (existingStock) {
      // Update existing stock entry
      const newShares = existingStock.shares + quantity;
      const newAvgPrice = ((existingStock.purchasePrice * existingStock.shares) + (price * quantity)) / newShares;
      existingStock.shares = newShares;
      existingStock.purchasePrice = newAvgPrice;
    } else {
      // Add new stock to portfolio
      portfolio.stocks.push({
        symbol,
        shares: quantity,
        purchasePrice: price
      });
    }

    await portfolio.save();

    res.status(201).json({
      message: 'Stock purchased successfully',
      transaction,
      portfolio
    });
  } catch (error) {
    console.error('Buy stock error:', error.message);
    res.status(500).json({ error: 'Failed to buy stock' });
  }
};


// Sell a stock
// SELL STOCK
exports.sellStock = async (req, res) => {
  try {
    let { symbol, quantity, price } = req.body;

    // Fix: normalize data
    symbol = symbol.toUpperCase();
    quantity = Number(quantity);
    price = Number(price);

    if (!symbol || !quantity || !price) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    if (!portfolio) return res.status(404).json({ msg: "Portfolio not found" });

    const holding = portfolio.stocks.find(s => s.symbol === symbol);
    if (!holding) return res.status(400).json({ msg: "Stock not found in portfolio" });

    if (holding.quantity < quantity) {
      return res.status(400).json({ msg: "Not enough shares to sell" });
    }

    // Subtract quantity from holding
    holding.quantity -= quantity;

    // If everything sold → remove stock
    if (holding.quantity === 0) {
      portfolio.stocks = portfolio.stocks.filter(s => s.symbol !== symbol);
    }

    // Update values
    holding.currentValue = holding.quantity * holding.avgBuyPrice;

    await portfolio.save();

    return res.json({
      msg: "Stock sold successfully",
      portfolio
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
// Get user portfolio
exports.getPortfolio = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Get all buy transactions
    const buyTransactions = await Transaction.find({ 
      userId, 
      type: 'BUY',
      status: 'COMPLETED'
    });
    
    // Get all sell transactions
    const sellTransactions = await Transaction.find({ 
      userId, 
      type: 'SELL',
      status: 'COMPLETED'
    });
    
    // Calculate current holdings
    const portfolio = {};
    
    // Add buy transactions
    buyTransactions.forEach(transaction => {
      if (!portfolio[transaction.symbol]) {
        portfolio[transaction.symbol] = {
          symbol: transaction.symbol,
          companyName: transaction.companyName,
          quantity: 0,
          avgBuyPrice: 0,
          totalInvestment: 0,
          currentValue: 0,
          profitLoss: 0,
          profitLossPercentage: 0
        };
      }
      
      portfolio[transaction.symbol].quantity += transaction.quantity;
      portfolio[transaction.symbol].totalInvestment += transaction.totalAmount;
    });
    
    // Subtract sell transactions
    sellTransactions.forEach(transaction => {
      if (portfolio[transaction.symbol]) {
        portfolio[transaction.symbol].quantity -= transaction.quantity;
        // We don't subtract from totalInvestment because that's the cost basis
      }
    });
    
    // Calculate average buy price for each stock
    Object.keys(portfolio).forEach(symbol => {
      if (portfolio[symbol].quantity > 0) {
        portfolio[symbol].avgBuyPrice = portfolio[symbol].totalInvestment / portfolio[symbol].quantity;
      }
    });
    
    // Remove stocks with zero quantity
    Object.keys(portfolio).forEach(symbol => {
      if (portfolio[symbol].quantity <= 0) {
        delete portfolio[symbol];
      }
    });
    
    // Get current prices for each stock
    const portfolioList = Object.values(portfolio);
    if (portfolioList.length > 0) {
      await Promise.all(
        portfolioList.map(async (stock) => {
          try {
            const response = await axios.get(
              `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${API_KEY}`
            );
            
            const quote = response.data['Global Quote'];
            if (quote && Object.keys(quote).length > 0) {
              const currentPrice = parseFloat(quote['05. price']);
              stock.currentPrice = currentPrice;
              stock.currentValue = currentPrice * stock.quantity;
              stock.profitLoss = stock.currentValue - stock.totalInvestment;
              stock.profitLossPercentage = (stock.profitLoss / stock.totalInvestment) * 100;
            }
          } catch (err) {
            console.error(`Error fetching current price for ${stock.symbol}:`, err.message);
          }
        })
      );
    }
    
    // Calculate total portfolio value
    const totalInvestment = portfolioList.reduce((total, stock) => total + stock.totalInvestment, 0);
    const totalCurrentValue = portfolioList.reduce((total, stock) => total + stock.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvestment;
    const totalProfitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;
    
    res.json({
      portfolio: portfolioList,
      summary: {
        totalInvestment,
        totalCurrentValue,
        totalProfitLoss,
        totalProfitLossPercentage
      }
    });
  } catch (error) {
    console.error('Get portfolio error:', error.message);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const transactions = await Transaction.find({ userId })
      .sort({ transactionDate: -1 })
      .lean();
    
    res.json(transactions);
  } catch (error) {
    console.error('Get transaction history error:', error.message);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
};