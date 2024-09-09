const express = require('express');
const router = express.Router();
const db = require('./connect'); // Import the database connection

// Route to fetch data from the 'detec_history' table
router.get('/fetch_detec_history', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM detec_history");
        res.status(200).json({ DetecPattern: rows });
    } catch (error) {
        console.error('Query failed:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;