// routes/login.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../connect');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// Route for login
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Check if email exists in the database
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.query(sql, [email]);

        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // Create JWT payload
                const payload = {
                    id: user.id,
                    email: user.email,
                    urole: user.urole
                };

                // Sign token
                const token = jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN || '5m'
                });

                res.status(200).json({ 
                    message: "Login successful.",
                    token: token,
                    urole: user.urole 
                });
            } else {
                res.status(401).json({ message: "Invalid password." });
            }
        } else {
            res.status(401).json({ message: "Invalid email." });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});

module.exports = router;
