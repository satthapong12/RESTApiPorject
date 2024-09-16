const express = require('express');
const router = express.Router();

let otpStore = {}; // ใช้หน่วยความจำเพื่อจัดเก็บ OTP

// API สำหรับสร้าง OTP
router.post('/generate', (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // สร้าง OTP 6 หลัก
    otpStore[email] = { otp, expiresAt: Date.now() + 300000 }; // OTP หมดอายุใน 5 นาที
    console.log('OTP generated:', otpStore);
    res.status(200).json({ message: 'OTP generated and sent' });
});

// API สำหรับตรวจสอบ OTP
router.post('/verify', (req, res) => {
    const { email, otp } = req.body;
    console.log('OTP verify request:', { email, otp });
    console.log('Current OTP store before check:', otpStore);
    
    if (otpStore[email]) {
        const storedOtp = otpStore[email].otp;
        const expiresAt = otpStore[email].expiresAt;

        if (Date.now() > expiresAt) {
            delete otpStore[email];
            console.log('OTP expired, updated store:', otpStore);
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (otp === storedOtp.toString()) {
            delete otpStore[email];
            console.log('OTP verified and removed, updated store:', otpStore);
            return res.status(200).json({ message: 'OTP verified successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
    } else {
        console.log('No OTP generated for this email, store:', otpStore);
        return res.status(400).json({ message: 'No OTP generated for this email' });
    }
});

module.exports = router;