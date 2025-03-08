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
    
    /*
        規則 :
        1. 名字 : 
        > 可中文、英文、數字，不可有特殊符號和空白
        > 需在 2~10 字左右
        > 必填，須是文字格式

        2. Email :
        > 可英文、數字，須符合 email 格式
        > 必填，須是文字格式

        3. 密碼 :
        > 可英文、數字，須包含英文數字大小寫
        > 需在 8~16 字左右
        > 必填，須是文字格式
    */
    if(mf.isUndefined(name) || mf.isUndefined(email) || mf.isUndefined(password) 
    || mf.isNotValidSting(name) || mf.isNotValidSting(email) || mf.isNotValidSting(password)
    || mf.isAlphanumericChinese(name) || mf.isValidEmail(email) || mf.isAlphanumeric(password)
    || mf.controlDigitalRange(name,2,10)){
        resStatus({
        res:res,
        status:400,
        message:"欄位未填寫正確"
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
    
    if(mf.isUndefined(email) || mf.isUndefined(password) 
    || mf.isNotValidSting(email) || mf.isNotValidSting(password)
    || mf.isValidEmail(email) || mf.isAlphanumeric(password)){
        resStatus({
        res:res,
        status:400,
        message:"欄位未填寫正確"
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
    
    if(mf.isUndefined(id) || mf.isNotValidSting(id)){
        resStatus({
        res:res,
        status:400,
        message:"欄位未填寫正確"
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
    
    if(mf.isUndefined(id) || mf.isUndefined(name)
    || mf.isNotValidSting(id) || mf.isNotValidSting(name)){
        resStatus({
        res:res,
        status:400,
        message:"欄位未填寫正確"
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