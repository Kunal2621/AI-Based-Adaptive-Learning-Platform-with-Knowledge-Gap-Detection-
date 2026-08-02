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
    ref: 'Course',
    required: false // Optional for standalone/AI generated quizzes
  },
  answers: [
    {
      questionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
      },
      selectedOptionText: { 
        type: String, 
        required: true,
        default: "No answer selected" 
      },
      isCorrect: { 
        type: Boolean, 
        required: true,
        default: false 
      }
    }
  ],
  score: {
    type: Number,
    required: true,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    default: 0
  },
  percentage: {
    type: Number,
    required: true,
    default: 0
  },
  knowledgeGapFeedback: {
    type: String,
    required: true,
    default: "No feedback generated."
  },

  // 🟢 CRITICAL ADDITION: Structured AI Analysis for Recommendations Page
  geminiAnalysis: {
    overallStrength: { 
      type: String, 
      default: "Performance evaluated." 
    },
    encouragement: { 
      type: String, 
      default: "Keep practicing to refine your technical mastery." 
    },
    gaps: [
      {
        topic: { type: String, required: true },
        severity: { 
          type: String, 
          enum: ['high', 'medium', 'low'], 
          default: 'medium' 
        },
        description: { type: String, default: "" },
        recommendations: [{ type: String }]
      }
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);