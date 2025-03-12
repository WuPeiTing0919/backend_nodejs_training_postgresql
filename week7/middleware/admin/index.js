const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const { dataSource } = require('../../db/data-source');
const resStatus = require('../../utils/resStatus');
const mf = require("../../utils/isValid");

// 宣告會使用的 db 資料表
const user_db = dataSource.getRepository('User');
const course_db = dataSource.getRepository('Course');
const skill_db = dataSource.getRepository('Skill');

dayjs.extend(utc)
const monthMap = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12
}

// 共用項目
// [HTTP 400] 開始日期不可大於結束日期
async function isSDateEDateCompare(req, res, next) {
    const {start_at : startAt,end_at : endAt} = req.body;
    
    if(mf.isSDataEDataCompare(startAt,endAt)){
        resStatus({
        res:res,
        status:400,
        message:"課程開始日期不能大於課程結束日期"
        });
        return
    }

    next();
}

// [HTTP 400] 課程網址資料填寫不完整異常
async function isvalidMeeting_url(req, res, next) {
    const {meeting_url} = req.body;
    
    if(meeting_url && mf.isInvalidURL(meeting_url)){
        resStatus({
        res:res,
        status:400,
        message:"欄位未填寫正確"
        });
        return
    }

    next();
}

// [HTTP 400] 圖片資料填寫不完整異常
async function isvalidProfileImage_url(req, res, next) {
    const {profile_image_url} = req.body;
    
    if(profile_image_url && mf.isValidImageUrl(profile_image_url)){
        resStatus({
        res:res,
        status:400,
        message:"欄位未填寫正確"
        });
        return
    }

    next();
}


// [HTTP 400] 在使用者資料表，查無 userID 的資料
async function isvaliduserID(req, res, next) {
    const {user_id} = req.body;
    
    const userData = await user_db.findOneBy({"id" : user_id});
    if (!userData){
        resStatus({
        res:res,
        status:400,
        message:"使用者不存在"
        });
        return;
    }

    next();
}

// [HTTP 400] 在教練技能資料表，查無 skillID 的資料
async function isvalidskillID(req, res, next) {
    const {skill_id} = req.body;
    
    const skillData = await skill_db.findOneBy({"id" : skill_id});
    if (!skillData){
        resStatus({
        res:res,
        status:400,
        message:"此技能不存在"
        });
        return;
    }

    next();
}

// [POST] 新增教練課程資料
async function postCourse(req, res, next) {
    const { id : user_id } = req.user;
    const {skill_id,name,description,
            start_at : startAt,end_at : endAt,
            max_participants} = req.body;

    // [HTTP 400] 資料填寫不完整異常
    const validateError_String = mf.validateFields_String({ user_id,skill_id,name,description });
    const validateError_Int = mf.validateFields_Int({ max_participants });
    const validateError_Date = mf.validateFields_Date({ startAt,endAt });
    if(validateError_String !== null || validateError_Int !== null || validateError_Date !== null){
        resStatus({
        res:res,
        status:400,
        message:validateError_String || validateError_Int || validateError_Date
        });
        return
    }

    // [HTTP 400] 使用者不是教練
    const userData = await user_db.findOneBy({"id" : user_id});
    if (userData.role == "USER"){
        resStatus({
        res:res,
        status:400,
        message:"使用者尚未成為教練"
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
        message:"資料重複"
        });
        return;
    }

    next();
}

