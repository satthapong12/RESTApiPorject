const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('./connect'); // Import the database connection

// Route for notifications
router.post('/notify', async (req, res) => {
    try {
        const { tokens } = req.body; // รับ Tokens จาก Flutter ผ่าน request body

        if (!tokens || tokens.length === 0) {
            return res.status(400).send("No tokens provided.");
        }

        // Retrieve the latest ID from detec_history with status ORANGE or RED
        const [latestDetecHistory] = await db.query(
            "SELECT id, type, count, status, date_detec FROM detec_history WHERE status IN ('ORANGE', 'RED') ORDER BY date_detec DESC LIMIT 1"
        );

        if (!latestDetecHistory.length) {
            return res.status(404).send("No relevant attacks found.");
        }

        const latestId = latestDetecHistory[0].id;

        // Check if there is already a notification for this ID in last_notification
        const [existingNotification] = await db.query("SELECT id FROM last_notification WHERE detec_history_id = ?", [latestId]);

        if (existingNotification.length) {
            return res.json({ message: "No new attacks found." });
        }

        const type = latestDetecHistory[0].type;
        const count = latestDetecHistory[0].count;
        const status = latestDetecHistory[0].status;
        const dateDetec = latestDetecHistory[0].date_detec;

        const message = `มีการโจมตีใหม่เข้ามาในระบบของคุณ\nType : ${type}\nCount : ${count}\nStatus : ${status}\nDate Detected : ${dateDetec}\n\n`;

        // วนลูปส่ง Notification ไปยังทุก Token ที่ได้รับ
        for (const token of tokens) {
            await axios.post('https://notify-api.line.me/api/notify', `message=${encodeURIComponent(message)}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`
                }
            });
        }

        // Record the notified ID in last_notification
        await db.query("INSERT INTO last_notification (detec_history_id) VALUES (?)", [latestId]);

        res.json({ message, notificationStatus: "Notification sent successfully to all tokens!" });
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});

module.exports = router;