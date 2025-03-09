const { dataSource } = require('../../db/data-source');
const resStatus = require('../../utils/resStatus');
const mf = require("../../utils/isValid");
const bcrypt = require('bcrypt');

// 宣告會使用的 db 資料表
const user_db = dataSource.getRepository('User');

// 公用
// [HTTP 400] 密碼填寫不完整異常
async function isvalidPassword(req, res, next){
    const {password} = req.body;

    if(mf.controlDigitalRange(password,8,16) || mf.containsLetterAndNumber(password)){
        resStatus({
        res:res,
        status:400,
        message:"密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        });
        return
    }

    next();
}

// [POST] 使用者註冊
// [HTTP 400] 資料填寫不完整異常
async function isvalidUser(req, res, next) {
    const {name,email,password} = req.body;
    const validateError_String = mf.validateFields_String({ name,email,password });

    if(validateError_String !== null
    || mf.isAlphanumericChinese(name) || mf.isValidEmail(email) || mf.isAlphanumeric(password)
    || mf.controlDigitalRange(name,2,10)){
        resStatus({
        res:res,
        status:400,
        message: validateError_String || "欄位未填寫正確"
        });
        return
    }

    next();
}

// [HTTP 409] 資料重複異常
async function isduplicateEmail(req, res, next){
    const {email} = req.body;

    const emailData = await user_db.findOneBy({"email" : email});
    if (emailData){
        resStatus({
        res:res,
        status:409,
        message:"Email已被使用"
        });
        return;
    }

    next();
}

// [POST] 使用者登入
// [HTTP 400] 資料填寫不完整異常
async function isvalidloginUser(req, res, next) {
    const {email,password} = req.body;
    const validateError_String = mf.validateFields_String({ email,password });
    
    if(validateError_String !== null || mf.isValidEmail(email) || mf.isAlphanumeric(password)){
        resStatus({
        res:res,
        status:400,
        message: validateError_String || "欄位未填寫正確"
        });
        return
    }

    next();
}

// [HTTP 400] 使用者不存在或密碼輸入錯誤
async function isduplicateUser(req, res, next){
    const {email,password} = req.body;

    const emailData = await user_db.findOne({
        select : ['id', 'name', 'password'],
        where : { email }
    });

    if (!emailData){
        resStatus({
        res:res,
        status:400,
        message:"使用者不存在或密碼輸入錯誤"
        });
        return;
    }

    const isMatch = await bcrypt.compare(password, emailData.password);
    if (!isMatch){
        resStatus({
        res:res,
        status:400,
        message:"使用者不存在或密碼輸入錯誤"
        });
        return;
    }

    next();
}

// [GET] 取得個人資料
// [HTTP 400] 資料填寫不完整異常
async function isvalidProfile(req, res, next) {
    const {id} = req.user;
    const validateError_String = mf.validateFields_String({ id });
    
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

// [PUT] 更新個人資料
// [HTTP 400] 資料填寫不完整異常
async function isvalidputProfile(req, res, next) {
    const {id} = req.user;
    const {name} = req.body;
    const validateError_String = mf.validateFields_String({ id,name });
    
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

// [HTTP 400] 更新使用者資料失敗
async function isupdateProfileComplete(req, res, next) {
    const {id} = req.user;
    const {name} = req.body;
    
    const userUpdateName = await user_db.update(
        {"id" : id},
        {"name" : name}
    );
    if(userUpdateName.affected === 0){
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
    isvalidUser,
    isvalidPassword,
    isduplicateEmail,
    isvalidloginUser,
    isduplicateUser,
    isvalidProfile,
    isvalidputProfile,
    isupdateProfileComplete
}