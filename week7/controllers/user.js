const { IsNull } = require('typeorm');

const { dataSource } = require('../db/data-source');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger')('User');
const resStatus = require('../utils/resStatus');

// 宣告會使用的 db 資料表
const user_db = dataSource.getRepository('User');
const creditPurchase_db = dataSource.getRepository('CreditPurchase');
const courseBooking_db = dataSource.getRepository('CourseBooking');

const config = require('../config/index');
const generateJWT = require('../utils/generateJWT');

// [POST] 使用者註冊
async function post_UserRegistration(req, res, next){
    try{
        const {name,email,password} = req.body;

        const salt = await bcrypt.genSalt(10);
        const databasePassword = await bcrypt.hash(password, salt);
        // 上傳數據
        const newPost = user_db.create({ 
            name,
	        email,
            "role" : "USER",
	        "password" : databasePassword
        });
        const user_data = await user_db.save(newPost);

        // [HTTP 201] 呈現上傳後資料
        resStatus({
            res:res,
            status:201,
            dbdata:{ 
                users: {
                    id : user_data.id,
                    name : user_data.name
                }
            }
        });
       
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }

}

// [POST] 使用者登入
async function post_UserLogin(req, res, next){
    try{
        const {email} = req.body;

        const user_data = await user_db.findOne({
            select : ['id', 'name', 'password'],
            where : { email }
        });

        const token = await generateJWT({
            id: user_data.id
        }, config.get('secret.jwtSecret'), {
            expiresIn: `${config.get('secret.jwtExpiresDay')}`
        })

        // [HTTP 201] 呈現上傳後資料
        resStatus({
            res:res,
            status:201,
            dbdata:{ 
                token,
                users: {
                    name : user_data.name
                }
            }
        });
    
       
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
}

// [GET] 取得個人資料
async function get_personalInfo(req, res, next){
    try{
        const {id} = req.user;
        const user_data = await user_db.findOneBy({"id" : id });

        // [HTTP 201] 呈現資料
        resStatus({
            res:res,
            status:201,
            dbdata:{ 
                users: {
                    email : user_data.email,
                    name : user_data.name
                }
            }
        });
       
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
}

// [PUT] 更新個人資料
async function put_updateProfile(req, res, next){
    try{
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

// [PUT] 使用者更新密碼
async function put_updatePassword(req, res, next){
    try{
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

// [GET] 取得使用者已購買的方案列表
async function get_usercreditPackage(req, res, next){
    try{
        const {id} = req.user;

        const creditPurchase_data = await creditPurchase_db
            .createQueryBuilder("CreditPurchase")
            .innerJoinAndSelect("CreditPurchase.CreditPackage", "CreditPackage")  
            .where("user_id = :id", { id })
            .getMany();  // 執行查詢並返回結果

        const formattedData = creditPurchase_data.map(cp => ({
            purchased_credits: cp.purchased_credits,
            price_paid: cp.price_paid,
            name: cp.CreditPackage.name,
            purchase_at: cp.purchaseAt
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

// [GET] 取得已預約的課程列表
async function get_scheduledCourses(req, res, next){
    try{
        const {id} = req.user;

        const purchasedCredits = await creditPurchase_db.sum("purchased_credits",{"user_id" : id});
        const applicants = await courseBooking_db.count({
            where: { user_id : id,cancelledAt : IsNull() }
        });
        const credit_remain = purchasedCredits - applicants;
        const credit_usage = applicants;

        const courseBooking_data = await courseBooking_db
            .createQueryBuilder("CourseBooking")
            .innerJoinAndSelect("CourseBooking.Course", "Course")  
            .innerJoinAndSelect("Course.User", "User")  
            .select(["Course.name","CourseBooking.course_id","User.name",
                "Course.startAt","Course.endAt","Course.meeting_url",
                `Case When Course.startAt > NOW() THEN 'PENDING'
                      When Course.endAt > NOW() THEN 'PROGRESS'
                      When Course.endAt < NOW() THEN 'COMPLETED' END AS status`
            ])
            .where("CourseBooking.user_id = :id", { id })
            .andWhere("CourseBooking.cancelled_at is null")
            .getRawMany();  // 執行查詢並返回結果

        const formattedData = courseBooking_data.map(cb => ({
            name: cb.CourseBooking_course_id,
            course_id: cb.course_id,
            coach_name:cb.User_name,
            status: cb.status,
            start_at:cb.Course_start_at,
            end_at:cb.Course_end_at,
            meeting_url:cb.Course_meeting_url
        }));

        // [HTTP 200] 呈現資料
        resStatus({
            res:res,
            status:200,
            dbdata:{
                "credit_remain": credit_remain,
		        "credit_usage": credit_usage,
                "course_booking": formattedData
            }
        });
       
    }catch(error){
        // [HTTP 500] 伺服器異常
        logger.error(error);
        next(error);
    }
}

module.exports = {
    post_UserRegistration,
    post_UserLogin,
    get_personalInfo,
    put_updateProfile,
    put_updatePassword,
    get_usercreditPackage,
    get_scheduledCourses
}