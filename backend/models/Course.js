const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Students enrolled in this course — powers the student "My Courses" /
  // enroll flow. Not present in the original schema, added for compatibility
  // with the student frontend.
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  modules: [
    {
      moduleName: { type: String, required: true },
      lessons: [{ title: { type: String, required: true }, content: String }]
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);