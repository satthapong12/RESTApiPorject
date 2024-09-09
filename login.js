// login.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./connect'); // Database connection

const router = express.Router();

// Route สำหรับการล็อกอิน
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
       // const [rows] = await db.query('SELECT * FROM users');

        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.query(sql, [email]);

        if (rows.length > 0) {
            const user = rows[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                res.status(200).json({ message: "Login Successful" });
            } else {
                res.status(401).json({ message: "Invalid Password 1" });
            }
        } else {
            res.status(401).json({ message: "Invalid Email not found" });
        }
    } catch (error) {
        console.error('Unexpected error:', error); // แสดงข้อผิดพลาดใน console
        res.status(500).json({ message: "Internal Server Error", error: error.message }); // ส่งข้อความข้อผิดพลาดเพิ่มเติม
    }
});

module.exports = router;
