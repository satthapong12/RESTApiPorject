const express = require('express');
const router = express.Router();
const { readFileContent } = require('./fileUtils'); // ใช้ฟังก์ชันจาก fileUtils.js
const db = require('../connect');

// เส้นทางสำหรับดึงเนื้อหาของไฟล์
router.get('/file-content/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // คำสั่ง SQL เพื่อดึงข้อมูล file_path จากฐานข้อมูล
        const [rows] = await db.query('SELECT file_path FROM detec_history WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = rows[0].file_path;
        
        // อ่านเนื้อหาของไฟล์
        const fileContent = await readFileContent(filePath);
        
        // ส่งเนื้อหาไฟล์กลับไปยัง client
        res.status(200).send(fileContent);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

/*router.get('/file-content/:filePath', async (req, res) => {
    // Decode the file path from the URL
    const filePath = decodeURIComponent(req.params.filePath);
    console.log('Decoded File Path: ${filePath}');
    
    try {
        // Ensure the file path is valid and points to a file
        if (await fs.access(filePath).then(() => true).catch(() => false)) {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            res.status(200).send(fileContent);
        } else {
            res.status(404).json({ message: 'File not found' });
        }
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});*/

module.exports = router;