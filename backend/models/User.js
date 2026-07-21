const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['Student', 'Teacher', 'Admin'], // Strict role checking
      default: 'Student',
    },
    bio: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Auto-generates createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('User', userSchema);