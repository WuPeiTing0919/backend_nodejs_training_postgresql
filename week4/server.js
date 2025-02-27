// 載入 .env 檔案
require("dotenv").config();

// 載入必要的套件、自行開發的 js 檔案
const http = require("http");
const mf = require("./module_function");
const AppDataSource = require("./db");

// 宣告會使用的 db 資料表
const creditPackage_db = AppDataSource.getRepository('CreditPackage');
const skill_db = AppDataSource.getRepository('Skill');

const requestListener = async (req, res) => {
  // 回傳 header cors 表頭
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }

  function resStatus_Function({res,status,method = "GET",dbdata = [],message = ""} = {}){
    let data = {};

    switch (status){
      case 200:
        data.status = "success"
        if(method !== "DELETE"){
          data.data = dbdata;
        }
        break;
      case 500:
        data.status = "error"
        data.message = message;
        break;
      case 404:
        data.status = "false"
        data.message = message;
        break;
      case 400:
      case 409:
        data.status = "failed"
        data.message = message;
        break;
    }

    res.writeHead(status,headers);
    if(method !== "OPTIONS"){
      res.write(JSON.stringify(data));
    }
    res.end();
  }

  // 組合req的資料至 body
  let body = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    body += chunk;
  });

  // [GET] 取得購買方案列表
  if(req.url=="/api/credit-package" && req.method == "GET"){
    try{
      // 查詢資料
      const creditPackage_data = await creditPackage_db.find({
        select: ["id", "name", "credit_amount", "price"]
      });
  
      // [HTTP 200] 呈現資料
      resStatus_Function({
        res:res,
        status:200,
        method:"GET",
        dbdata:creditPackage_data
      });
    }catch(error){
      // [HTTP 500] 伺服器異常
      resStatus_Function({
        res:res,
        status:500,
        message:"伺服器錯誤"
      });
    }

  // [POST] 新增購買方案
  }else if (req.url=="/api/credit-package" && req.method == "POST"){
    req.on('end',async () => {
      try{
        let data = JSON.parse(body);

        // [HTTP 400] 資料填寫不完整異常
        if(mf.isUndefined(data.name) || mf.isUndefined(data.credit_amount) || mf.isUndefined(data.price)
        || mf.isNotValidSting(data.name) || mf.isNotValidInteger(data.credit_amount) || mf.isNotValidInteger(data.price)){
          resStatus_Function({
            res:res,
            status:400,
            method:"POST",
            message:"欄位未填寫正確"
          });
          return
        }

        // [HTTP 409] 資料重複異常
        let nameData = await creditPackage_db.find({
          where : {
            "name" : data.name
          }
        });
        if (nameData.length > 0){
          resStatus_Function({
            res:res,
            status:409,
            method:"POST",
            message:"資料重複"
          });
          return;
        }

        // 上傳數據
        const newPost = creditPackage_db.create({ 
          "name": data.name,
          "credit_amount": data.credit_amount,
          "price": data.price
         });
        await creditPackage_db.save(newPost);
        
        // 查詢資料
        const creditPackage_data = await creditPackage_db.find({
          select: ["id", "name", "credit_amount", "price"]
        });
        // [HTTP 200] 呈現上傳後資料
        resStatus_Function({
          res:res,
          status:200,
          method:"GET",
          dbdata:creditPackage_data
        });

      }catch(error){
        // [HTTP 500] 伺服器異常
        resStatus_Function({
          res:res,
          status:500,
          message:"伺服器錯誤"
        });
      }

    });

  // [DELETE] 刪除購買方案
  }else if (req.url.startsWith('/api/credit-package/') && req.method == "DELETE"){
    try{
      // 抓取需要刪除的 ID 資料
      let creditPackage_Id = req.url.split('/').pop();
    
      // [HTTP 400] ID資料提供不完整異常
      if(mf.isUndefined(creditPackage_Id) || mf.isNotValidSting(creditPackage_Id)){
        resStatus_Function({
          res:res,
          status:400,
          method:"DELETE",
          message:"ID錯誤"
        });
        return
      }

      // 刪除資料
      const result = await creditPackage_db.delete(creditPackage_Id);

      // [HTTP 400] ID資料提供不正確異常
      if(result.affected === 0){
        resStatus_Function({
          res:res,
          status:400,
          method:"DELETE",
          message:"ID錯誤"
        });
        return;
      }
      
      // [HTTP 200] 資料刪除成功
      resStatus_Function({
        res:res,
        status:200,
        method:"DELETE"
      });
    }catch(error){
      // [HTTP 500] 伺服器異常
      resStatus_Function({
        res:res,
        status:500,
        message:"伺服器錯誤"
      });
    }
  
  // [GET] 取得教練專長列表
  }else if (req.url=="/api/coaches/skill" && req.method == "GET"){
    try{
      // 查詢資料
      const skill_data = await skill_db.find({
        select: ["id", "name"]
      });
  
      // [HTTP 200] 呈現資料
      resStatus_Function({
        res:res,
        status:200,
        method:"GET",
        dbdata:skill_data
      });
    }catch(error){
      // [HTTP 500] 伺服器異常
      resStatus_Function({
        res:res,
        status:500,
        message:"伺服器錯誤"
      });
    }

  // [POST] 新增教練專長
  }else if(req.url=="/api/coaches/skill" && req.method == "POST"){
    req.on('end',async () => {
      try{
        let data = JSON.parse(body);
      
        // [HTTP 400] 資料填寫不完整異常
        if(mf.isUndefined(data.name) || mf.isNotValidSting(data.name)){
          resStatus_Function({
            res:res,
            status:400,
            method:"POST",
            message:"欄位未填寫正確"
          });
          return
        }

        // [HTTP 409] 資料重複異常
        let nameData = await skill_db.find({
          where : {
            "name" : data.name
          }
        });
        if (nameData.length > 0){
          resStatus_Function({
            res:res,
            status:409,
            method:"POST",
            message:"資料重複"
          });
          return;
        }

        // 上傳數據
        const newPost = skill_db.create({ 
          "name": data.name
         });
        await skill_db.save(newPost);
        
        // 查詢資料
        const skill_data = await skill_db.find({
          select: ["id", "name"]
        });
        // [HTTP 200] 呈現上傳後資料
        resStatus_Function({
          res:res,
          status:200,
          method:"GET",
          dbdata:skill_data
        });

      }catch(error){
        // [HTTP 500] 伺服器異常
        resStatus_Function({
          res:res,
          status:500,
          message:"伺服器錯誤"
        });
      }

    });

  }else if(req.url.startsWith('/api/coaches/skill/') && req.method == "DELETE"){
    try{
      // 抓取需要刪除的 ID 資料
      let skill_Id = req.url.split('/').pop();
    
      // [HTTP 400] ID資料提供不完整異常
      if(mf.isUndefined(skill_Id) || mf.isNotValidSting(skill_Id)){
        resStatus_Function({
          res:res,
          status:400,
          method:"DELETE",
          message:"ID錯誤"
        });
        return
      }

      // 刪除資料
      const result = await skill_db.delete(skill_Id);

      // [HTTP 400] ID資料提供不正確異常
      if(result.affected === 0){
        resStatus_Function({
          res:res,
          status:400,
          method:"DELETE",
          message:"ID錯誤"
        });
        return;
      }
      
      // [HTTP 200] 資料刪除成功
      resStatus_Function({
        res:res,
        status:200,
        method:"DELETE"
      });
    }catch(error){
      // [HTTP 500] 伺服器異常
      resStatus_Function({
        res:res,
        status:500,
        message:"伺服器錯誤"
      });
    }

  // OPTIONS API 建置
  }else if(req.method == "OPTIONS"){
    resStatus_Function({
      res:res,
      status:200,
      method:"OPTIONS"
    });

  // 404 網頁建置
  }else{
    resStatus_Function({
      res:res,
      status:404,
      message:"無此網站路由"
    });
  }

}

const server = http.createServer(requestListener);

async function startServer () {
  await AppDataSource.initialize();
  console.log("資料庫連接成功");
  server.listen(process.env.PORT || 3000);
  console.log(`伺服器啟動成功, port: ${process.env.PORT || 3000}`);
  return server;
}

module.exports = startServer();