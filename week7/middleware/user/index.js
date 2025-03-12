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
async function postuserSignup(req, res, next) {
    const {name,email,password} = req.body;

    // [HTTP 400] 資料填寫不完整異常
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

    // [HTTP 409] 資料重複異常
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
async function postuserLogin(req, res, next) {
    const {email,password} = req.body;
    
    // [HTTP 400] 資料填寫不完整異常
    const validateError_String = mf.validateFields_String({ email,password });
    if(validateError_String !== null || mf.isValidEmail(email) || mf.isAlphanumeric(password)){
        resStatus({
        res:res,
        status:400,
        message: validateError_String || "欄位未填寫正確"
        });
        return
    }

    // [HTTP 400] 使用者不存在或密碼輸入錯誤
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
async function getuserProfile(req, res, next) {
    const {id} = req.user;
    
    // [HTTP 400] 資料填寫不完整異常
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
async function putuserProfile(req, res, next) {
    const {id} = req.user;
    const {name} = req.body;

    // [HTTP 400] 資料填寫不完整異常
    const validateError_String = mf.validateFields_String({ id,name });
    if(validateError_String !== null){
        resStatus({
        res:res,
        status:400,
        message:validateError_String
        });
        return
    }

    // [HTTP 400] 更新使用者資料失敗
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


// [PUT] 使用者更新密碼
async function putuserPassword(req, res, next) {
    const {id} = req.user;
    const {password,new_password,confirm_new_password} = req.body;
    
    // [HTTP 400] 資料填寫不完整異常
    const validateError_String = mf.validateFields_String({ password,new_password,confirm_new_password });
    if(validateError_String !== null){
        resStatus({
        res:res,
        status:400,
        message:validateError_String
        });
        return
    }

    // [HTTP 400] 密碼填寫不完整異常
    const validateError_Password = mf.validateFields_Password({ password,new_password,confirm_new_password });
    if(validateError_Password !== null){
        resStatus({
        res:res,
        status:400,
        message:validateError_Password
        });
        return
    }

    // [HTTP 400] 密碼輸入錯誤
    const existingUser = await user_db.findOne({
        select: ['password'],
        where: { id }
      });

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if(!isMatch){
        resStatus({
        res:res,
        status:400,
        message:"密碼輸入錯誤"
        });
        return
    }

    // [HTTP 400] 密碼與新密碼不能一致、新密碼和驗證密碼不相同
    if(password == new_password){
        resStatus({
        res:res,
        status:400,
        message:"新密碼不能與舊密碼相同"
        });
        return
    }

    if(confirm_new_password !== new_password){
        resStatus({
        res:res,
        status:400,
        message:"新密碼與驗證新密碼不一致"
        });
        return
    }

    // [HTTP 400] 更新密碼失敗
    const salt = await bcrypt.genSalt(10);
    const databasePassword = await bcrypt.hash(new_password, salt);
    const userUpdateName = await user_db.update(
        {"id" : id},
        {"password" : databasePassword}
    );
    if(userUpdateName.affected === 0){
        resStatus({
        res:res,
        status:400,
        message:"更新密碼失敗"
        });
        return;
    }


    next();
}


module.exports = {
    isvalidPassword,
    postuserSignup,
    postuserLogin,
    getuserProfile,
    putuserProfile,
    putuserPassword,
}