// 主要放置「課程組合包」相關的路由和 API
const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const config = require('../config/index');
const controller = require('../controllers/creditPackage');
const logger = require('../utils/logger')('CreditPackage');
const user_db = dataSource.getRepository('User');

// JWT 的內容
const auth = require('../middleware/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: user_db,
    logger
})

// middleware 的內容
const mw = require('../middleware/creditPackage/index');
const postAddcreditPackage = mw.postAddcreditPackage;
const postAddcreditPurchase = [mw.isvalidCreditPackageID,mw.postAddcreditPurchase];
const deletecreditPackage = [mw.isvalidCreditPackageID,mw.deletecreditPackage];

// [GET] 取得購買方案列表
router.get('/',controller.get_PurchasePlan );

// [POST] 新增購買方案
router.post('/',postAddcreditPackage,controller.post_addPurchasePlan);

// [POST] 使用者購買方案
router.post('/:creditPackageId',auth,postAddcreditPurchase, controller.post_userPurchasePlan);

// [DELETE] 刪除購買方案
router.delete('/:creditPackageId',deletecreditPackage, controller.delete_PurchasePlan);

module.exports = router;
