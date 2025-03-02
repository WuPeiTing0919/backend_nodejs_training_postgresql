// 主要放置「課程組合包」相關的路由和 API
const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('User');
const resStatus = require('../utils/resStatus');
const mf = require("../utils/isValid");

// 宣告會使用的 db 資料表
const user_db = dataSource.getRepository('User');

// [POST] 使用者註冊
router.post('/signup', async (req, res, next) => {
    try{
        const {name,email,password} = req.body;

        // [HTTP 400] 資料填寫不完整異常
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
            method:"POST",
            message:"欄位未填寫正確"
            });
            return
        }

        // [HTTP 400] 密碼填寫不完整異常
        if(mf.controlDigitalRange(password,8,16) || mf.containsLetterAndNumber(password)){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
            });
            return
        }

        // [HTTP 409] 資料重複異常
        const emailData = await user_db.findOneBy({"email" : email});
        if (emailData){
            resStatus({
            res:res,
            status:409,
            method:"POST",
            message:"Email已被使用"
            });
            return;
        }

        // 上傳數據
        const newPost = user_db.create({ 
            name,
	        email,
            "role" : "USER",
	        password
        });
        const user_data = await user_db.save(newPost);

        // [HTTP 201] 呈現上傳後資料
        resStatus({
            res:res,
            status:201,
            method:"GET",
            dbdata:{ 
                users: {
                    id : user_data.id,
                    name : user_data.name
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