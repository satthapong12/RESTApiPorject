const express = require('express');
const router = express.Router();
const db = require('./connect'); // Import the database connection

// Route to fetch data from the 'detec_history' table
router.get('/fetch_group', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id,name,Threshold FROM AttackGroup");
        res.status(200).json({ AttackGroup: rows });
    } catch (error) {
        console.error('Query failed:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

router.put('/update_threshold/:id', async (req, res) => {
    const { id } = req.params;
    const { threshold } = req.body;

    if (!threshold) {
        return res.status(400).json({ message: 'Threshold value is required' });
    }

    try {
        const [result] = await db.query(
            "UPDATE AttackGroup SET Threshold = ? WHERE id = ?",
            [threshold, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'AttackGroup not found' });
        }

        res.status(200).json({ message: 'Threshold updated successfully' });
    } catch (error) {
        console.error('Update failed:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;