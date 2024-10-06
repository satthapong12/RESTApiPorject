const express = require('express');
const router = express.Router();
const db = require('../connect');
const moment = require('moment-timezone'); // Import moment-timezone

// Route for fetching notifications that have already been shown
router.get('/getNotifications', async (req, res) => {
    try {
        // Fetch notifications based on status_tracker
        const query = `
            SELECT dh.id, dh.type, dh.count, dh.status, dh.date_detec, dh.file_path
            FROM detec_history dh
            INNER JOIN status_tracker st ON dh.id = st.id
            ORDER BY dh.date_detec DESC;
        `;
        const [rows] = await db.query(query);

        if (rows.length > 0) {
            // Convert date_detec to a specific timezone and format
            const formattedRows = rows.map(row => ({
                ...row,
                date_detec: moment(row.date_detec).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss') // Change 'Asia/Bangkok' to your desired timezone
            }));

            res.json({
                message: "Notifications found",
                data: formattedRows
            });
        } else {
            res.json({
                message: "No notifications found",
                data: []
            });
        }
    } catch (error) {
        res.status(500).send(`Error fetching notifications: ${error.message}`);
    }
});

module.exports = router;
