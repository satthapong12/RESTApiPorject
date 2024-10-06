const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../connect');
const authenticateToken = require('../middleware/authMiddleware'); // นำเข้า middleware
const { detect } = require('./checkData'); // ปรับเส้นทางตามที่อยู่ไฟล์ detectionService.js

// ตัวอย่าง route สำหรับรับ tokens และบันทึกลง Database
router.post('/receiveTokens',authenticateToken, async (req, res) => {
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
router.delete('/deleteToken',authenticateToken, async (req, res) => {
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

// Endpoint /sendNotifications
router.post('/sendNotifications', authenticateToken, async (req, res) => {
  try {
      // ดึง tokens จากฐานข้อมูล tokens_table
      const [tokensRows] = await db.query("SELECT token FROM tokens_table");
      const tokensStore = tokensRows.map(row => row.token); // แปลงผลลัพธ์เป็น array ของ tokens

      if (!tokensStore || tokensStore.length === 0) {
          return res.status(400).send("No tokens provided.");
      }

      // เรียกใช้ฟังก์ชัน detect เพื่อดึงข้อมูลการเปลี่ยนแปลงสถานะและเตรียมการแจ้งเตือน
      const detectionResult = await detect();
      const notifications = detectionResult.newData;

      if (notifications.length === 0) {
          return res.status(200).json({ message: "No new status changes found. No notifications sent." });
      }

      // วนลูปส่ง Notification ไปยังทุก Token ที่ได้รับ
      const notificationPromises = tokensStore.map(async (token) => {
          try {
              for (const notification of notifications) {
                await axios.post('https://notify-api.line.me/api/notify', `message=${encodeURIComponent(notification.message)}`, {
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'Authorization': `Bearer ${token}`
                  }
              });
              }
          } catch (notificationError) {
              console.error(`Failed to send notification to token: ${token}. Error:`, notificationError.message);
              // สามารถเก็บ log การส่งล้มเหลวได้ที่นี่
          }
      });

      // รอการส่งทั้งหมดเสร็จสิ้น
      await Promise.all(notificationPromises);

      res.json({ message: "Notifications sent successfully!", notificationStatus: "Success", sentNotifications: notifications });
  } catch (error) {
      console.error('Error in /sendNotifications:', error);
      res.status(500).send("Error: " + error.message);
  }
});

module.exports = router;