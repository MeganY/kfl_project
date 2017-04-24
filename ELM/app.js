/**
 * Created by Administrator on 2017/4/7.
 */
var express = require("express");
var mysql = require("mysql");
// var bodyParser = require("body-parser");
var session = require('express-session');




var conn = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"1402623",
    database:"kfl"
});
conn.connect();

var app = express();

// app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(express.static("./kfl"));

app.use(session({
    secret: 'kfl',//secret 用来防止篡改 cookie
    key: 'kfl',//key 的值为 cookie 的名字
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//设定 cookie 的生存期，这里我们设置 cookie 的生存期为 30 天
    resave:true,
    saveUninitialized:true,//是否保存未初始化状态
}));

app.post("/register",function(req,res){
   var username = req.query.username;
   var pwd = req.query.password;
   // console.log(username,pwd);
   var isUsername = "select username from user_profile where username='"+username+"'";
   conn.query(isUsername,function(err,result){
      if(err) throw err;
      if(result.length === 0){
          var userStr = "insert into user_profile set ?";
          var userProfile = {username:username,password:pwd};
          conn.query(userStr,userProfile,function(err,result){
              if(err) throw err;
              res.send("注册成功");
              console.log("注册信息添加成功");
              // console.log(result);
          });
      }else{
          console.log("用户名已存在");
          res.send("用户名已存在");
      };
   });
});

app.post("/login",function(req,res){
   var username = req.query.username;
   var pwd = req.query.password;
   var userQuery = "select * from user_profile where username='"+username+"' and password='"+pwd+"'";
   conn.query(userQuery,function(err,result){
      if(err) throw err;
      if(result.length != 0){
          console.log("登录成功");
          req.session.logid = result[0].id;
          res.send(result);
          // console.log(req.session);
          // console.log(result);
          var isLogin = "update user_profile set status=1 where username='"+username+"'";
          conn.query(isLogin,function(err,reslut){
              if(err) throw err;
              console.log("登录状态改变为1");
          })
      }else{
          res.send("登录失败");
      }
   });
});

app.get("/logout", function (req,res) {
    // console.log(req.session.logid);
    if (req.session.logid){
        var userStr = "update user_profile set status=0  where id="+req.session.logid;
        conn.query(userStr,function(err,result){
            if(err) throw err;
            req.session.logid = '';
            // console.log(result);
            res.send(result);
        })
    }
});

app.get("/userDetail",function(req,res){
    if (req.session.logid) {
        var userStr = "select username,status from user_profile where id="+req.session.logid;
        conn.query(userStr,function(err,result){
            if(err) throw err;
            res.send(result);
        })
    }else {
        res.send('err');
    }
});

app.get("/getDishes",function(req,res){
    var num = req.query.num;
    var index = req.query.index-1;
    var searchText = req.query.searchText;
    var sqlStr ;
    if(searchText == ""){
        sqlStr = "select * from kf_dish limit "+index*num+","+num;
    }else{
        sqlStr = "select * from kf_dish where name like '%"+searchText+"%' or material like '%"+searchText+"%'";
    };
    // console.log("查询语句："+sqlStr);
    conn.query(sqlStr,function(err,result1){
        if(err) throw err;
        //console.log(result1);
        var login_query = "select * from user_profile where status=1";
        conn.query(login_query,function(err,result2){
            if(err) throw err;
            // console.log(result2);
            res.send({dishes:result1,loginStatus:result2});
        });

    });
});

app.get("/getDetail",function(req,res){
    var id = req.query.id;
    // console.log(id);
    var sqlStr = "select * from kf_dish where did="+id;
    // console.log(sqlStr);
    conn.query(sqlStr,function(err,result){
        if(err) throw err;
        res.send(result);
    })
});

app.get("/getOrder",function(req,res){
    // console.log(req.session);
    if (req.session.logid) {
        console.log("进入填写详细内容页面");
        var id = req.query.id;
        var username = req.query.username;
        var sex = req.query.sex;
        var phone = req.query.phone;
        var addr = req.query.addr;
        // console.log(id,username,sex,phone,addr);
        var post = {did:id,user_name:username,sex:sex,phone:phone,addr:addr, user_id: req.session.logid};
        conn.query("insert into kf_order set ?",post,function(err,result){
            if(err) throw err;
            console.log("成功加入数据！");
            // var sum =159+195+156+165+519+591+516+561+615+651+915+951;
            // console.log(sum);
            res.send(result);
            // var unameStr = "select oid,user_name from kf_order where user_name='"+username+"'";
            // console.log(result);
            // conn.query(unameStr,function(err,result2){
            //     if(err) throw err;
            //     console.log(result2[0].oid);
            //     res.send({result:result.insertId,user:result2[0]});
            // });

        });
    }else {
        res.send('err');
    }
});

app.get("/getMyOrder",function(req,res){
    if (req.session.logid) {
        // var username = req.query.username;
        // console.log("订单username："+username);
        // var str = "select * from kf_dish inner join kf_order on kf_dish.did=kf_order.did";
        var sqlStr = "select kf_dish.did,kf_dish.img_sm,kf_order.user_name,kf_order.order_time from kf_order,kf_dish where kf_dish.did=kf_order.did and kf_order.user_id='"+req.session.logid+"' order by did desc";
        //  var sqlStr = "select * from kf_order where user_name='"+username+"'";
        // console.log(sqlStr);
        conn.query(sqlStr,function(err,result){
            if(err) throw err;
            res.send(result);
            // console.log(result);
        });
    }else{
        res.send('err');
    }

});
app.listen(8080);