// 主要放置「課程組合包」相關的路由和 API
const express = require('express');

const router = express.Router();
const config = require('../config/index');
const { dataSource } = require('../db/data-source');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger')('User');
const resStatus = require('../utils/resStatus');

// 宣告會使用的 db 資料表
const user_db = dataSource.getRepository('User');

// JWT 的內容
const generateJWT = require('../utils/generateJWT');
const auth = require('../middleware/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: user_db,
    logger
  })

// middleware 的內容
const mw = require('../middleware/user/index');
const postuserSignup = [mw.isvalidUser,mw.isvalidPassword,mw.isduplicateEmail];
const postuserLogin = [mw.isvalidloginUser,mw.isvalidPassword,mw.isduplicateUser];
const getuserProfile = [mw.isvalidProfile];
const putuserProfile = [mw.isvalidputProfile,mw.isupdateProfileComplete];

// [POST] 使用者註冊
router.post('/signup',postuserSignup, async (req, res, next) => {
    try{
        const {name,email,password} = req.body;

        const salt = await bcrypt.genSalt(10);
        const databasePassword = await bcrypt.hash(password, salt);
        // 上傳數據
        const newPost = user_db.create({ 
            name,
	        email,
            "role" : "USER",
	        "password" : databasePassword
        });
        const user_data = await user_db.save(newPost);

        // [HTTP 201] 呈現上傳後資料
        resStatus({
            res:res,
            status:201,
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

// [POST] 使用者登入
router.post('/login',postuserLogin, async (req, res, next) => {
    try{
        const {email} = req.body;

        const user_data = await user_db.findOne({
            select : ['id', 'name', 'password'],
            where : { email }
        });

        const token = await generateJWT({
            id: user_data.id
        }, config.get('secret.jwtSecret'), {
            expiresIn: `${config.get('secret.jwtExpiresDay')}`
        })

        // [HTTP 201] 呈現上傳後資料
        resStatus({
            res:res,
            status:201,
            dbdata:{ 
                token,
                users: {
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

// [GET] 取得個人資料
router.get('/profile', auth,getuserProfile, async (req, res, next) => {
    try{
        const {id} = req.user;
        const user_data = await user_db.findOneBy({"id" : id });

        // [HTTP 201] 呈現資料
        resStatus({
            res:res,
            status:201,
            dbdata:{ 
                users: {
                    email : user_data.email,
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

// [PUT] 更新個人資料
router.put('/profile', auth,putuserProfile, async (req, res, next) => {
    try{
        // [HTTP 200] 呈現資料
        resStatus({
            res:res,
            status:200
        });
       
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
});


module.exports = router;