const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/otpController');

const router = express.Router();

router.post('/send', sendOtp); // Send OTP
router.post('/verify', verifyOtp); // Verify OTP

module.exports = router;
