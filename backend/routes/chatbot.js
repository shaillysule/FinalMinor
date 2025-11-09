// backend/routes/chatbot.js

const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middleware/auth');

// ✅ Route: Handle stock-related chatbot queries
// POST /api/chatbot/stock
router.post('/stock', auth, chatbotController.handleStockQuery);

// (Optional) You can later add more chatbot routes, like:
// router.post('/finance', auth, chatbotController.handleFinanceQuery);
// router.post('/learning', auth, chatbotController.handleLearningQuery);

module.exports = router;
