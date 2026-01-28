const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  action: { type: String, required: true },
  details: { type: Object },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);
