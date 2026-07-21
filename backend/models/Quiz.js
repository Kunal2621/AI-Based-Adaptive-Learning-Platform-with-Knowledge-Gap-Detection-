const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true 
  },
  isCorrect: { 
    type: Boolean, 
    default: false 
  },
  rationale: { 
    type: String 
  } // Why it's correct/incorrect provided by Gemini AI
});

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  answerOptions: [OptionSchema],
  hint: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard", "Advanced"],
    default: "Medium"
  }
});

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
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
  questions: [QuestionSchema],
  
  // 🟢 Publish/Assign Status Flag (Default false/Draft, Publish dabane par true ho jayega)
  isAssigned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);