// [PUT] 編輯教練課程資料
async function putCourse(req, res, next) {
    const { id } = req.user;
    const courseId = req.params.courseId;
    const {skill_id,name,description,
        start_at : startAt,end_at : endAt,
        max_participants
    } = req.body;

    // [HTTP 400] 資料填寫不完整異常
    const validateError_String = mf.validateFields_String({ courseId,skill_id,name,description });
    const validateError_Int = mf.validateFields_Int({ max_participants });
    const validateError_Date = mf.validateFields_Date({ startAt,endAt });
    if(validateError_String !== null || validateError_Int !== null || validateError_Date !== null){
        resStatus({
        res:res,
        status:400,
        message:validateError_String || validateError_Int || validateError_Date
        });
        return
    }

    // [HTTP 400] 在課程資料表，查無 courseId 的資料
    const courseData = await course_db.findOneBy({"id" : courseId, "user_id": id });
    if (!courseData){
        resStatus({
        res:res,
        status:400,
        message:"課程不存在"
        });
        return;
    }

    // [HTTP 400] 更新課程資料失敗
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

    if(updateCourse.affected === 0){
        resStatus({
        res:res,
        status:400,
        message:"更新課程失敗"
        });
        return;
    }

    next();
}

// [POST] 將使用者新增為教練
async function postUsertoCOACH(req, res, next) {
    const userId = req.params.userId;
    const {user_id,description,experience_years} = req.body;

    // [HTTP 400] 資料填寫不完整異常
    const validateError_String = mf.validateFields_String({ userId,description });
    const validateError_Int = mf.validateFields_Int({ experience_years });
    if(validateError_String !== null || validateError_Int !== null){
        resStatus({
        res:res,
        status:400,
        message:validateError_String || validateError_Int
        });
        return
    }
    
    // [HTTP 409] 使用者已經是教練
    const userData = await user_db.findOneBy({"id" : user_id});
    if (userData.role == "COACH"){
        resStatus({
        res:res,
        status:409,
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
        message:"更新使用者失敗"
        });
        return;
    }

    next();
}

// [GET] 取得教練自己的課程詳細資料
async function getCoachCourse(req, res, next) {
    const {id} = req.user;
    const courseId = req.params.courseId;

    // [HTTP 400] 資料填寫不完整異常
    const validateError_String = mf.validateFields_String({ id,courseId });
    if(validateError_String !== null){
        resStatus({
        res:res,
        status:400,
        message:validateError_String
        });
        return
    }

    next();
}

// [PUT] 變更教練資料
async function putCoachProfile(req, res, next) {
    const {id} = req.user;
    const {experience_years,description,skill_ids} = req.body;

    // [HTTP 400] 資料填寫不完整異常
    const validateError_String = mf.validateFields_String({ id,description });
    const validateError_Int = mf.validateFields_Int({ experience_years });
    if(validateError_String !== null || validateError_Int !== null
    || mf.isUndefined(skill_ids) || !Array.isArray(skill_ids)
    ){
        resStatus({
        res:res,
        status:400,
        message:validateError_String || validateError_Int || "欄位 skill_ids 未填寫正確"
        });
        return
    }

    if (skill_ids.length === 0 || skill_ids.every(skill => mf.isUndefined(skill) || mf.isNotValidString(skill))) {
        resStatus({
        res:res,
        status:400,
        message:"欄位 skill_ids 未填寫正確"
        });
        return
    }

    // [HTTP 400] 在教練技能資料表，查無 skillID 的資料
    for(let i = 0 ; i < skill_ids.length; i++){
        let skillData = await skill_db.findOneBy({"id" : skill_ids[i]});
        if (!skillData){
            resStatus({
            res:res,
            status:400,
            message:`第 ${i+1} 項技能不存在`
            });
            return;
        }
    }

    next();
}

// [GET] 取得教練自己的月營收資料
async function getCoachRevenue(req, res, next) {
    const month = req.query.month;

    // [HTTP 400] 資料填寫不完整異常
    if(mf.isUndefined(month) || !Object.prototype.hasOwnProperty.call(monthMap, month)){
        resStatus({
        res:res,
        status:400,
        message:"欄位未填寫正確"
        });
        return
    }

    next();
}

module.exports = {
    isSDateEDateCompare,
    isvalidMeeting_url,
    isvaliduserID,
    isvalidskillID,
    isvalidProfileImage_url,
    postCourse,
    putCourse,
    postUsertoCOACH,
    getCoachCourse,
    putCoachProfile,
    getCoachRevenue
}