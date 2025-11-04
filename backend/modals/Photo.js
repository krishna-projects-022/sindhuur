const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  userId: {
    type: String, // Change to String to match profileId
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  isMain: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Photo', photoSchema);