const { dataSource } = require('../../db/data-source');
const resStatus = require('../../utils/resStatus');
const mf = require("../../utils/isValid");

const { IsNull } = require('typeorm');

// 宣告會使用的 db 資料表
const course_db = dataSource.getRepository('Course');
const courseBooking_db = dataSource.getRepository('CourseBooking');
const creditPurchase_db = dataSource.getRepository('CreditPurchase');

// 共用
// [HTTP 400] 資料填寫不完整異常
async function isvalidCourse(req, res, next) {
    const courseId = req.params.courseId;
    const validateError_String = mf.validateFields_String({ courseId });

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

// [POST] 報名課程
async function postCourse(req, res, next) {
    const {id} = req.user;
    const courseId = req.params.courseId;

    // [HTTP 400] 在課程資料表，查無 courseId 的資料
    const courseData = await course_db.findOneBy({"id" : courseId});
    if (!courseData){
        resStatus({
        res:res,
        status:400,
        message:"ID錯誤"
        });
        return;
    }

    // [HTTP 400] 已經報名過此課程
    const courseBooking = await courseBooking_db.findOneBy({"user_id" : id,"course_id" : courseId});
    if (courseBooking){
        resStatus({
        res:res,
        status:400,
        message:"已經報名過此課程"
        });
        return;
    }

    // [HTTP 400] 確認可用堂數、可報名人數
    const purchasedCredits = await creditPurchase_db.sum("purchased_credits",{"user_id" : id});
    const registeredClasses = await courseBooking_db.count({
        where: { course_id :courseId,cancelledAt : IsNull() }
    });
    const applicants = await courseBooking_db.count({
        where: { user_id : id,cancelledAt : IsNull() }
    });

    if(registeredClasses > courseData.max_participants){
        resStatus({
        res:res,
        status:400,
        message:"已達最大參加人數，無法參加"
        });
        return;
    }

    if(applicants >= purchasedCredits){
        resStatus({
        res:res,
        status:400,
        message:"已無可使用堂數"
        });
        return;
    }

    next();
}

// [DELETE] 取消課程
async function deleteCourse(req, res, next) {
    const {id} = req.user;
    const courseId = req.params.courseId;

    // [HTTP 400] 在預約課程資料表，查無 courseId 的資料
    const courseBookingData = await courseBooking_db.findOneBy({"course_id" : courseId});
    if (!courseBookingData){
        resStatus({
        res:res,
        status:400,
        message:"課程不存在"
        });
        return;
    }

    // [HTTP 400] 取消報名失敗
    // 更新數據
    const updatecourseBooking = await courseBooking_db.update(
        {"course_id" : courseId,"user_id" : id,cancelledAt : IsNull()},
        { 
            cancelledAt : new Date().toISOString()
        }
    );
    if(updatecourseBooking.affected === 0){
        resStatus({
        res:res,
        status:400,
        message:"取消報名失敗"
        });
        return;
    }

    next();
}

module.exports = {
    isvalidCourse,
    postCourse,
    deleteCourse
}