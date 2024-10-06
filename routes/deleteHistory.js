const express = require('express');
const router = express.Router();
const db = require('../connect');

  
  // สร้าง API สำหรับลบข้อมูลในตาราง detec_history
  router.delete('/', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
      const { id } = req.body;
  
      if (!id) {
        return res.status(400).json({ message: 'ID is required' });
      }
  
      // เริ่มการทำงานของ transaction
      await connection.beginTransaction();
  
      // ลบการอ้างอิงจาก last_notification ก่อน
      await connection.query('DELETE FROM last_notification WHERE detec_history_id = ?', [id]);
  
      // ลบจาก detec_history
      const result = await connection.query('DELETE FROM detec_history WHERE id = ?', [id]);
  
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'No record found with that ID' });
      }
  
      // ยืนยันการทำงานของ transaction
      await connection.commit();
  
      return res.status(200).json({ message: 'Record deleted successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting record:', error);
      return res.status(500).json({ message: 'Internal server error' });
    } finally {
      connection.release();
    }
  });
  
  module.exports = router;