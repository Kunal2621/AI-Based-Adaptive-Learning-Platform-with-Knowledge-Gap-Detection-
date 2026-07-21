const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  // Question "kind" — the student quiz UI renders differently per type.
  // Defaults to 'mcq' since that's what the AI generators always produce today.
  type: {
    type: String,
    enum: ['mcq', 'true_false', 'short_answer'],
    default: 'mcq'
  },
  // Optional per-question topic, used for the topic-wise breakdown in results.
  // Falls back to the parent quiz's `topic` field when not set.
  topic: {
    type: String
  },
  marks: {
    type: Number,
    default: 1
  },
  answerOptions: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, default: false },
      rationale: { type: String } // Why it's correct/incorrect, provided by AI
    }
  ],
  // Fallback correctness marker for generators that return an index instead
  // of flagging isCorrect on the option itself.
  correctAnswerIndex: {
    type: Number
  },
  hint: {
    type: String
  },
  difficulty: {
    type: String,
    default: 'Advanced'
  }
}, { _id: true });

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  topic: {
    type: String,
    required: true // Act as the prompt target vector for Gemini AI tracking
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timeLimit: {
    type: Number // minutes, optional
  },
  questions: [QuestionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
