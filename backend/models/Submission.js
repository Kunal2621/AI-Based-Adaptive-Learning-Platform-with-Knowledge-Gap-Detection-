const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  // Per-question breakdown of what the student answered.
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      selectedOptionText: { type: String },
      isCorrect: { type: Boolean, default: false }
    }
  ],
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  correct: { type: Number, default: 0 },
  incorrect: { type: Number, default: 0 },
  skipped: { type: Number, default: 0 },
  timeTaken: { type: Number }, // seconds
  // Per-topic score breakdown: [{ topic, score, total }]
  topicScores: [
    {
      topic: String,
      score: Number,
      total: Number
    }
  ],
  // AI (Gemini) generated knowledge-gap analysis for this attempt.
  geminiAnalysis: {
    overallStrength: String,
    strongTopics: [String],
    gaps: [
      {
        topic: String,
        severity: { type: String, enum: ['high', 'medium', 'low'] },
        description: String,
        recommendations: [String]
      }
    ],
    encouragement: String
  },
  // Legacy free-text summary, kept for backward compatibility with earlier
  // dashboard aggregation code.
  knowledgeGapFeedback: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
