const { dataSource } = require('../../db/data-source');
const resStatus = require('../../utils/resStatus');
const mf = require("../../utils/isValid");

// 宣告會使用的 db 資料表
const creditPackage_db = dataSource.getRepository('CreditPackage');

// 共用
// [HTTP 400] ID資料提供不完整異常
async function isvalidCreditPackageID(req, res, next) {
    // 抓取需要刪除的 ID 資料
    const creditPackage_Id = req.params.creditPackageId;
    const validateError_String = mf.validateFields_String({ creditPackage_Id });
    
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

// [POST] 新增購買方案
async function postAddcreditPackage(req, res, next) {
    const {name,credit_amount,price} = req.body;

    // [HTTP 400] 資料填寫不完整異常
    const validateError_String = mf.validateFields_String({ name });
    const validateError_Integer = mf.validateFields_Int({ credit_amount,price });
    if(validateError_String !== null || validateError_Integer !== null){
        resStatus({
        res:res,
        status:400,
        message: validateError_String || validateError_Integer
        });
        return
    }

    // [HTTP 409] 資料重複異常
    const nameData = await creditPackage_db.findOneBy({"name" : name});
    if (nameData){
      resStatus({
        res:res,
        status:409,
        message:"資料重複"
      });
      return;
    }

    next();
}

// [POST] 使用者購買方案
async function postAddcreditPurchase(req, res, next){
    const creditPackage_Id = req.params.creditPackageId;

    // [HTTP 400] 找不到 CreditPackage 資料
    const creditPackageData = await creditPackage_db.findOneBy({"id" : creditPackage_Id});
    if (!creditPackageData){
      resStatus({
        res:res,
        status:400,
        message:"ID錯誤"
      });
      return;
    }

    next();
}

// [DELETE] 刪除購買方案
async function deletecreditPackage(req, res, next) {
    const creditPackage_Id = req.params.creditPackageId;
    // 刪除資料
    const result = await creditPackage_db.delete(creditPackage_Id);
    // [HTTP 400] ID資料提供不正確異常
    if(result.affected === 0){
        resStatus({
        res:res,
        status:400,
        message:"ID錯誤"
        });
        return;
    }

    next();
}

module.exports = {
    isvalidCreditPackageID,
    postAddcreditPackage,
    postAddcreditPurchase,
    deletecreditPackage
}