
/**
 * Module dependencies.
 */

var express = require('express');

//加载配置参数
var settings = require('./global-setting');

//加载路由配置
var routes = require('./routes');
var apiRoutes = require('./routes/api');
// var user = require('./routes/user');

//加载功能模块
var http = require('http');
var path = require('path');
var mongo = require('mongodb');
var SessionStore = require('connect-mongo')(express);


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
//增加session支持
app.use(express.cookieParser());
//开启则使用express自带的session存储
// app.use(express.cookieSession({secret: settings.cookieSecret})); 
app.use(express.session({
  secret: settings.cookieSecret,
  cookie: { maxAge: null },
  store: new SessionStore({
    db: settings.db,
    //clear_interval: 3600
  }),
  expires: new Date(Date.now() + (3600)),
  maxAge: new Date(Date.now() + (3600))
}));
app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
});
//增加session支持
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// app.get('/', routes.index);
// app.get('/login/:name', routes.login);
// app.post('/login', routes.doLogin);
// app.get('/logout', routes.logout);
// app.get('/home', routes.home);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

routes(app);
apiRoutes(app);
