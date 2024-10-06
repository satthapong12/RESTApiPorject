// routes/detectRoute.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // นำเข้า middleware
const { detect } = require('./checkData'); // นำเข้าฟังก์ชัน detect จาก checkData.js

router.get('/detect', authenticateToken, async (req, res) => {
    console.log('Request received for /detect');

    try {
        const detectionResult = await detect();

        return res.status(200).json(detectionResult);
    } catch (err) {
        console.error('Error in /detect:', err);
        return res.status(500).json({
            success: false,
            error: 'Error fetching or updating data'
        });
    }
});

module.exports = router;
