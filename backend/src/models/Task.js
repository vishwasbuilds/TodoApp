// Defines the stored task fields, defaults, and validation rules.
const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  // Index the owner so each user's task list can be retrieved efficiently.
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
  title: {type: String, required: true, trim: true, maxlength: 160},
  description: {type: String, default: '', maxlength: 2000},
  scheduledAt: {type: Date, default: null},
  deadline: {type: Date, default: null},
  priority: {type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium'},
  category: {type: String, default: 'Personal', trim: true, maxlength: 60},
  completed: {type: Boolean, default: false},
}, {timestamps: true});
module.exports = mongoose.model('Task', taskSchema);
