const jwt = require('jsonwebtoken');
const express = require('express');
const authenticateToken = require('./authenticateToken'); // สมมติว่าไฟล์อยู่ในโฟลเดอร์ middleware

const router = express.Router();

function authenticateToken(req, res, next) {
    // รับ token จาก headers
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // คาดหวังรูปแบบ "Bearer TOKEN"

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        req.user = user; // เก็บข้อมูลผู้ใช้จาก token ลงใน request object
        next();
    });
}

module.exports = authenticateToken;



router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: `Hello ${req.user.email}, you have access to this protected route!` });
});

module.exports = router;
