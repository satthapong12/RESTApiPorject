const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./connect'); // เชื่อมต่อฐานข้อมูล

const router = express.Router();

// Route สำหรับการลงทะเบียน
router.post('/', async (req, res) => {
    const { firstname, lastname, email, password, urole, phone, description, token } = req.body;

    // ตรวจสอบว่ามีข้อมูลทั้งหมดที่จำเป็นหรือไม่
    if (!firstname || !lastname || !email || !password || !urole || !phone || !description) {
        return res.status(400).json({ message: "Error: Missing required fields" });
    }

    // ตรวจสอบว่า urole เป็นค่าที่ถูกต้องหรือไม่
    const validRoles = ['admin', 'user'];
    if (!validRoles.includes(urole)) {
        return res.status(400).json({ message: "Error: Invalid role" });
    }

    try {
        // ตรวจสอบว่าอีเมลมีอยู่ในฐานข้อมูลแล้วหรือไม่
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "Error: Email already in use" });
        }

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // เพิ่มผู้ใช้ใหม่ในฐานข้อมูล
        const sql = 'INSERT INTO users (firstname, lastname, email, password, urole, phone, description, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [firstname, lastname, email, hashedPassword, urole, phone, description, token];
        await db.query(sql, values);

        res.status(201).json({ message: "Success: User registered" });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;
