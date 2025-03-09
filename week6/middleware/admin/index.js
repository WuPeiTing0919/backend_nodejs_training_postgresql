const { dataSource } = require('../../db/data-source');
const resStatus = require('../../utils/resStatus');
const mf = require("../../utils/isValid");

// 宣告會使用的 db 資料表
const user_db = dataSource.getRepository('User');
const coach_db = dataSource.getRepository('Coach');
const course_db = dataSource.getRepository('Course');
const skill_db = dataSource.getRepository('Skill');

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
// [HTTP 400] 資料填寫不完整異常
async function isvalidCourse(req, res, next) {
    const { id : user_id } = req.user;
    const {skill_id,name,description,
            start_at : startAt,end_at : endAt,
            max_participants} = req.body;

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

    next();
}

// [HTTP 400] 使用者不是教練
async function isvaliduserRole(req, res, next) {
    const { id : user_id } = req.user;
    
    const userData = await user_db.findOneBy({"id" : user_id});
    if (userData.role == "USER"){
        resStatus({
        res:res,
        status:400,
        message:"使用者尚未成為教練"
        });
        return;
    }

    next();
}

// [HTTP 409] 資料重複異常
async function isduplicateCourse(req, res, next) {
    const { id : user_id } = req.user;
    const {skill_id,
        start_at : startAt,end_at : endAt} = req.body;

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
// [HTTP 400] 資料填寫不完整異常
async function isvalidputCourse(req, res, next) {
    const courseId = req.params.courseId;
    const {skill_id,name,description,
        start_at : startAt,end_at : endAt,
        max_participants
    } = req.body;

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

    next();
}

// [HTTP 400] 在課程資料表，查無 courseId 的資料
async function isvalidcourseId(req, res, next) {
    const { id } = req.user;
    console.log(id);
    const courseId = req.params.courseId;

    const courseData = await course_db.findOneBy({"id" : courseId, "user_id": id });
    if (!courseData){
        resStatus({
        res:res,
        status:400,
        message:"課程不存在"
        });
        return;
    }

    next();
}

// [HTTP 400] 更新課程資料失敗
async function isupdateDataComplete(req, res, next) {
    const courseId = req.params.courseId;
    const {skill_id,name,description,
        start_at : startAt,end_at : endAt,
        max_participants,meeting_url
    } = req.body;

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
async function isvalidCoach(req, res, next) {
    const userId = req.params.userId;
    const {description,experience_years} = req.body;
    const validateError_String = mf.validateFields_String({ userId,description });
    const validateError_Int = mf.validateFields_Int({ experience_years });

    // [HTTP 400] 資料填寫不完整異常
    if(validateError_String !== null || validateError_Int !== null){
        resStatus({
        res:res,
        status:400,
        message:validateError_String || validateError_Int
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

// [HTTP 409] 使用者已經是教練
async function isvaliduserRole_COACH(req, res, next) {
    const {user_id} = req.body;
    
    const userData = await user_db.findOneBy({"id" : user_id});
    if (userData.role == "COACH"){
        resStatus({
        res:res,
        status:409,
        message:"使用者已經是教練"
        });
        return;
    }

    next();
}

// [HTTP 400] 更新使用者資料失敗
async function isupdateUserComplete(req, res, next) {
    const userId = req.params.userId;
    
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

module.exports = {
    isvalidCourse,
    isSDateEDateCompare,
    isvalidMeeting_url,
    isvaliduserID,
    isvaliduserRole,
    isvalidskillID,
    isduplicateCourse,
    isvalidputCourse,
    isvalidcourseId,
    isupdateDataComplete,
    isvalidCoach,
    isvalidProfileImage_url,
    isvaliduserRole_COACH,
    isupdateUserComplete
}