// routes/protected.js
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Example protected route
router.get('/', authenticateToken, (req, res) => {
    res.status(200).json({ message: "This is a protected route.", user: req.user });
});

// Add more protected routes as needed
// e.g., router.get('/profile', authenticateToken, (req, res) => { ... });

module.exports = router;
