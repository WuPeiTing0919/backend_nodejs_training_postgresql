const { dataSource } = require('../db/data-source');
const resStatus = require('../utils/resStatus');
const logger = require('../utils/logger')('Skill');

// 宣告會使用的 db 資料表
const skill_db = dataSource.getRepository('Skill');

// [GET] 取得教練專長列表
async function get_coachingSkill(req, res, next){
    try{
        // 查詢資料
        const skill_data = await skill_db.find({
          select: ["id", "name"]
        });
    
        // [HTTP 200] 呈現資料
        resStatus({
          res:res,
          status:200,
          dbdata:skill_data
        });
    }catch(error){
      // [HTTP 500] 伺服器異常
      logger.error(error);
      next(error);
    }
}

// [POST] 新增教練專長
async function post_addcoachingSkill(req, res, next){
    try{
        const {name} = req.body;

        // 上傳數據
        const newPost = skill_db.create({ 
          name
         });
         const skill_data = await skill_db.save(newPost);
        
        // [HTTP 200] 呈現上傳後資料
        resStatus({
          res:res,
          status:200,
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
}

// [DELETE] 刪除教練專長
async function delete_addcoachingSkill(req, res, next){
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
    get_coachingSkill,
    post_addcoachingSkill,
    delete_addcoachingSkill
}