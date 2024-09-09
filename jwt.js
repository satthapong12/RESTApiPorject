require('dotenv').config(); // โหลดตัวแปรสภาพแวดล้อมจาก .env

const jwt = require('jsonwebtoken');

const secretKey = secrekey.env.JWT_SECRET_KEY; // ใช้ตัวแปรจาก .env
