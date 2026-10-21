// Defines account data; only a password hash is stored, never the plain password.
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true, maxlength: 80},
  email: {type: String, required: true, unique: true, lowercase: true, trim: true},
  passwordHash: {type: String, required: true},
}, {timestamps: true});
module.exports = mongoose.model('User', userSchema);
