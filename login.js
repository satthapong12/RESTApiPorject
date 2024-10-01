const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./connect');
const jwt = require('jsonwebtoken');
require('dotenv').config();  // โหลด environment variables จากไฟล์ .env

const router = express.Router();

// Route สำหรับการล็อกอิน
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // ตรวจสอบว่ามีอีเมลในฐานข้อมูลหรือไม่
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.query(sql, [email]);

        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            console.log('JWT_SECRET:', process.env.JWT_SECRET);
            if (isMatch) {
                // สร้าง JWT token โดยใช้ secret key จาก process.env
                const token = jwt.sign(
                    { email: user.email, urole: user.urole },
                    process.env.JWT_SECRET, // ใช้ secret key จาก environment variables
                    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // กำหนดเวลาอายุ token
                );

                res.status(200).json({ 
                    message: "Login successful.",
                    token: `Bearer ${token}`, // ส่ง JWT token กลับไป
                    urole: user.urole 
                });
            } else {
                res.status(401).json({ message: "Invalid password." });
                console.log('JWT_SECRET:', process.env.JWT_SECRET);
            }
        } else {
            res.status(401).json({ message: "Invalid email." });
            console.log('JWT_SECRET:', process.env.JWT_SECRET);
        }
    } catch (error) {
        // ข้อผิดพลาดของเซิร์ฟเวอร์
        console.error('Unexpected error:', error);
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});

module.exports = router;
