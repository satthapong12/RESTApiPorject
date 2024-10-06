const express = require('express');
const router = express.Router();
const db = require('../connect');
const authenticateToken = require('../middleware/authMiddleware'); // นำเข้า middleware

// Route to fetch data from the 'detec_history' table
router.get('/fetch_detec_history', authenticateToken, async (req, res) => { // ใช้ middleware
    try {
        const [rows] = await db.query("SELECT * FROM detec_history ORDER BY date_detec DESC");
        res.status(200).json({ DetecPattern: rows });
    } catch (error) {
        console.error('Query failed:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;
