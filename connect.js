const mysql = require('mysql2/promise');
const os = require('os');
const dotenv = require('dotenv');
dotenv.config();


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
console.log('Connecting to MySQL with:');
console.log('Host:', host);
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD);
console.log('Database:', process.env.DB_NAME);
// ตั้งค่าการเชื่อมต่อฐานข้อมูล
const db = mysql.createPool({
    host: host, // ใช้ IP address ที่ดึงมาได้
    user: process.env.DB_USER,         // e.g., 'root'
    password: process.env.DB_PASSWORD, // e.g., 'password123'
    database: process.env.DB_NAME,     // e.g., 'my_database'
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection()
    .then(() => console.log('Connected to Database at', host))
    .catch(err => console.error('Error connecting to database:', err.stack));

module.exports = db;
