// routes/portfolioRoutes.js  (Portfolio Management ONLY)
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const { calculateRiskMetrics } = require('../utils/riskCalculator');

// Update risk metrics
router.post('/:portfolioId/update-risk', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.portfolioId);
    if (!portfolio) return res.status(404).json({ msg: 'Portfolio not found' });

    if (portfolio.userId.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ msg: 'Not authorized' });

    const riskMetrics = await calculateRiskMetrics(portfolio);
    portfolio.riskMetrics = riskMetrics;
    await portfolio.save();

    res.json(portfolio);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all portfolios of logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user.id });
    res.json(portfolios);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create portfolio
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, riskLevel } = req.body;

    const portfolio = new Portfolio({
      userId: req.user.id,
      name,
      description,
      riskLevel: riskLevel || 'moderate'
    });

    await portfolio.save();
    res.json(portfolio);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get specific portfolio
router.get('/:id', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) return res.status(404).json({ msg: 'Portfolio not found' });

    if (portfolio.userId.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ msg: 'Not authorized' });

    res.json(portfolio);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update portfolio data
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, riskLevel } = req.body;

    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) return res.status(404).json({ msg: 'Portfolio not found' });

    if (portfolio.userId.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ msg: 'Not authorized' });

    portfolio.name = name || portfolio.name;
    portfolio.description = description || portfolio.description;
    portfolio.riskLevel = riskLevel || portfolio.riskLevel;

    await portfolio.save();
    res.json(portfolio);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete portfolio
router.delete('/:id', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) return res.status(404).json({ msg: 'Portfolio not found' });

    if (portfolio.userId.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ msg: 'Not authorized' });

    await portfolio.deleteOne();
    res.json({ msg: 'Portfolio removed' });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
