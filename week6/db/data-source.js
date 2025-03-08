// 資料庫、資料表啟動設定檔案

const { DataSource } = require('typeorm');
const config = require('../config/index');

// 載入需要資料表套件
const CreditPackage = require('../entities/CreditPackages');
const Skill = require('../entities/Skill');
const User = require('../entities/User');
const Coach = require('../entities/Coach');
const Course = require('../entities/Course');
const creditPurchase = require('../entities/creditPurchase');
const courseBooking = require('../entities/CourseBooking');

const dataSource = new DataSource({
  type: 'postgres',
  host: config.get('db.host'),
  port: config.get('db.port'),
  username: config.get('db.username'),
  password: config.get('db.password'),
  database: config.get('db.database'),
  synchronize: config.get('db.synchronize'),
  poolSize: 10,
  entities: [
    CreditPackage,Skill,User,Coach,Course,creditPurchase,courseBooking
  ],
  ssl: config.get('db.ssl')
});

module.exports = { dataSource };
