const express = require('express');
const router = express.Router();
const db = require('./connect');

let lastId = 0;

// ฟังก์ชันสำหรับตรวจสอบข้อมูลใหม่
router.get('/checkData', async (req, res) => {
  try {
    const query = 'SELECT * FROM detec_history WHERE id > ? ORDER BY id ASC';
    
    // ใช้ promise-based query เพื่อให้รองรับ async/await
    const results = await new Promise((resolve, reject) => {
      db.query(query, [lastId], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });

    if (results.length > 0) {
      const notifications = results.map((row) => {
        // สร้างข้อความการแจ้งเตือน
        //const notification = New entry detected:\nID: ${row.id}\nType: ${row.type}\nStatus: ${row.status};
        const notification = `มีการโจมตีใหม่เข้ามาในระบบของคุณ\nType : ${row.type}\nCount : ${row.count}\nStatus : ${row.status}\nDate Detected : ${row.dateDetec}\n\n`;

        // อัปเดต lastId
        if (row.id > lastId) {
          lastId = row.id;
        }

        return { ...row, message: notification };
      });

      // ส่งผลลัพธ์เป็น JSON
      return res.status(200).json({ newData: notifications });
    } else {
      return res.status(200).json({ newData: [] });
    }
  } catch (err) {
    console.error('Error fetching new data:', err);
    return res.status(500).json({ error: 'Error fetching new data' });
  }
});

module.exports = router;