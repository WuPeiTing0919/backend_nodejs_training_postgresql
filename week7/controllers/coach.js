const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Coach');
const resStatus = require('../utils/resStatus');

// 宣告會使用的 db 資料表
const coach_db = dataSource.getRepository('Coach');
const user_db = dataSource.getRepository('User');
const course_db = dataSource.getRepository('Course');


// [GET] 取得教練列表
async function get_coachesDate(req, res, next){
    try{
        const per = req.query.per;
        const page = req.query.page;

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
            dbdata:formattedData
        });
       
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }

}

// [GET] 取得教練詳細資訊
async function get_coachDetails(req, res, next){
    try{
        const coachId = req.params.coachId;

        const coachData = await coach_db.findOneBy({"id" : coachId});
        const userData = await user_db.findOneBy({"id" : coachData.user_id});
        // [HTTP 200] 呈現資料
        resStatus({
            res:res,
            status:200,
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

}

// [GET] 取得指定教練課程列表
async function get_coachingCourses(req, res, next){
    try{
        const coachId = req.params.coachId;

        const coachData = await coach_db.findOneBy({"id" : coachId});
        const course_data = await course_db
            .createQueryBuilder("Course")
            .innerJoinAndSelect("Course.Skill", "Skill")  
            .innerJoinAndSelect("Course.User", "User") 
            .where("Course.user_id = :id", { id : coachData.user_id })
            .getRawMany();

        const formattedData = course_data.map(course => ({
            id : course.Course_id,
            coach_name : course.User_name,
            skill_name : course.Skill_name,
            name : course.Course_name,
            description : course.Course_description,
            start_at : course.Course_start_at,
            end_at : course.Course_end_at,
            meeting_url : course.Course_meeting_url
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

module.exports = {
    get_coachesDate,
    get_coachDetails,
    get_coachingCourses
}