const { dataSource } = require('../../db/data-source');
const resStatus = require('../../utils/resStatus');
const mf = require("../../utils/isValid");

// 宣告會使用的 db 資料表
const coach_db = dataSource.getRepository('Coach');

// 共用
// [HTTP 400] 資料填寫不完整異常
async function isvalidgetCoachDetail(req, res, next) {
    const coachId = req.params.coachId;
    const validateError_String = mf.validateFields_String({ coachId });

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

// [HTTP 400] 在教練資料表，查無 coachID 的資料
async function isvalidgetCoachID(req, res, next) {
    const coachId = req.params.coachId;

    const coachData = await coach_db.findOneBy({"id" : coachId});
    if (!coachData){
        resStatus({
        res:res,
        status:400,
        message:"找不到該教練"
        });
        return;
    }

    next();
}

// [GET] 取得教練列表
async function getCoach(req, res, next) {
    const per = req.query.per;
    const page = req.query.page;

    // [HTTP 400] 資料填寫不完整異常
    if(mf.isUndefined(per) || mf.isUndefined(page) || mf.isparseInt(per) || mf.isparseInt(page)){
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
    isvalidgetCoachDetail,
    isvalidgetCoachID,
    getCoach
}