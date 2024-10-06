const express = require('express');
const router = express.Router();
const db = require('../connect');
const authenticateToken = require('../middleware/authMiddleware'); // นำเข้า middleware ตรวจสอบ token

// ดึงข้อมูล Token ที่ไม่เป็น null
router.get('/fetch_tokens',authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT email,token FROM users WHERE token IS NOT NULL AND token != ""');
       const tokenWithEamil = rows.map(row => ({
            email: row.email,
            token: row.token
        }));
        res.json({tokens:tokenWithEamil});
    } catch (error) {
        console.error('Error fetching tokens:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
module.exports = router;