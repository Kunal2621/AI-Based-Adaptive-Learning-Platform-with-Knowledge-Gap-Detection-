const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true // The weak topic targeted for remediation (e.g., "JVM Internals")
  },
  flashcards: [
    {
      front: { type: String, required: true }, // The core technical question/concept
      back: { type: String, required: true }   // The precise, direct explanation/answer
    }
  ],
  studyNotes: {
    type: String,
    required: false, // 🟢 FIX: Set required to false so empty string or fallback never fails validation
    default: 'Core concepts review and key implementation rules.'
  }
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', RecommendationSchema);