// 主要放置「課程組合包」相關的路由和 API
const express = require('express');

const router = express.Router();
const controller = require('../controllers/coach');

// middleware 的內容
const mw = require('../middleware/coach/index');
const getCoach = mw.getCoach;
const getCoachDetail = [mw.isvalidgetCoachID,mw.isvalidgetCoachDetail];
const getCoachCourses = getCoachDetail;

// [GET] 取得教練列表
router.get('/',getCoach, controller.get_coachesDate);

// [GET] 取得教練詳細資訊
router.get('/:coachId',getCoachDetail, controller.get_coachDetails);

// [GET] 取得指定教練課程列表
router.get('/:coachId/courses',getCoachCourses, controller.get_coachingCourses);

module.exports = router;