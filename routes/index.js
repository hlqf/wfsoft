/**
 * 总控路由
 */


module.exports = function(app) {
	app.get('/', function(req, res) {
		res.render('index', {
	  	title: '首页',
	  });
	});

  app.get('/home', checkLogin, function(req, res) {
    res.render('home', {
      title: 'MyHome',
      isHome: 1
    });  
  });

  app.get('/login', function(req, res) {

    var err = req.query.referer === undefined ? '' : '您刚才的访问这个请求需要您进行登录。';
    
    res.render('login', {
      title: '用户登录',
      query: req.params.name,
      haveErr: err
    });

  });

  // app.post('/login', function(req, res) {
  //   var user = {
  //     username: 'admin',
  //     password: 'admin'
  //   }

  //   if (req.body.username === user.username && req.body.password === user.password) {
  //     req.session.user = user;
  //     res.redirect('/home');
  //   } else {
  //     res.redirect('/login');
  //   }
  // });

  app.get('/logout', function(req, res) {
    req.session.user = null;
    //req.session.destroy();
    res.redirect('/');
  });

  app.get('/courses/:code', checkLogin, function(req, res) {
    var code = req.params.code;

    var CourseModel = require('../models/course/course_main_model');
    CourseModel.getNameByCode(code, function (err ,data) {
      if (!err) {
        var name = data.name;

        res.render('course_details', {
          title: name + ' - 课程信息',
          isCourses: 1, //标记顶栏菜单是否选中的变量
          code: code,
          name: name
        });
      } else {
        return res.send(404, '没有找到该课程哦，请检查课程号是否正确。')
      }
      
    });
    
  });

  app.get('/courses', checkLogin, function(req, res) {
    res.render('courses', {
      title: '课程信息',
      isCourses: 1
    });
  });

  app.get('/MyCourses', checkLogin, function(req, res) {
    res.render('my_courses', {
      title: '我的课程',
      isMyCourses: 1
    });
  });


};


/** index router 的内部自定义函数 **/
function checkLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login' + '?referer=' + req.url);
  }
  req.session.error = null;
  next();
}