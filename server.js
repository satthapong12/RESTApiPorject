// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();



const loginRouter = require('./routes/login'); // นำเข้า Router สำหรับการล็อกอิน
//const loginjwtRouter = require('./loginjwt'); // นำเข้า Router สำหรับการล็อกอิน
const registerRouter = require('./routes/register'); // นำเข้า Router สำหรับการล็อกอิน
const dataRouter = require('./routes/data'); // นำเข้า Router สำหรับการล็อกอิน
const updateUserRouter = require('./routes/update_user'); // นำเข้า Router สำหรับการ
const DetectHistoryRouter = require('./routes/history'); // นำเข้า Router สำหรับการ
const fileRouter = require('./routes/readfile');
const notificationRouter = require('./routes/pushNotification');
const ShownotificationRouter = require('./routes/showNotifications');
const deleteHistoryRouter = require('./routes/deleteHistory');
const GroupRouter = require('./routes/setThreshold');
const tokenRoutes = require('./routes/tokenapi');
const otpRoutes = require('./routes/otpmailer');
const otptest = require('./routes/jwt');
const checkDataRoutes = require('./routes/detectRoute');
const protectedRoutes = require('./routes/protected');








const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ใช้ Router สำหรับการล็อกอิน
app.use('/routes/login', loginRouter);
//app.use('/loginjwt', loginjwtRouter);

app.use('/routes/register', registerRouter);
app.use('/routes/data', dataRouter);
app.use('/routes/update_user', updateUserRouter);
app.use('/routes/history', DetectHistoryRouter);
app.use('/routes/readfile', fileRouter);
app.use('/routes/pushNotification', notificationRouter);
app.use('/routes/showNotifications', ShownotificationRouter);
app.use('/routes/deleteHistory', deleteHistoryRouter);
app.use('/routes/setThreshold', GroupRouter);
app.use('/routes/tokenapi', tokenRoutes);
app.use('/routes/otpmailer', otpRoutes);
app.use('/routes/jwt', otptest);
app.use('/routes/detectRoute', checkDataRoutes);
app.use('/routes/protected', protectedRoutes); // ตั้งชื่อเส้นทางให้ชัดเจน











app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});