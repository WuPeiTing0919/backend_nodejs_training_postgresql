// 主要放置「課程組合包」相關的路由和 API
const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Coach');
const resStatus = require('../utils/resStatus');
const mf = require("../utils/isValid");

// 宣告會使用的 db 資料表
const coach_db = dataSource.getRepository('Coach');
const user_db = dataSource.getRepository('User');

// [GET] 取得教練列表
router.get('/', async (req, res, next) => {
    try{
        const per = req.query.per;
        const page = req.query.page;

        // [HTTP 400] 資料填寫不完整異常
        if(mf.isUndefined(per) || mf.isUndefined(page) || mf.isparseInt(per) || mf.isparseInt(page)){
            resStatus({
            res:res,
            status:400,
            method:"GET",
            message:"欄位未填寫正確"
            });
            return
        }

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
            method:"GET",
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
        
       // [HTTP 400] 資料填寫不完整異常
       if(mf.isUndefined(coachId) || mf.isNotValidSting(coachId)){
            resStatus({
            res:res,
            status:400,
            method:"GET",
            message:"欄位未填寫正確"
            });
            return
        }

        // [HTTP 400] 在教練資料表，查無 coachID 的資料
        let coachData = await coach_db.findOneBy({"id" : coachId});
        if (!coachData){
            resStatus({
            res:res,
            status:400,
            method:"GET",
            message:"找不到該教練"
            });
            return;
        }
        const userData = await user_db.findOneBy({"id" : coachData.user_id});
        
        // [HTTP 200] 呈現資料
        resStatus({
            res:res,
            status:200,
            method:"GET",
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