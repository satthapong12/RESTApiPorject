const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('./connect'); // Import the database connection

// ตัวอย่าง route สำหรับรับ tokens และบันทึกลง Database
router.post('/receiveTokens', async (req, res) => {
  try {
    const tokens = req.body.tokens;

    if (!tokens || !Array.isArray(tokens)) {
      return res.status(400).json({ message: 'Invalid tokens format' });
    }

    // บันทึก tokens ลง Database
    for (let token of tokens) {
      await db.query('INSERT INTO tokens_table (token) VALUES (?)', [token]);
    }

    return res.status(200).json({ message: 'Tokens saved successfully' });
  } catch (error) {
    console.error('Error saving tokens:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
router.delete('/deleteToken', async (req, res) => {
    try {
      const { token } = req.body;  // รับค่าของ token ที่จะลบ
  
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
  
      // ลบ token จากตารางในฐานข้อมูล
      const result = await db.query('DELETE FROM tokens_table WHERE token = ?', [token]);
  
      if (result.affectedRows > 0) {
        return res.status(200).json({ message: 'Token deleted successfully' });
      } else {
        return res.status(404).json({ message: 'Token not found' });
      }
    } catch (error) {
      console.error('Error deleting token:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/sendNotifications', async (req, res) => {
    try {
        // ดึง tokens จากฐานข้อมูล tokens_table
        const [tokensRows] = await db.query("SELECT token FROM tokens_table");
        const tokensStore = tokensRows.map(row => row.token); // แปลงผลลัพธ์เป็น array ของ tokens

        if (!tokensStore || tokensStore.length === 0) {
            return res.status(400).send("No tokens provided.");
        }

        console.log("Sending notifications to tokens:", tokensStore);

        // ดึงข้อมูลล่าสุดจากฐานข้อมูล
        const [latestDetecHistory] = await db.query(
            "SELECT id, type, count, status, date_detec FROM detec_history WHERE status IN ('ORANGE', 'RED') ORDER BY date_detec DESC LIMIT 1"
        );

        if (!latestDetecHistory || latestDetecHistory.length === 0) {
            return res.status(404).send("No relevant attacks found.");
        }

        const latestId = latestDetecHistory[0].id;
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
        const notificationPromises = tokensStore.map(async (token) => {
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
        });

        // รอการส่งทั้งหมดเสร็จสิ้น
        await Promise.all(notificationPromises);

        // บันทึกการแจ้งเตือนล่าสุดใน last_notification
        await db.query("INSERT INTO last_notification (detec_history_id) VALUES (?)", [latestId]);

        res.json({ message, notificationStatus: "Notification sent successfully!" });
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});

module.exports = router;