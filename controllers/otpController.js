// ✅ UPDATED CONTROLLER using HTTP API instead of REST Broadcast API

const Otp = require('../models/otpModel');
const axios = require('axios');
require('dotenv').config();

const KIT19_USERNAME = process.env.KIT19_USERNAME;
const KIT19_PASSWORD = process.env.KIT19_PASSWORD;
const SENDER_ID = process.env.KIT19_SENDER_ID;
const TEMPLATE_ID = '1707172069230583767';

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendOtp = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number required' });

    const existingOtp = await Otp.findOne({ phone }).sort({ createdAt: -1 });

    const now = new Date();
    const COOLDOWN_SECONDS = 60;
    if (existingOtp && now - existingOtp.lastSentAt < COOLDOWN_SECONDS * 1000) {
        return res.status(429).json({ message: 'Please wait before requesting another OTP.' });
    }

    const otp = generateOTP();
    const message = `Dear User ${otp} : is the OTP for Your Login at Goel Vet Pharma Pvt`;
    const encodedMessage = encodeURIComponent(message)
        .replace(/&/g, '%26')
        .replace(/\\+/g, '%2B');

    const url = `https://www.kit19.com/ComposeSMS.aspx?username=${KIT19_USERNAME}&password=${KIT19_PASSWORD}&sender=${SENDER_ID}&to=${phone}&message=${encodedMessage}&priority=1&dnd=1&unicode=0&dlttemplateid=${TEMPLATE_ID}`;

    try {
        await axios.get(url);
        await Otp.create({ phone, otp, lastSentAt: now });

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};


exports.verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP required' });

    const record = await Otp.findOne({ phone, otp });
    if (!record) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await Otp.deleteMany({ phone });

    res.status(200).json({ message: 'OTP verified successfully' });
};
