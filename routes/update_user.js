const express = require('express');
const router = express.Router();
const db = require('../connect');
const authenticateToken = require('../middleware/authMiddleware'); 

router.post('/',authenticateToken, async (req, res) => {
  const { email, field, value } = req.body;

  // ตรวจสอบการป้อนข้อมูล
  if (!email || !field || !value) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  // ตรวจสอบว่า field ที่ส่งมานั้นถูกต้อง
  const validFields = ['firstname', 'lastname', 'phone', 'description','token'];
  if (!validFields.includes(field)) {
    return res.status(400).json({ status: 'error', message: 'Invalid field' });
  }

  try {
    console.log("Request body:", req.body);

    const { email, field, value } = req.body;
    
    // สร้าง SQL query โดยกำหนดชื่อคอลัมน์เป็น string ใน query โดยตรง
    const sql = 'UPDATE users SET ?? = ? WHERE email = ?';

    // ใช้ array ในการส่งค่าตัวแปรให้กับ query
    const [result] = await db.query(sql, [field, value, email]);

    console.log("Query Executed. Result:", result);

    if (result.affectedRows > 0) {
        res.status(200).json({ status: 'success' });
    } else {
        res.status(404).json({ status: 'error', message: 'User not found' });
    }
} catch (error) {
    console.error('Unexpected error:', error);
    console.log("Request body : ", req.body);
    res.status(500).json({ status: 'error', message: 'Internal Server Error', details: error.message });
}
});

module.exports = router;