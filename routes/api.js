/**
 * REST API Router
 */

//初始化通用加密类
var crypto = require('crypto');

module.exports = function(app) {

  //测试用增加用户的接口
  // app.get('/api/User/add', function(req, res) {
  //   var UserModel = require('../models/user_model');
  //   var md5 = crypto.createHash('md5');
  //   var md5Password = md5.update('000777').digest('hex');
  //   var userInfo = new UserModel({
  //     username: '10083129',
  //     password: md5Password,
  //     email: 'ass@qq.com',
  //     realname: '谢洋浩'
  //   });
  //   userInfo.save();
  //   return res.send('Done!');
  // });

  /**
   * 增加课程的执行接口 测试用！
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  // app.get('/api/Course/add', function(req, res) {
  //   var CourseModel = require('../models/course/course_main_model');
  //   var newCourse = new CourseModel({
  //     name: "通信系统概论",
  //     code: "C0899003",
  //     variable: {
  //       teacher: {
  //         name: "沈雷"
  //       },
  //       time: {
  //         display: "周二第1,2节{第1-16周}"
  //       },
  //       place: {
  //         display: "第11教研楼207"
  //       },
  //       credit: "2.0",
  //       selected: 10,
  //       total: 50,
  //       campus: "下沙校区",
  //       college: "通信工程学院",
  //       attr: "校级公选"
  //     }
  //   });
  //   newCourse.save();
  //   return res.send('Add Course Done!');
  // });

  /**
   * 通过接口获取某个账号的开放信息
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  app.get('/api/User/get/:username', checkLogin, function(req, res) {
    var UserModel = require('../models/user_model');

    var userName = req.params.username;
    var invisible = {
      password: 0,
      _id: 0,
      __v: 0
    };

    UserModel.findByUsername(userName, invisible, function(err, data) {
      if (err) {
        res.json(500, err);
      } else if (data === null) {
        res.json(404, data);
      } else {
        res.json(data);
      }
    });
  });

  /**
   * 执行登录验证操作，并写入mongosession
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  app.get('/api/User/doLogin', function(req, res) {
    var UserModel = require('../models/user_model');

    var user = {
      username: req.param('username'),
      password: req.param('password'),
      md5Password: crypto.createHash('md5').update(req.param('password')).digest('hex')
    }

    UserModel.findByUsername(user.username, {}, function(err, data) {
      if ( !! err) {
        res.json(500, err);
      } else if (data !== null) {
        if (user.md5Password === data.password) {
          req.session.user = {
            username: data.username,
            realname: data.realname
          }
          //console.log(req.session.user);
          res.json('Login Success,please jump to the page you want.');
        } else {
          res.json(404, '用户名或密码错误，请重试一遍，注意密码的大小写哦！');
        }
      } else {
        res.json(404, '用户名或密码错误，请重试一遍，注意密码的大小写哦！');
      }
    });
  });

  /**
   * 选课首页所需内容api返回
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  app.get('/api/Course/getAllCourses', checkLogin, function(req, res) {
    var CourseModel = require('../models/course/course_main_model');
    var filter = {

    };

    CourseModel.findAllCourses({}, function(err, data) {
      if (err) {
        res.json(500, err);
      } else if (data === null) {
        res.json(404, data);
      } else {
        res.json(data);
      }
    });
  });

  /**
   * 课程中心首页所需内容的api返回
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  app.get('/api/Course/infoCenter', checkLogin, function(req, res) {
    var CourseModel = require('../models/course/course_main_model');
    var filter = {
      "code": 1,
      "name": 1,
      "variable.teacher.name": 1,
      "variable.time.display": 1,
      "data.score.average": 1
    };

    CourseModel.findAllCourses(filter, function(err, data) {
      if (err) {
        res.json(500, err);
      } else if (data === null) {
        res.json(404, data);
      } else {
        res.json(data);
      }
    });
  });

  /**
   * 提交需要选择的课程
   * @param  {[type]} req 请求资源对象
   * @param  {[type]} res 服务器返回对象
   * @return {json}       操作结果的json对象，如果遇到错误则返回错误信息，直接提取json内容即可
   */
  app.post('/api/Course/choice', checkLogin, function(req, res) {

    var CourseChoice = require('../models/course/course_choice_model');
    var CourseMain = require('../models/course/course_main_model');

    var newChoice = {
      username: req.session.user.username,
      time: Date.now(),
      choice: req.param('choice')
    }

    CourseChoice.setNewItem(newChoice, function (err, data) {
      if (data === null) {
        return res.json(412, err);
      } else if (!!err) {
        return res.json(500, err);
      } else if (data === true) {
        CourseMain.addOneSelected(newChoice.choice, function (err, data) {
          if (!!err) {
            return res.json(409, err);
          } else {
            return res.json(data);
          }
        });
      }
    });

    // CourseChoice.setNewItem(newChoice, function (err, data) {

    // })

    // var loopAdd = function(callback) {
    //   var i;

    //   for (i in newChoice.choice) {
    //     CourseMain.addOneSelected(newChoice.choice[i], function(err, data) {
    //       if ( !! err) {
    //         //console.log(err);
    //         return res.json(500, err);
    //       } else {
    //         callback();
    //       }
    //     });
    //   };
    // }

    // loopAdd(function() {
    //   CourseChoice.setNewItem(newChoice, function(err, data) {
    //     if ( !! err) {
    //       return res.json(500, err);
    //     } else {
    //       return res.json(data);
    //     }
    //   });
    // });

  });

  /**
   * 获取课程主要信息
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  app.get('/api/Course/mainInfo/:code', checkLogin, function(req, res) {

    var CourseModel = require('../models/course/course_main_model');

    var code = req.params.code;
    var filter = {
      "code": 1,
      "name": 1,
      "intro": 1,
      "comments": 1,
      "variable.place.display": 1,
      "variable.teacher": 1,
      "variable.time.display": 1,
      "variable.stu.gender": 1,
      "variable.credit": 1,
      "data.score.average": 1,
      "data.score.taoke": 1,
      "data.score.diandao": 1
    };

    if (typeof(code) === 'undefined') {
      return res.json(500 ,"Can't find this course.");
    }

    CourseModel.findByCode(code, filter, function(err, data) {
      if (err) {
        return res.json(500, err);
      } else if (data === null) {
        return res.json(404, data);
      } else {
        return res.json(data);
      }
    });

  });

  /**
   * 通过课程号获得课程数据统计信息
   * @return {json} 返回需要的数据对象，格式与mongo存储一致
   */
  app.get('/api/Course/dataInfo/:code', checkLogin, function (req, res) {

    var CourseModel = require('../models/course/course_main_model');

    var code = req.params.code;
    var filter = {
      "variable.stu.gender": 1,
      "data": 1,
    };

    if (typeof(code) === 'undefined') {
      return res.json(500 ,"Can't find this course.");
    }

    CourseModel.findByCode(code, filter, function(err, data) {
      if (err) {
        return res.json(500, err);
      } else if (data === null) {
        return res.json(404, data);
      } else {
        return res.json(data);
      }
    });

  });

  /**
   * 单次修改提交某课程评分为**
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  app.put('/api/Course/:code/score/:grade', checkLogin, function (req, res) {

    var CourseModel = require('../models/course/course_score_model');

    var code = req.params.code;
    //将传值过来的数值和英文数字匹配，数据库内是以英文数字为属性名的
    var grade = parseInt(req.params.grade);
    var gradeArr = ['', 'one', 'two', 'three', 'four', 'five'];

    if (typeof grade === 'undefined') {
      return res.json(500, 'Can\'t set this score.');
    } else {
      var flag = gradeArr[grade];

      //如果在数组中有和合法指存在则继续，否则返回数值传递错误的信息
      if (flag !== undefined) {
        var params = {
          username: req.session.user.username,
          code: code,
          score: gradeArr[grade]
        }

        //检查评分记录表，符合评分条件后写入评分主表
        CourseModel.setOnesScore(params, function (err, data) {
          if (err) {
            return res.json(500, err);
          } else if (data === null) {
            return res.json(404, data);
          } else {
            //return res.json(data);
            //将评分写入写入课程主表
            var CourseMain = require('../models/course/course_main_model');

            CourseMain.addOneScore(params, function (err, data) {
              if (err) {
                return res.json(500, err);
              } else if (data === null) {
                return res.json(404, data);
              } else {
                return res.json(data);
              }
            });
          }
        });

      } else {
        return res.json(500, 'The score you send is not avaliable.');
      }
    }
  });

  /**
   * 错误的请求地址返回提示
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @param  {Function} next [description]
   * @return {[type]}        [description]
   */
  app.get('/api/*', function(req, res) {
    // var ctrler = req.params.controller;
    // if (!ctrler) {
    return res.json(404, 'Error API request.');
    // } else {
    //   next();
    // }
  });




  /** 自定义当前route的功能函数 **/

  //判断字符串是否在数组中
  var isInArray = function (str, arr, callback) {
    for (var i in arr) {
      if (str === arr[i]) {
        return true;
      }
    }
    return false;
  }

  //检查当前是否为登录状态，否则以json返回错误提示
  function checkLogin (req, res, next) {
    if (!req.session.user) {
      return res.json(500, '通过API的请求被服务器拒绝，原因是当前您还未登录或登录超时，请重新登录。');
    }
    next();
  }

};