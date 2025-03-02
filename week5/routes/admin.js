// 主要放置「課程組合包」相關的路由和 API
const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Admin');
const resStatus = require('../utils/resStatus');
const mf = require("../utils/isValid");

// 宣告會使用的 db 資料表
const user_db = dataSource.getRepository('User');
const coach_db = dataSource.getRepository('Coach');
const course_db = dataSource.getRepository('Course');
const skill_db = dataSource.getRepository('Skill');

// [POST] 新增教練課程資料
router.post('/coaches/courses', async (req, res, next) => {
    try{
        const {user_id,skill_id,name,description,
                start_at : startAt,end_at : endAt,
                max_participants,meeting_url} = req.body;

        // [HTTP 400] 資料填寫不完整異常
        if(mf.isUndefined(user_id) || mf.isUndefined(skill_id) || mf.isUndefined(name)
        || mf.isUndefined(description) || mf.isUndefined(startAt) || mf.isUndefined(endAt) || mf.isUndefined(max_participants)
        || mf.isNotValidSting(user_id) || mf.isNotValidSting(skill_id) || mf.isNotValidSting(name)
        || mf.isNotValidSting(description) || mf.isValidDate(startAt) || mf.isValidDate(endAt) || mf.isNotValidInteger(max_participants)){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"欄位未填寫正確"
            });
            return
        }

        if(mf.isSDataEDataCompare(startAt,endAt)){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"課程開始日期不能大於課程結束日期"
            });
            return
        }

        // [HTTP 400] 課程網址資料填寫不完整異常
        if(meeting_url && mf.isInvalidURL(meeting_url)){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"欄位未填寫正確"
            });
            return
        }

        // [HTTP 400] 在使用者資料表，查無 userID 的資料
        const userData = await user_db.findOneBy({"id" : user_id});
        if (!userData){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"使用者不存在"
            });
            return;
        }

        // [HTTP 400] 使用者不是教練
        if (userData.role == "USER"){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"使用者尚未成為教練"
            });
            return;
        }

        // [HTTP 400] 在教練技能資料表，查無 skillID 的資料
        const skillData = await skill_db.findOneBy({"id" : skill_id});
        if (!skillData){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"此技能不存在"
            });
            return;
        }

        // [HTTP 409] 資料重複異常
        const courseData = await course_db.findOneBy({
            user_id,
            skill_id,
            startAt,
            endAt
        });
        if (courseData){
            resStatus({
            res:res,
            status:409,
            method:"POST",
            message:"資料重複"
            });
            return;
        }

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
            method:"GET",
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
router.put('/coaches/courses/:courseId', async (req, res, next) => {
    try{
        const courseId = req.params.courseId;
        const {skill_id,name,description,
            start_at : startAt,end_at : endAt,
            max_participants,meeting_url
        } = req.body;

        // [HTTP 400] 資料填寫不完整異常
        if(mf.isUndefined(courseId) || mf.isUndefined(skill_id) || mf.isUndefined(name)
        || mf.isUndefined(description) || mf.isUndefined(startAt) || mf.isUndefined(endAt) || mf.isUndefined(max_participants)
        || mf.isNotValidSting(courseId) || mf.isNotValidSting(skill_id) || mf.isNotValidSting(name)
        || mf.isNotValidSting(description) || mf.isValidDate(startAt) || mf.isValidDate(endAt) || mf.isNotValidInteger(max_participants)){
            resStatus({
            res:res,
            status:400,
            method:"PUT",
            message:"欄位未填寫正確"
            });
            return
        }

        if(mf.isSDataEDataCompare(startAt,endAt)){
            resStatus({
            res:res,
            status:400,
            method:"PUT",
            message:"課程開始日期不能大於課程結束日期"
            });
            return
        }

        // [HTTP 400] 課程網址資料填寫不完整異常
        if(meeting_url && mf.isInvalidURL(meeting_url)){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"欄位未填寫正確"
            });
            return
        }

        // [HTTP 400] 在使用者資料表，查無 userID 的資料
        const courseData = await course_db.findOneBy({"id" : courseId});
        if (!courseData){
            resStatus({
            res:res,
            status:400,
            method:"PUT",
            message:"課程不存在"
            });
            return;
        }

        // [HTTP 400] 在教練技能資料表，查無 skillID 的資料
        const skillData = await skill_db.findOneBy({"id" : skill_id});
        if (!skillData){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"此技能不存在"
            });
            return;
        }

        // 更新數據
        const updateCourse = await course_db.update(
            {"id" : courseId},
            { 
                skill_id,
                name,
                description,
                startAt,
                endAt,
                max_participants,
                meeting_url
            }
        );
        // [HTTP 400] 更新課程資料失敗
        if(updateCourse.affected === 0){
            resStatus({
            res:res,
            status:400,
            method:"PUT",
            message:"更新課程失敗"
            });
            return;
        }

        const saveCoach = await course_db.findOneBy({"id" : courseId});
        // [HTTP 200] 呈現更新後資料
        resStatus({
            res:res,
            status:200,
            method:"GET",
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
router.post('/coaches/:userId', async (req, res, next) => {
    try{
        const userId = req.params.userId;
        const {description,experience_years,profile_image_url} = req.body;

        // [HTTP 400] 資料填寫不完整異常
        if(mf.isUndefined(userId) || mf.isUndefined(description) || mf.isUndefined(experience_years)
        || mf.isNotValidSting(userId) || mf.isNotValidInteger(experience_years)){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"欄位未填寫正確"
            });
            return
        }

        // [HTTP 400] 圖片資料填寫不完整異常
        if(profile_image_url && mf.isValidImageUrl(profile_image_url)){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"欄位未填寫正確"
            });
            return
        }

        // [HTTP 400] 在使用者資料表，查無 userID 的資料
        const userData = await user_db.findOneBy({"id" : userId});
        if (!userData){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"使用者不存在"
            });
            return;
        }

        // [HTTP 409] 使用者已經是教練
        if (userData.role == "COACH"){
            resStatus({
            res:res,
            status:409,
            method:"POST",
            message:"使用者已經是教練"
            });
            return;
        }

        // [HTTP 400] 更新使用者資料失敗
        const userUpdateRole = await user_db.update(
            {"id" : userId,"role" : "USER"},
            {"role" : "COACH"}
        );
        if(userUpdateRole.affected === 0){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"更新使用者失敗"
            });
            return;
        }

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
            method:"GET",
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