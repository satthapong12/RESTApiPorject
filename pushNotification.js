const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('./connect'); // Import the database connection

// Route for notifications
let tokensStore =[];
router.post('/receiveTokens', async (req, res) => {
    try {
        const { tokens } = req.body; // รับโทเค็นจาก request body
        if (!tokens || tokens.length === 0) {
            console.log("No tokens received Clearing tokenStore");
            tokensStore = [];
            return res.status(400).send("No tokens provided.");
        }
        

        console.log("Received tokens:", tokens);


        tokensStore = tokens;
      
        // ตรวจสอบว่ามีการเก็บโทเค็นในรูปแบบของอาเรย์และเก็บข้อมูลลงในฐานข้อมูล
        // Query การบันทึกหลายโทเค็นพร้อมกัน
        //const tokenValues = tokens.map(token => [token]); // สร้างอาร์เรย์ของโทเค็นแต่ละค่า
        //await db.query("INSERT INTO tokens_table (token) VALUES ?", [tokenValues]);

        res.status(200).send("Tokens received and stored successfully.");
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});
router.post('/sendNotifications', async (req, res) => {
    try {
        

        if (!tokensStore || tokensStore.length === 0) {
            return res.status(400).send("No tokens provided.");
        }

        console.log("Sending notifications to tokens:", tokensStore);

        // ดึงข้อมูลล่าสุดจากฐานข้อมูล
        const [latestDetecHistory] = await db.query(
            "SELECT id, type, count, status, date_detec FROM detec_history WHERE status IN ('ORANGE', 'RED') ORDER BY date_detec DESC LIMIT 1"
        );
        const latestId = latestDetecHistory[0].id;

        if (latestDetecHistory.length === 0) {
            return res.status(404).send("No relevant attacks found.");
        }
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
        for (const token of tokensStore) {
            try {
                await axios.post('https://notify-api.line.me/api/notify', `message=${encodeURIComponent(message)}`, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (notificationError) {
                console.error(`Failed to send notification to token: ${token}. Error:`, notificationError.message);
                // สามารถเก็บ log การส่งล้มเหลวได้ที่นี่
            }
        }

        // บันทึกการแจ้งเตือนล่าสุดใน last_notification
        await db.query("INSERT INTO last_notification (detec_history_id) VALUES (?)", [latestId]);

        res.json({ message, notificationStatus: "Notification sent successfully!" });
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});
module.exports = router;