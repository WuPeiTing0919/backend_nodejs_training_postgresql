const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Admin');
const resStatus = require('../utils/resStatus');

// 宣告會使用的 db 資料表
const user_db = dataSource.getRepository('User');
const coach_db = dataSource.getRepository('Coach');
const course_db = dataSource.getRepository('Course');
const courseBooking_db = dataSource.getRepository('CourseBooking');
const coachLinkSkill_db = dataSource.getRepository('CoachLinkSkill');
const creditPackage_db = dataSource.getRepository('CreditPackage');

// [POST] 新增教練課程資料
async function post_addcoachingCourse(req, res, next){
    try{
        const { id : user_id } = req.user;
        const {skill_id,name,description,
                start_at : startAt,end_at : endAt,
                max_participants,meeting_url} = req.body;

        // 上傳數據
        const newPost = course_db.create({ 
            user_id,
            skill_id,
            name,
            description,
            startAt,
            endAt,
            max_participants,
            meeting_url
        });
        const saveCoach = await course_db.save(newPost);

        // [HTTP 201] 呈現上傳後資料
        resStatus({
            res:res,
            status:201,
            dbdata:{
                course: {
                    id: saveCoach.id,
                    user_id : saveCoach.user_id,
                    skill_id : saveCoach.skill_id,
                    name : saveCoach.name,
                    description : saveCoach.description,
                    start_at : saveCoach.startAt,
                    end_at : saveCoach.endAt,
                    max_participants : saveCoach.max_participants,
                    meeting_url : saveCoach.meeting_url,
                    created_at: saveCoach.createdAt,
                    updated_at: saveCoach.updatedAt
                }
            }
        });
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
}

// [PUT] 編輯教練課程資料
async function put_updatecoachingCourse(req, res, next){
    try{
        const courseId = req.params.courseId;

        const saveCoach = await course_db.findOneBy({"id" : courseId});
        // [HTTP 200] 呈現更新後資料
        resStatus({
            res:res,
            status:200,
            dbdata:{
                course: {
                    id: saveCoach.id,
                    user_id : saveCoach.user_id,
                    skill_id : saveCoach.skill_id,
                    name : saveCoach.name,
                    description : saveCoach.description,
                    start_at : saveCoach.startAt,
                    end_at : saveCoach.endAt,
                    max_participants : saveCoach.max_participants,
                    meeting_url : saveCoach.meeting_url,
                    created_at: saveCoach.createdAt,
                    updated_at: saveCoach.updatedAt
                }
            }
        });
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
}

// [POST] 將使用者新增為教練
async function post_userAddedcoach(req, res, next){
    try{
        const userId = req.params.userId;
        const {description,experience_years,profile_image_url} = req.body;

        // 上傳數據
        const newPost = coach_db.create({ 
            "user_id" : userId,
            experience_years,
            description,
            profile_image_url
        });
        const saveCoach = await coach_db.save(newPost);
        const saveUser = await user_db.findOneBy({"id" : userId});

        // [HTTP 201] 呈現上傳後資料
        resStatus({
            res:res,
            status:201,
            dbdata:{ 
                users: {
                    name : saveUser.name,
                    role : saveUser.role
                },
                coach : {
                    id : saveCoach.id,
                    user_id : saveCoach.user_id,
                    experience_years : saveCoach.experience_years,
                    description : saveCoach.description,
                    profile_image_url : saveCoach.profile_image_url,
                    created_at: saveCoach.createdAt,
                    updated_at: saveCoach.updatedAt
                }
            }
        });
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
}

// [GET] 取得教練自己的課程列表
async function get_coachOwnCourse(req, res, next){
    try{
        const {id} = req.user;

        const courseBooking_data = await courseBooking_db
            .createQueryBuilder("CourseBooking")
            .innerJoinAndSelect("CourseBooking.Course", "Course")  
            .select([
                "Course.id",
                `Case When Course.startAt > NOW() THEN 'PENDING'
                      When Course.endAt > NOW() THEN 'PROGRESS'
                      When Course.endAt < NOW() THEN 'COMPLETED' END AS status`,
                "Course.name",
                "Course.start_at",
                "Course.end_at",
                "Course.max_participants",
                "COUNT(CourseBooking.id) AS participants"
            ])
            .where("Course.user_id = :id", { id })
            .andWhere("CourseBooking.cancelled_at is null")
            .groupBy("Course.id")
            .addGroupBy("Course.name")
            .addGroupBy("Course.start_at")
            .addGroupBy("Course.end_at")
            .addGroupBy("Course.max_participants")
            .getRawMany();
        
        const formattedData = courseBooking_data.map(cb => ({
            id : cb.Course_id,
            status : cb.status,
            name: cb.Course_name,
            start_at:cb.start_at,
            end_at:cb.end_at,
            max_participants:cb.Course_max_participants,
            participants:cb.participants
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

// [GET] 取得教練自己的課程詳細資料
async function get_coachOwnCourseDetail(req, res, next){
    try{
        const {id} = req.user;
        const courseId = req.params.courseId;

        // 查詢資料
        const course_data = await course_db
            .createQueryBuilder("Course")
            .innerJoinAndSelect("Course.Skill", "Skill")   
            .where("Course.id = :id", { id : courseId })
            .getMany();  // 執行查詢並返回結果

        const formattedData = course_data.map(cb => ({
            id : cb.id,
            skill_name : cb.Skill.name,
            name: cb.name,
            description:cb.description,
            start_at:cb.startAt,
            end_at:cb.endAt,
            max_participants:cb.max_participants,
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

// [PUT] 變更教練資料
async function put_coachProfile(req, res, next){
    try{
        const {id} = req.user;
        const {experience_years,description,profile_image_url,skill_ids} = req.body;

        await coach_db.update(
            {"user_id" : id},
            {experience_years,description,profile_image_url}
        );

        // 上傳數據
        const coach = await coach_db.findOneBy({"user_id" : id});
        await coachLinkSkill_db.delete({"coach_id" : coach.id});
        for(let i = 0 ; i < skill_ids.length; i++){
            const newPost = coachLinkSkill_db.create({ 
                "coach_id" : coach.id,
                "skill_id" : skill_ids[i]
            });
            await coachLinkSkill_db.save(newPost);
        }

        // 查詢資料
        const coachLinkSkill_data = await coachLinkSkill_db
            .createQueryBuilder("CoachLinkSkill")
            .innerJoinAndSelect("CoachLinkSkill.Coach", "Coach")   
            .where("Coach.id = :id", { id : coach.id })
            .getMany();  // 執行查詢並返回結果

        const formattedData = coachLinkSkill_data.map(cs => (cs.skill_id));

        // [HTTP 200] 呈現資料
        resStatus({
            res:res,
            status:200,
            dbdata : {
                experience_years : coachLinkSkill_data[0].Coach.experience_years,
                description : coachLinkSkill_data[0].Coach.description,
                profile_image_url : coachLinkSkill_data[0].Coach.profile_image_url,
                skill_id : formattedData
            }
        });

    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
}

// [GET] 取得教練自己的詳細資料
async function get_coachOwnDetails(req, res, next){
    try{
        const {id} = req.user;

        const coach = await coach_db.findOneBy({"user_id" : id});
        // 查詢資料
        const coachLinkSkill_data = await coachLinkSkill_db
            .createQueryBuilder("CoachLinkSkill")
            .innerJoinAndSelect("CoachLinkSkill.Coach", "Coach")   
            .where("Coach.id = :id", { id : coach.id })
            .getMany();  // 執行查詢並返回結果

        const formattedData = coachLinkSkill_data.map(cs => (cs.skill_id));

        // [HTTP 200] 呈現資料
        resStatus({
            res:res,
            status:200,
            dbdata : {
                id : coach.id,
                experience_years : coachLinkSkill_data[0].Coach.experience_years,
                description : coachLinkSkill_data[0].Coach.description,
                profile_image_url : coachLinkSkill_data[0].Coach.profile_image_url,
                skill_id : formattedData
            }
        });

    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
}

// [GET] 取得教練自己的月營收資料
async function get_coachRevenueInfo(req, res, next){
    try{
        const {id} = req.user;
        const month = req.query.month;

        const courses = await course_db.find({where: { user_id: id }});
        const courseIds = courses.map(course => course.id)
        if (courseIds.length === 0) {
            resStatus({
                res:res,
                status:200,
                dbdata : {
                    total: {
                        revenue: 0,
                        participants: 0,
                        course_count: 0
                    }
                }
            });
            return
        }

        const year = new Date().getFullYear();
        const calculateStartAt = dayjs(`${year}-${month}-01`).startOf('month').toISOString();
        const calculateEndAt = dayjs(`${year}-${month}-01`).endOf('month').toISOString();

        const courseCount = await courseBooking_db
            .createQueryBuilder('CourseBooking')
            .select('COUNT(*)', 'count')
            .where('course_id IN (:...ids)', { ids: courseIds })
            .andWhere('cancelled_at IS NULL')
            .andWhere('created_at >= :startDate', { startDate: calculateStartAt })
            .andWhere('created_at <= :endDate', { endDate: calculateEndAt })
            .getRawOne();

        const participants = await courseBooking_db
            .createQueryBuilder('course_booking')
            .select('COUNT(DISTINCT(user_id))', 'count')
            .where('course_id IN (:...ids)', { ids: courseIds })
            .andWhere('cancelled_at IS NULL')
            .andWhere('created_at >= :startDate', { startDate: calculateStartAt })
            .andWhere('created_at <= :endDate', { endDate: calculateEndAt })
            .getRawOne();
            
        const totalCreditPackage = await creditPackage_db
            .createQueryBuilder('CreditPackage')
            .select('SUM(credit_amount)', 'total_credit_amount')
            .addSelect('SUM(price)', 'total_price')
            .getRawOne();

        const perCreditPrice = totalCreditPackage.total_price / totalCreditPackage.total_credit_amount
        const totalRevenue = courseCount.count * perCreditPrice
        resStatus({
            res:res,
            status:200,
            dbdata : {
                total: {
                    revenue: Math.floor(totalRevenue),
                    participants: parseInt(participants.count, 10),
                    course_count: parseInt(courseCount.count, 10)
                }
            }
        });

        // [HTTP 200] 呈現資料
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
    post_addcoachingCourse,
    put_updatecoachingCourse,
    post_userAddedcoach,
    get_coachOwnCourse,
    get_coachOwnCourseDetail,
    put_coachProfile,
    get_coachOwnDetails,
    get_coachRevenueInfo
}