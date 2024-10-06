// routes/jwt.js
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware'); // นำเข้า middleware ตรวจสอบ token

const router = express.Router();

// ตัวอย่าง route ที่ต้องการการยืนยันตัวตน
router.get('/', authenticateToken, (req, res) => {
    res.status(200).json({ message: "Access to /jwt route granted.", user: req.user });
});

// หรือสร้าง route สำหรับทดสอบการ decode token
router.get('/decode', authenticateToken, (req, res) => {
    res.status(200).json({ message: "Token decoded successfully.", user: req.user });
});

module.exports = router;
