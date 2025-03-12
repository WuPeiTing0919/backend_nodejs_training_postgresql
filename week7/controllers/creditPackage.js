const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('CreditPackage');
const resStatus = require('../utils/resStatus');

// 宣告會使用的 db 資料表
const creditPackage_db = dataSource.getRepository('CreditPackage');
const creditPurchase_db = dataSource.getRepository('CreditPurchase');

// [GET] 取得購買方案列表
async function get_PurchasePlan(req, res, next){
    try{
        // 查詢資料
        const creditPackage_data = await creditPackage_db.find({
          select: ["id", "name", "credit_amount", "price"]
        });
    
        // [HTTP 200] 呈現資料
        resStatus({
          res:res,
          status:200,
          dbdata:creditPackage_data
        });
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
}

// [POST] 新增購買方案
async function post_addPurchasePlan(req, res, next){
    try{
        const {name,credit_amount,price} = req.body;

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
        
}

// [POST] 使用者購買方案
async function post_userPurchasePlan(req, res, next){
    try{
      const {id} = req.user;
      const creditPackage_Id = req.params.creditPackageId;
  
      const creditPackageData = await creditPackage_db.findOneBy({"id" : creditPackage_Id});
      // 上傳數據
      const newPost = creditPurchase_db.create({ 
        user_id : id,
        credit_package_id : creditPackage_Id,
        purchased_credits : creditPackageData.credit_amount,
        price_paid : creditPackageData.price,
        purchaseAt : new Date().toISOString()
        });
      await creditPurchase_db.save(newPost);
      
      // [HTTP 200] 呈現上傳後資料
      resStatus({
        res:res,
        status:200,
        dbdata: []
      });
  
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
        
}

// [DELETE] 刪除購買方案
async function delete_PurchasePlan(req, res, next){
    try{
        // [HTTP 200] 資料刪除成功
        resStatus({
          res:res,
          status:200
        });
      }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
      }  

}

module.exports = {
    get_PurchasePlan,
    post_addPurchasePlan,
    post_userPurchasePlan,
    delete_PurchasePlan
}