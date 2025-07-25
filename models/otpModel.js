const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }, //5 minutes
    lastSentAt: { type: Date, default: Date.now } //this is for tracking the last sent time
});

module.exports = mongoose.model('Otp', otpSchema);
