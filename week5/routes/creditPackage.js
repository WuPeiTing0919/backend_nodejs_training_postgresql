// 主要放置「課程組合包」相關的路由和 API
const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('CreditPackage');
const resStatus = require('../utils/resStatus');
const mf = require("../utils/isValid");

// 宣告會使用的 db 資料表
const creditPackage_db = dataSource.getRepository('CreditPackage');

// [GET] 取得購買方案列表
router.get('/', async (req, res, next) => {
    try{
        // 查詢資料
        const creditPackage_data = await creditPackage_db.find({
          select: ["id", "name", "credit_amount", "price"]
        });
    
        // [HTTP 200] 呈現資料
        resStatus({
          res:res,
          status:200,
          method:"GET",
          dbdata:creditPackage_data
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
        const {name,credit_amount,price} = req.body;

        // [HTTP 400] 資料填寫不完整異常
        if(mf.isUndefined(name) || mf.isUndefined(credit_amount) || mf.isUndefined(price)
        || mf.isNotValidSting(name) || mf.isNotValidInteger(credit_amount) || mf.isNotValidInteger(price)){
            resStatus({
            res:res,
            status:400,
            method:"POST",
            message:"欄位未填寫正確"
          });
          return
        }

        // [HTTP 409] 資料重複異常
        const nameData = await creditPackage_db.findOneBy({"name" : name});
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
        const newPost = creditPackage_db.create({ 
          name,
          credit_amount,
          price
         });
        const creditPackage_data =await creditPackage_db.save(newPost);
        
        // [HTTP 200] 呈現上傳後資料
        resStatus({
          res:res,
          status:200,
          method:"GET",
          dbdata:{
            id: creditPackage_data.id,
            name: creditPackage_data.name,
            credit_amount: creditPackage_data.credit_amount,
            price: creditPackage_data.price
          }
        });

    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
        
});

// [DELETE] 刪除購買方案
router.delete('/:creditPackageId', async (req, res, next) => {
    try{
        // 抓取需要刪除的 ID 資料
        const creditPackage_Id = req.params.creditPackageId;
      
        // [HTTP 400] ID資料提供不完整異常
        if(mf.isUndefined(creditPackage_Id) || mf.isNotValidSting(creditPackage_Id)){
          resStatus({
            res:res,
            status:400,
            method:"DELETE",
            message:"ID錯誤"
          });
          return
        }
  
        // 刪除資料
        const result = await creditPackage_db.delete(creditPackage_Id);
  
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
