const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const db = require('./connect');

const router = express.Router();

let otpStore = {};

// Route สำหรับการล็อกอิน
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        // ตรวจสอบว่ามีอีเมลในฐานข้อมูลหรือไม่
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.query(sql, [email]);

        if (rows.length > 0) {
            const user = rows[0];

            // ตรวจสอบรหัสผ่าน
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                // สร้าง OTP และเก็บไว้ในหน่วยความจำ
                const otp = Math.floor(100000 + Math.random() * 900000); // สร้าง OTP 6 หลัก
                otpStore[email] = { otp, expiresAt: Date.now() + 300000 }; // OTP หมดอายุใน 5 นาที
                console.log('OTP stored:',otpStore)
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth:{
                        user:'monitoringforproject@gmail.com',
                        pass:'wiuqjpodbtdnoabz ' //app Password
                    }
                });
                // ส่ง OTP ไปยังอีเมลของผู้ใช้
                const mailOptions ={
                    from: 'monitoringforproject@gmail.com', // อีเมลที่ใช้ส่ง OTP
                    to: email,
                    subject: 'Your OTP Code',
                    text: `Your OTP code is Time Out 5 minue ${otp} For Login Application Monitoring` // ใช้ template literals
                };

                try {
                    await transporter.sendMail(mailOptions);
                    // ส่งการตอบกลับล็อกอินสำเร็จ
                    res.status(200).json({ 
                        message: "Login Successful. OTP sent to your email.",
                        urole: user.urole 
                    });

                } catch (error) {
                    // ข้อผิดพลาดในการส่งอีเมล
                    res.status(500).json({ message: 'Error sending OTP', error: error.message });
                }
            } else {
                // รหัสผ่านไม่ถูกต้อง
                res.status(401).json({ message: "Invalid Password" });
            }
        } else {
            // อีเมลไม่ถูกต้อง
            res.status(401).json({ message: "Invalid Email" });
        }
    } catch (error) {
        // ข้อผิดพลาดของเซิร์ฟเวอร์
        console.error('Unexpected error:', error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.post('/verify', (req, res) => {
    const { email, otp } = req.body;
    console.log('OTP verify request:', { email, otp });
    console.log('Current OTP store:', otpStore);
    
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