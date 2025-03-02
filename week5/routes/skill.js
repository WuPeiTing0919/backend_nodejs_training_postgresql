// 主要放置「課程組合包」相關的路由和 API
const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Skill');
const resStatus = require('../utils/resStatus');
const mf = require("../utils/isValid");

// 宣告會使用的 db 資料表
const skill_db = dataSource.getRepository('Skill');

// [GET] 取得教練專長列表
router.get('/', async (req, res, next) => {
    try{
        // 查詢資料
        const skill_data = await skill_db.find({
          select: ["id", "name"]
        });
    
        // [HTTP 200] 呈現資料
        resStatus({
          res:res,
          status:200,
          method:"GET",
          dbdata:skill_data
        });
    }catch(error){
      // [HTTP 500] 伺服器異常
      logger.error(error);
      next(error);
    }
});

// [POST] 新增購買方案
router.post('/', async (req, res, next) => {
    try{
        const {name} = req.body;
      
        // [HTTP 400] 資料填寫不完整異常
        if(mf.isUndefined(name) || mf.isNotValidSting(name)){
          resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"欄位未填寫正確"
          });
          return
        }

        // [HTTP 409] 資料重複異常
        const nameData = await skill_db.findOneBy({"name" : name});
        if (nameData){
          resStatus({
            res:res,
            status:409,
            method:"POST",
            message:"資料重複"
          });
          return;
        }

        // 上傳數據
        const newPost = skill_db.create({ 
          name
         });
         const skill_data = await skill_db.save(newPost);
        
        // [HTTP 200] 呈現上傳後資料
        resStatus({
          res:res,
          status:200,
          method:"GET",
          dbdata:{
            id : skill_data.id,
            name : skill_data.name
          }
        });

      }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
      }
});

// [DELETE] 刪除購買方案
router.delete('/:skillId', async (req, res, next) => {
    try{
        // 抓取需要刪除的 ID 資料
        const skill_Id = req.params.skillId;
      
        // [HTTP 400] ID資料提供不完整異常
        if(mf.isUndefined(skill_Id) || mf.isNotValidSting(skill_Id)){
          resStatus({
            res:res,
            status:400,
            method:"DELETE",
            message:"ID錯誤"
          });
          return
        }
  
        // 刪除資料
        const result = await skill_db.delete(skill_Id);
  
        // [HTTP 400] ID資料提供不正確異常
        if(result.affected === 0){
          resStatus({
            res:res,
            status:400,
            method:"DELETE",
            message:"ID錯誤"
          });
          return;
        }
        
        // [HTTP 200] 資料刪除成功
        resStatus({
          res:res,
          status:200,
          method:"DELETE"
        });
    }catch(error){
      // [HTTP 500] 伺服器異常
      logger.error(error);
      next(error);
    }
    

});

module.exports = router;
