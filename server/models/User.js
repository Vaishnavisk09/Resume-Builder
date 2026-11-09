const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  preferences: { theme: { type: String, default: 'light' } },
  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.matchPassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toPublic = function() {
  return { _id: this._id, name: this.name, email: this.email, createdAt: this.createdAt };
};

module.exports = mongoose.model('User', userSchema);
