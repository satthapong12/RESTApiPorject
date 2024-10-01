// server.js
const express = require('express');
const cors = require('cors');
const loginRouter = require('./login'); // นำเข้า Router สำหรับการล็อกอิน
const loginjwtRouter = require('./loginjwt'); // นำเข้า Router สำหรับการล็อกอิน
const registerRouter = require('./register'); // นำเข้า Router สำหรับการล็อกอิน
const dataRouter = require('./data'); // นำเข้า Router สำหรับการล็อกอิน
const updateUserRouter = require('./update_user'); // นำเข้า Router สำหรับการ
const DetectHistoryRouter = require('./history'); // นำเข้า Router สำหรับการ
const fileRouter = require('./readfile');
const notificationRouter = require('./pushNotification');
const ShownotificationRouter = require('./showNotifications');
const deleteHistoryRouter = require('./deleteHistory');
const GroupRouter = require('./setThreshold');
const tokenRoutes = require('./tokenapi');
const otpRoutes = require('./otpmailer');
const otptest = require('./jwt');
const checkDataRoutes = require('./checkData');









const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ใช้ Router สำหรับการล็อกอิน
app.use('/login', loginRouter);
app.use('/loginjwt', loginjwtRouter);

app.use('/register', registerRouter);
app.use('/data', dataRouter);
app.use('/update_user', updateUserRouter);
app.use('/history', DetectHistoryRouter);
app.use('/readfile', fileRouter);
app.use('/pushNotification', notificationRouter);
app.use('/showNotifications', ShownotificationRouter);
app.use('/deleteHistory', deleteHistoryRouter);
app.use('/setThreshold', GroupRouter);
app.use('/tokenapi', tokenRoutes);
app.use('/otpmailer', otpRoutes);
app.use('/jwt', otptest);
app.use('/checkData', checkDataRoutes);













app.listen(port, () => {
    console.log('Server running on port ${port}');
});