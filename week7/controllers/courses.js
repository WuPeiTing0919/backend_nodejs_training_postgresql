const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Course');
const resStatus = require('../utils/resStatus');

const course_db = dataSource.getRepository('Course');
const courseBooking_db = dataSource.getRepository('CourseBooking');

// [GET] 取得課程列表
async function get_coursesData(req, res, next){
    try{

        // 查詢資料
        const course_data = await course_db
            .createQueryBuilder("Course")
            .innerJoinAndSelect("Course.User", "User")  
            .innerJoinAndSelect("Course.Skill", "Skill")  
            .select(["Course.id", "User.name","Skill.name","Course.name"
                    ,"Course.description","Course.startAt","Course.endAt","Course.max_participants"
            ]) 
            .getMany();  // 執行查詢並返回結果
    
        const formattedData = course_data.map(coach => ({
            id: coach.id,
			      coach_name : coach.User.name,
			      skill_name : coach.Skill.name,
			      name : coach.name,
			      description : coach.description,
			      start_at : coach.startAt,
			      end_at : coach.endAt,
			      max_participants : coach.max_participants
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
}

// [POST] 報名課程
async function post_registerCourse(req, res, next){
    try {
      const {id} = req.user;
      const courseId = req.params.courseId;

      // 上傳數據
      const newPost = courseBooking_db.create({ 
        user_id : id,
        course_id : courseId
      });
      await courseBooking_db.save(newPost);

      // [HTTP 200] 呈現資料
      resStatus({
        res:res,
        status:200,
        dbdata:[]
      });

    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
}

// [DELETE] 取消課程
async function delete_cancelCourse(req, res, next){
    try {
      // [HTTP 200] 呈現資料
      resStatus({
        res:res,
        status:200,
        dbdata:[]
      });
  
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
  }

module.exports = {
    get_coursesData,
    post_registerCourse,
    delete_cancelCourse
}