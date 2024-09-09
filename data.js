const express = require('express');
const db = require('./connect'); // เชื่อมต่อฐานข้อมูล

const router = express.Router();

// Route สำหรับดึงข้อมูลทั้งหมดจากตาราง users
router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        if(rows.length >0 ){
            res.status(200).json(rows);
        }else{
            res.json({message:'No information found User'})
        }
    } catch (error) {
        console.error('Error executing :', error.stack);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;