const mongoose = require('mongoose');

const learningSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challengesCompleted: {
    type: Number,
    default: 0
  },
  quizScore: {
    type: Number,
    default: 0
  },
  completedModules: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningModule'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Learning', learningSchema);