// 主要放置「使用者」相關的路由和 API
const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const config = require('../config/index');
const controller = require('../controllers/user');
const logger = require('../utils/logger')('User');

// 宣告會使用的 db 資料表
const user_db = dataSource.getRepository('User');

// JWT 的內容
const auth = require('../middleware/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: user_db,
    logger
  })

// middleware 的內容
const mw = require('../middleware/user/index');
const postuserSignup = [mw.isvalidPassword,mw.postuserSignup]
const postuserLogin = [mw.isvalidPassword,mw.postuserLogin];
const getuserProfile = mw.getuserProfile;
const putuserProfile = mw.putuserProfile;
const putuserPassword = mw.putuserPassword;

// [POST] 使用者註冊
router.post('/signup',postuserSignup, controller.post_UserRegistration);

// [POST] 使用者登入
router.post('/login',postuserLogin, controller.post_UserLogin);

// [GET] 取得個人資料
router.get('/profile', auth,getuserProfile, controller.get_personalInfo);

// [PUT] 更新個人資料
router.put('/profile', auth,putuserProfile, controller.put_updateProfile);

// [PUT] 使用者更新密碼
router.put('/password', auth,putuserPassword, controller.put_updatePassword);

// [GET] 取得使用者已購買的方案列表
router.get('/credit-package', auth, controller.get_usercreditPackage);

// [GET] 取得已預約的課程列表
router.get('/courses', auth, controller.get_scheduledCourses);


module.exports = router;