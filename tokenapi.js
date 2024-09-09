const express = require('express');
const router = express.Router();
const db = require('./connect'); // เชื่อมต่อฐานข้อมูล

// ดึงข้อมูล Token ที่ไม่เป็น null
router.get('/fetch_tokens', async (req, res) => {
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