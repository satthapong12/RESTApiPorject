const express = require('express');
const router = express.Router();
const db = require('./connect'); // ไฟล์ connect.js ที่ตั้งค่าเป็น Promise-based

// ฟังก์ชันสำหรับตรวจสอบและอัปเดตสถานะ
router.get('/detect', async (req, res) => {
  console.log('Request received for /detect');

  try {
    // Step 1: ดึงสถานะล่าสุดจาก detec_history สำหรับแต่ละ id
    const latestStatusQuery = `
      SELECT dh.id, dh.type, dh.count, dh.status, dh.date_detec, dh.file_path
      FROM detec_history dh
      INNER JOIN (
        SELECT id, MAX(date_detec) AS max_date
        FROM detec_history
        GROUP BY id
      ) dh_max ON dh.id = dh_max.id AND dh.date_detec = dh_max.max_date
    `;
    const [latestEntries] = await db.query(latestStatusQuery);

    console.log('Latest entries:', latestEntries);

    if (latestEntries.length === 0) {
      console.log('No data found in detec_history');
      return res.status(200).json({
        success: true,
        message: 'No data found in detec_history',
        newData: []
      });
    }

    // Step 2: ดึงสถานะปัจจุบันจาก status_tracker
    const currentStatusQuery = 'SELECT id, status FROM status_tracker';
    const [currentStatuses] = await db.query(currentStatusQuery);

    const currentStatusMap = new Map();
    currentStatuses.forEach(tracker => {
      currentStatusMap.set(tracker.id, tracker.status);
    });

    console.log('Current status map:', currentStatusMap);

    let notifications = [];
    let updates = []; // Array of [status, id]

    // Step 3: เปรียบเทียบสถานะและเตรียมการอัปเดต
    latestEntries.forEach(entry => {
      const previousStatus = currentStatusMap.get(entry.id) || 'GREEN'; // สมมุติว่าเริ่มต้นเป็น GREEN หากไม่มีใน status_tracker

      // ตรวจสอบการเปลี่ยนแปลงสถานะ
      if (previousStatus !== entry.status) {
        const formattedDate = new Date(entry.date_detec).toLocaleString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        // สร้างการแจ้งเตือน
        notifications.push({
          type: entry.type,
          count: entry.count,
          status: entry.status,
          dateDetected: formattedDate,
          filePath: entry.file_path,
          message: `สถานะของการโจมตีในระบบของคุณมีการเปลี่ยนแปลงจาก ${previousStatus} เป็น ${entry.status}\nID: ${entry.id}\nType: ${entry.type}\nCount: ${entry.count}\nDate Detected: ${formattedDate}\nFile Path: ${entry.file_path}\n\n`
        });

        // เตรียมข้อมูลสำหรับการอัปเดต
        updates.push([entry.status, entry.id, entry.id]); // เพิ่ม id สำหรับ last_notification
      }
    });

    // Step 4: อัปเดต status_tracker และ insert ลงใน last_notification
    for (const [status, id, detec_history_id] of updates) {
      if (status !== 'GREEN') {
        // Insert หรือ Update สถานะใน status_tracker
        const updateStatusQuery = `
          INSERT INTO status_tracker (id, status) VALUES (?, ?)
          ON DUPLICATE KEY UPDATE status = VALUES(status)
        `;
        await db.query(updateStatusQuery, [id, status]);
        console.log(`Updated status_tracker for id ${id} to ${status}`);

        // Insert ลงใน last_notification
        /*const insertNotificationQuery = `
          INSERT INTO last_notification (detec_history_id) VALUES (?)
        `;
        await db.query(insertNotificationQuery, [detec_history_id]);
        console.log(`Inserted into last_notification for detec_history_id ${detec_history_id}`);*/
      } else {
        // ลบ entry จาก status_tracker หากสถานะเป็น GREEN
        const deleteStatusQuery = 'DELETE FROM status_tracker WHERE id = ?';
        await db.query(deleteStatusQuery, [id]);
        console.log(`Deleted id ${id} from status_tracker as status is GREEN`);
      }
    }

    // Step 5: ส่งผลลัพธ์กลับไปยังผู้ใช้
    if (notifications.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'New status changes found',
        newData: notifications
      });
    } else {
      console.log('No status changes found');
      return res.status(200).json({
        success: true,
        message: 'No status changes found',
        newData: []
      });
    }

  } catch (err) {
    console.error('Error fetching or updating data:', err);
    return res.status(500).json({
      success: false,
      error: 'Error fetching or updating data'
    });
  }
});

module.exports = router;
