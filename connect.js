const mysql = require('mysql2/promise');
const os = require('os');

// ฟังก์ชันดึง IP address
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        const addresses = interfaces[interfaceName];
        for (const i in addresses) {
            const address = addresses[i];
            if (address.family === 'IPv4' && !address.internal) {
                return address.address;
            }
        }
    }
    return '127.0.0.1'; // กรณีหาไม่เจอ ให้ใช้ localhost
}

const host = getLocalIp(); // ดึง IP address ของเครื่อง

// ตั้งค่าการเชื่อมต่อฐานข้อมูล
const db = mysql.createPool({
    host: host, // ใช้ IP address ที่ดึงมาได้
    user: 'root',
    password: 'Cs210245',
    database: 'pro1_register'
});

db.getConnection()
    .then(() => console.log('Connected to Database at', host))
    .catch(err => console.error('Error connecting to database:', err.stack));

module.exports = db;
