// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─────────────────────────────────────
// USER SCHEMA
// ─────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    }
  },
  {
    timestamps: true
  }
);

// ─────────────────────────────────────
// HASH PASSWORD BEFORE SAVING
// ─────────────────────────────────────
userSchema.pre('save', async function () {
  // Only hash if password is modified
  if (!this.isModified('password')) return;

  // Hash password
  this.password = await bcrypt.hash(this.password, 10);
});

// ─────────────────────────────────────
// COMPARE PASSWORD (LOGIN)
// ─────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─────────────────────────────────────
// EXPORT MODEL
// ─────────────────────────────────────
const User = mongoose.model('User', userSchema);

module.exports = User;