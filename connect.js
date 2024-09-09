// connect.js
const mysql = require('mysql2/promise'); // ใช้ mysql2/promise

// ตั้งค่าการเชื่อมต่อฐานข้อมูล
const db = mysql.createPool({
    host: '192.168.1.104',
    user: 'root',
    password: 'Cs210245',
    database: 'pro1_register'
});
db.getConnection()
    .then(() => console.log('Connect to Database'))
    .catch(err => console.error('Error connecting to database:', err.stack));
module.exports = db;