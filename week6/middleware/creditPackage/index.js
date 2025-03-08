const { dataSource } = require('../../db/data-source');
const resStatus = require('../../utils/resStatus');
const mf = require("../../utils/isValid");

// 宣告會使用的 db 資料表
const creditPackage_db = dataSource.getRepository('CreditPackage');
const creditPurchase_db = dataSource.getRepository('CreditPurchase');

// 共用
// [HTTP 400] ID資料提供不完整異常
async function isvalidCreditPackageID(req, res, next) {
    // 抓取需要刪除的 ID 資料
    const creditPackage_Id = req.params.creditPackageId;
    
    if(mf.isUndefined(creditPackage_Id) || mf.isNotValidSting(creditPackage_Id)){
        resStatus({
        res:res,
        status:400,
        message:"ID錯誤"
        });
        return
    }

    next();
}

// [POST] 新增購買方案
// [HTTP 400] 資料填寫不完整異常
async function isvalidCreditPackage(req, res, next) {
    const {name,credit_amount,price} = req.body;

    if(mf.isUndefined(name) || mf.isUndefined(credit_amount) || mf.isUndefined(price)
    || mf.isNotValidSting(name) || mf.isNotValidInteger(credit_amount) || mf.isNotValidInteger(price)){
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
async function isduplicateData(req, res, next){
    const {name} = req.body;

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
// [HTTP 400] 找不到 CreditPackage 資料
async function isExistcreditPackage(req, res, next){
    const creditPackage_Id = req.params.creditPackageId;

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
// [HTTP 400] ID資料提供不正確異常
async function isdeleteDataComplete(req, res, next) {
    const creditPackage_Id = req.params.creditPackageId;
    // 刪除資料
    const result = await creditPackage_db.delete(creditPackage_Id);

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
    isvalidCreditPackage,
    isduplicateData,
    isvalidCreditPackageID,
    isdeleteDataComplete,
    isExistcreditPackage
}