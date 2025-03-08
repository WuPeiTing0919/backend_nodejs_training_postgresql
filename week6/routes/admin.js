// 主要放置「課程組合包」相關的路由和 API
const express = require('express');

const router = express.Router();
const config = require('../config/index');
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Admin');
const resStatus = require('../utils/resStatus');

// 宣告會使用的 db 資料表
const user_db = dataSource.getRepository('User');
const coach_db = dataSource.getRepository('Coach');
const course_db = dataSource.getRepository('Course');

// JWT 的內容
const generateJWT = require('../utils/generateJWT');
const auth = require('../middleware/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: user_db,
    logger
  })

// middleware 的內容
const mw = require('../middleware/admin/index');
const postCourse = [
    mw.isvalidCourse,mw.isSDateEDateCompare,mw.isvalidMeeting_url,
    mw.isvaliduserID,mw.isvaliduserRole,mw.isvalidskillID,mw.isduplicateCourse
];
const putCourse = [
    mw.isvalidputCourse,mw.isSDateEDateCompare,mw.isvalidMeeting_url,
    mw.isvalidcourseId,mw.isvalidskillID,mw.isupdateDataComplete
];
const postUsertoCOACH = [
    mw.isvalidCoach,mw.isvalidProfileImage_url,mw.isvaliduserID,
    mw.isvaliduserRole_COACH,mw.isupdateUserComplete
];

// [POST] 新增教練課程資料
router.post('/coaches/courses',auth,postCourse, async (req, res, next) => {
    try{
        const { id : user_id } = req.user;
        const {skill_id,name,description,
                start_at : startAt,end_at : endAt,
                max_participants,meeting_url} = req.body;

        // 上傳數據
        const newPost = course_db.create({ 
            user_id,
            skill_id,
            name,
            description,
            startAt,
            endAt,
            max_participants,
            meeting_url
        });
        const saveCoach = await course_db.save(newPost);

        // [HTTP 201] 呈現上傳後資料
        resStatus({
            res:res,
            status:201,
            dbdata:{
                course: {
                    id: saveCoach.id,
                    user_id : saveCoach.user_id,
                    skill_id : saveCoach.skill_id,
                    name : saveCoach.name,
                    description : saveCoach.description,
                    start_at : saveCoach.startAt,
                    end_at : saveCoach.endAt,
                    max_participants : saveCoach.max_participants,
                    meeting_url : saveCoach.meeting_url,
                    created_at: saveCoach.createdAt,
                    updated_at: saveCoach.updatedAt
                }
            }
        });
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
});

// [PUT] 編輯教練課程資料
router.put('/coaches/courses/:courseId',auth,putCourse, async (req, res, next) => {
    try{
        const courseId = req.params.courseId;

        const saveCoach = await course_db.findOneBy({"id" : courseId});
        // [HTTP 200] 呈現更新後資料
        resStatus({
            res:res,
            status:200,
            dbdata:{
                course: {
                    id: saveCoach.id,
                    user_id : saveCoach.user_id,
                    skill_id : saveCoach.skill_id,
                    name : saveCoach.name,
                    description : saveCoach.description,
                    start_at : saveCoach.startAt,
                    end_at : saveCoach.endAt,
                    max_participants : saveCoach.max_participants,
                    meeting_url : saveCoach.meeting_url,
                    created_at: saveCoach.createdAt,
                    updated_at: saveCoach.updatedAt
                }
            }
        });
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
});

// [POST] 將使用者新增為教練
router.post('/coaches/:userId',postUsertoCOACH, async (req, res, next) => {
    try{
        const userId = req.params.userId;
        const {description,experience_years,profile_image_url} = req.body;

        // 上傳數據
        const newPost = coach_db.create({ 
            "user_id" : userId,
            experience_years,
            description,
            profile_image_url
        });
        const saveCoach = await coach_db.save(newPost);
        const saveUser = await user_db.findOneBy({"id" : userId});

        // [HTTP 201] 呈現上傳後資料
        resStatus({
            res:res,
            status:201,
            dbdata:{ 
                users: {
                    name : saveUser.name,
                    role : saveUser.role
                },
                coach : {
                    id : saveCoach.id,
                    user_id : saveCoach.user_id,
                    experience_years : saveCoach.experience_years,
                    description : saveCoach.description,
                    profile_image_url : saveCoach.profile_image_url,
                    created_at: saveCoach.createdAt,
                    updated_at: saveCoach.updatedAt
                }
            }
        });
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
});


module.exports = router;