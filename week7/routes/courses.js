// 主要放置「課程組合包」相關的路由和 API
const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const config = require('../config/index');
const controller = require('../controllers/courses');
const logger = require('../utils/logger')('Course');

// 宣告會使用的 db 資料表
const user_db = dataSource.getRepository('User');

// JWT 的內容
const auth = require('../middleware/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: user_db,
    logger
  })

// middleware 的內容
const mw = require('../middleware/course/index');
const postCourse = [mw.isvalidCourse,mw.postCourse];
const deleteCourse = [mw.isvalidCourse,mw.deleteCourse];


// [GET] 取得課程列表
router.get('/', controller.get_coursesData);

// [POST] 報名課程
router.post('/:courseId',auth,postCourse, controller.post_registerCourse);

// [DELETE] 取消課程
router.delete('/:courseId',auth,deleteCourse, controller.delete_cancelCourse);

module.exports = router;
