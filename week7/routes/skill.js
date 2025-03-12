// 主要放置「教練技能」相關的路由和 API
const express = require('express');

const router = express.Router();
const controller = require('../controllers/skill');

// middleware 的內容
const mw = require('../middleware/skill/index');
const postAddSkill = mw.postAddSkill;
const deleteSkill = mw.deleteSkill;

// [GET] 取得教練專長列表
router.get('/', controller.get_coachingSkill);

// [POST] 新增教練專長
router.post('/',postAddSkill, controller.post_addcoachingSkill);

// [DELETE] 刪除教練專長
router.delete('/:skillId',deleteSkill, controller.delete_addcoachingSkill);

module.exports = router;
