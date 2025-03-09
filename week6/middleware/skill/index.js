const { dataSource } = require('../../db/data-source');
const resStatus = require('../../utils/resStatus');
const mf = require("../../utils/isValid");

// 宣告會使用的 db 資料表
const skill_db = dataSource.getRepository('Skill');

// [POST] 新增教練專長
// [HTTP 400] 資料填寫不完整異常
async function isvalidSkill(req, res, next) {
    const {name} = req.body;
    const validateError_String = mf.validateFields_String({ name });

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

// [HTTP 409] 資料重複異常
async function isduplicateData(req, res, next){
    const {name} = req.body;

    const nameData = await skill_db.findOneBy({"name" : name});
    if (nameData){
        resStatus({
        res:res,
        status:409,
        message:"資料重複"
        });
        return;
    }

    next();
}

// [DELETE] 刪除教練專長
// [HTTP 400] ID資料提供不完整異常
async function isvalidSkillID(req, res, next) {
    // 抓取需要刪除的 ID 資料
    const skill_Id = req.params.skillId;
    const validateError_String = mf.validateFields_String({ skill_Id });

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

// [HTTP 400] ID資料提供不正確異常
async function isdeleteDataComplete(req, res, next) {
    const skill_Id = req.params.skillId;
    // 刪除資料
    const result = await skill_db.delete(skill_Id);

    // [HTTP 400] ID資料提供不正確異常
    if(result.affected === 0){
        resStatus({
        res:res,
        status:400,
        message:"ID錯誤"
        });
        return;
    }

    next();
}

module.exports = {
    isvalidSkill,
    isduplicateData,
    isvalidSkillID,
    isdeleteDataComplete
}