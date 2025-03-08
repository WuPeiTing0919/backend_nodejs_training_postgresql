// Node.js 主程式

// 加入必要的套件
const express = require('express');
const cors = require('cors');
const path = require('path');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger')('App');

// 載入路由網站
const creditPackageRouter = require('./routes/creditPackage');
const skillRouter = require('./routes/skill');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const coachRouter = require('./routes/coach');
const coursesRouter = require('./routes/courses');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(pinoHttp({
  logger,
  serializers: {
    req (req) {
      req.body = req.raw.body
      return req
    }
  }
}));

// 載入靜態檔案路徑，把靜態檔案放在此資料夾內
app.use(express.static(path.join(__dirname, 'public')));

app.get('/healthcheck', (req, res) => {
  res.status(200);
  res.send('OK');
})

// 各網頁的路由設定
app.use('/api/credit-package', creditPackageRouter);
app.use('/api/coaches/skill', skillRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/coaches', coachRouter);
app.use('/api/courses', coursesRouter);

// .use() 是用來註冊中介軟體（middleware）
// 404 Not Found（這必須放在所有路由的最後）
app.use((req, res, next) => {
  res.status(404).json({
    status: 'false',
    message: '找不到此網站'
  });
});

// 500 錯誤處理
app.use((err, req, res, next) => {
  req.log.error(err);
  if (err.status) {
    res.status(err.status).json({
      status: 'failed',
      message: err.message,
    });
    return;
  }
  res.status(500).json({
    status: 'error',
    message: '伺服器錯誤'
  });
})

module.exports = app;
