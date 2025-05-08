const express = require('express');
const router = express.Router();
const Learning = require('../models/Learning');
const LearningModule = require('../models/LearningModule');
const auth = require('../middleware/auth');

// GET /api/learning - Fetch user learning data (Protected)
router.get('/', auth, async (req, res) => {
  try {
    let learning = await Learning.findOne({ userId: req.user.id });
    
    if (!learning) {
      learning = new Learning({ userId: req.user.id });
      await learning.save();
    }
    
    res.json(learning);
  } catch (err) {
    console.error('Error fetching learning data:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/learning/complete - Update learning progress (Protected)
router.post('/complete', auth, async (req, res) => {
  const { type, score } = req.body;
  
  try {
    let learning = await Learning.findOne({ userId: req.user.id });
    if (!learning) {
      learning = new Learning({ userId: req.user.id });
    }
    
    if (type === 'challenge') learning.challengesCompleted += 1;
    if (type === 'quiz') learning.quizScore += score || 0;
    
    await learning.save();
    res.json(learning);
  } catch (err) {
    console.error('Error updating learning progress:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/learning/leaderboard - Retrieve leaderboard (Public)
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Learning.aggregate([
      { $sort: { quizScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          email: { $arrayElemAt: ['$user.email', 0] },
          name: { $arrayElemAt: ['$user.name', 0] },
          quizScore: 1,
          challengesCompleted: 1
        }
      }
    ]);
    
    res.json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/learning/modules - Fetch all learning modules (Public)
router.get('/modules', async (req, res) => {
  try {
    const modules = await LearningModule.find();
    res.json(modules);
  } catch (err) {
    console.error('Error fetching learning modules:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/learning/modules/:id - Fetch a single module by ID (Public)
router.get('/modules/:id', async (req, res) => {
  try {
    const module = await LearningModule.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ msg: 'Module not found' });
    }
    res.json(module);
  } catch (err) {
    console.error('Error fetching module:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/learning/complete-module - Mark a module as complete (Protected)
router.post('/complete-module', auth, async (req, res) => {
  const { moduleId } = req.body;

  try {
    if (!moduleId) {
      return res.status(400).json({ msg: 'Module ID is required' });
    }

    let learning = await Learning.findOne({ userId: req.user.id });
    if (!learning) {
      learning = new Learning({ userId: req.user.id });
    }

    if (learning.completedModules.includes(moduleId)) {
      return res.status(400).json({ msg: 'Module already completed' });
    }

    learning.completedModules.push(moduleId);
    await learning.save();

    res.json(learning);
  } catch (err) {
    console.error('Error marking module as complete:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;