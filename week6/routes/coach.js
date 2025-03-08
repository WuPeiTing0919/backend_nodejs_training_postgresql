// 主要放置「課程組合包」相關的路由和 API
const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Coach');
const resStatus = require('../utils/resStatus');
const mf = require("../utils/isValid");

// middleware 的內容
const mw = require('../middleware/coach/index');
const getCoach = [mw.isvalidgetCoach];


// 宣告會使用的 db 資料表
const coach_db = dataSource.getRepository('Coach');
const user_db = dataSource.getRepository('User');

// [GET] 取得教練列表
router.get('/',getCoach, async (req, res, next) => {
    try{
        const per = req.query.per;
        const page = req.query.page;

        // 查詢資料
        const coach_data = await coach_db
            .createQueryBuilder("Coach")
            .innerJoinAndSelect("Coach.User", "User")  
            .select(["Coach.id", "User.name"]) 
            .take(Number(per))  // 分頁：每頁數量
            .skip(Number((page - 1) * per))  // 分頁：偏移量
            .getMany();  // 執行查詢並返回結果

        const formattedData = coach_data.map(coach => ({
            id: coach.id,
            name: coach.User.name
        }));
        
        // [HTTP 200] 呈現資料
        resStatus({
            res:res,
            status:200,
            dbdata:formattedData
        });
       
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }

});

// [GET] 取得教練詳細資訊
router.get('/:coachId', async (req, res, next) => {
    try{
        const coachId = req.params.coachId;

        const coachData = await coach_db.findOneBy({"id" : coachId});
        const userData = await user_db.findOneBy({"id" : coachData.user_id});
        // [HTTP 200] 呈現資料
        resStatus({
            res:res,
            status:200,
            dbdata:{ 
                users: {
                    name : userData.name,
                    role : userData.role
                },
                coach : {
                    id : coachData.id,
                    user_id : coachData.user_id,
                    experience_years : coachData.experience_years,
                    description : coachData.description,
                    profile_image_url : coachData.profile_image_url,
                    created_at: coachData.createdAt,
                    updated_at: coachData.updatedAt
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