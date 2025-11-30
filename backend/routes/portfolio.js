// routes/portfolio.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const portfolioController = require('../controllers/portfolioController');

// BUY
router.post('/buy', auth, portfolioController.buyStock);

// SELL
router.post('/sell', auth, portfolioController.sellStock);

// GET PORTFOLIO (summary + stocks)
router.get('/', auth, portfolioController.getPortfolio);

// GET TRANSACTION HISTORY
router.get('/transactions', auth, portfolioController.getTransactionHistory);

module.exports = router;
