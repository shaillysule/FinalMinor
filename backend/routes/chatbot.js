// backend/routes/chatbot.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middleware/auth');
router.post('/stock', auth, chatbotController.handleStockQuery);
// Route for stock queries
router.post('/stock', chatbotController.handleStockQuery);

module.exports = router;