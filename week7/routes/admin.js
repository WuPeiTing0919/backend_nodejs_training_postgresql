// 主要放置「課程組合包」相關的路由和 API
const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const config = require('../config/index');
const controller = require('../controllers/admin');
const logger = require('../utils/logger')('Admin');

// 宣告會使用的 db 資料表
const user_db = dataSource.getRepository('User');

// JWT 的內容
const auth = require('../middleware/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: user_db,
    logger
  })

// middleware 的內容
const mw = require('../middleware/admin/index');
const postCourse = [mw.isSDateEDateCompare,mw.isvalidMeeting_url,mw.isvaliduserID,mw.isvalidskillID,mw.postCourse];
const putCourse = [mw.isSDateEDateCompare,mw.isvalidMeeting_url,mw.isvalidskillID,mw.putCourse];
const postUsertoCOACH = [mw.isvalidProfileImage_url,mw.isvaliduserID,mw.postUsertoCOACH];
const getCoachCourse = [mw.isvaliduserID];
const getCoachCourseDetail = [mw.isvaliduserID,mw.getCoachCourse];
const putCoachProfile = [mw.isvaliduserID,mw.isvalidProfileImage_url,mw.putCoachProfile];
const getCoachProfile = [mw.isvaliduserID];
const getCoachRevenue = [mw.isvaliduserID,mw.getCoachRevenue];

// [POST] 新增教練課程資料
router.post('/coaches/courses',auth,postCourse, controller.post_addcoachingCourse);

// [PUT] 編輯教練課程資料
router.put('/coaches/courses/:courseId',auth,putCourse, controller.put_updatecoachingCourse);

// [POST] 將使用者新增為教練
router.post('/coaches/:userId',postUsertoCOACH, controller.post_userAddedcoach);

// [GET] 取得教練自己的課程列表
router.get('/coaches/courses',auth,getCoachCourse, controller.get_coachOwnCourse);

// [GET] 取得教練自己的課程詳細資料
router.get('/coaches/courses/:courseId',auth,getCoachCourseDetail, controller.get_coachOwnCourseDetail);

// [PUT] 變更教練資料
router.put('/coaches',auth,putCoachProfile, controller.put_coachProfile);

// [GET] 取得教練自己的詳細資料
router.get('/coaches',auth,getCoachProfile, controller.get_coachOwnDetails);

// [GET] 取得教練自己的月營收資料
router.get('/revenue',auth,getCoachRevenue, controller.get_coachRevenueInfo);

module.exports = router;