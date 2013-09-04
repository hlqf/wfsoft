/**
 * 从网站抓取导入课程数据到mongodb
 * @Author: Daishengxiang
 * @Time: 2013-09-01
 * @Details: 
 */

var $ = require('jquery');
var iconv = require('iconv-lite');
// var fs = require('fs');
var mongo = require('mongodb');
var http = require('http');
var querystring = require('querystring');

var html = ''; //获得的html源码
var htmlObj = {}; //分析html后获得的数据对象
var course = {}; //将课程所有信息抽象进课程对象，此对象与course_mains表内对应
// var codeRegex = new RegExp('()', ''); //从选课课号里正则匹配取得课程编码


/** Useful Optional Functions **/
//Generate a random int number array, "beg" and "end" mark a range of the number you want in the array
function randomNumArr (len, beg, end) {
  var arr = [];
  for (var i = len - 1; i >= 0; i--) {
    var num = Math.ceil(Math.random() * (end - beg) + beg);
    arr.push(num);
  }
  return arr;
}
/** Optional Functions End **/


console.log('开始进行页面抓取和分析。。。。');

var postData = querystring.stringify({
  ddlXN: '2013-2014',
  ddlXQ: '1',
  DropDownList1: 'kcmc',
  __EVENTTARGET: 'DBGrid$ctl18$ctl00', //页码条件，00为第一页01为第二页，以此类推，这里只获取一页的内容
});

var postReq = http.request({
  host: 'jxgl.hdu.edu.cn',
  port: 80,
  path: '/jxrwcx.aspx',
  method: 'POST'
}, function (res) {
  if (res.statusCode !== 200) {
    console.error('子欲取其页而页不省也，故吾至止；子若又往，必请复乎。');
    process.exit();
  }

  //create db connection
  var db = new mongo.Db('wfsoft', new mongo.Server('localhost', 27017), {safe: true});
  var page = 1;
  console.log('开始分析课程页面第 ' + page + ' 页....');

  db.open(function (err, db) {
    if (!!err) {
      console.log(err);
    } else {
      res.on('data', function (chunk) {
        html += iconv.decode(chunk, 'gbk');
      }).on('end', function () {
        //create dom tree
        var htmlDom = $(html);

        //find each tr and analyse every avaliable tr
        htmlDom.find('table').find('tr').each(function () {
          //遍历遇到为已开课程时，将课程信息写入文件。
          if ($(this).find('td:eq(0)').html() === '已开') {
            console.log('找到一条可添加的课程');
            course._id = mongo.BSONPure.ObjectID(); //手动创建新的_id，因为在open之后不reopen的话，貌似mongo是不会自动为新增的insert创建新的_id
            course.name = $(this).find('td:eq(1)').text();
            course.comments = [];
            course.variable = {};
            course.variable.credit = $(this).find('td:eq(2)').text();
            course.variable.teacher = {};
            course.variable.attr = $(this).find('td:eq(4)').text();
            course.variable.teacher.name = $(this).find('td:eq(5)').text();
            course.code = $(this).find('td:eq(6)').text().match(/-([A-Z][0-9]{7}).*?-/);
            course.code = course.code[1] === undefined ? 'X0000000' :  course.code[1]; //如果可能遇到未能取到课程号的课程，统一将课程置为x0000000
            course.variable.time = {};
            course.variable.time.display = $(this).find('td:eq(8)').text();
            course.variable.place = {};
            course.variable.place.display = $(this).find('td:eq(9)').text();
            course.variable.college = $(this).find('td:eq(10)').text();

            //非课程页面能获取的课程参数，暂时采用控制域内的随机值或固定值
            course.variable.campus = '下沙校区';
            course.variable.selected = 0;
            course.variable.total = 120;
            course.variable.teacher.id = '40080';
            course.variable.stu = {};
            course.variable.stu.gender = {};
            course.variable.stu.gender.males = Math.ceil(Math.random() * (30 - 15) + 14);
            course.variable.stu.gender.females = Math.ceil(Math.random() * (46 - 11) + 10);
            course.data = {};
            course.data.diandao = {};
            course.data.diandao.date = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            course.data.diandao.rate = randomNumArr(12, 13, 45);
            course.data.taoke = {};
            course.data.taoke.date = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            course.data.taoke.rate = randomNumArr(12, 0, 10);
            course.data.score = {};
            course.data.score.average = (Math.ceil(Math.random() * (5 - 0) + 0)).toFixed(1);
            course.data.score.one = course.data.score.two = course.data.score.three = course.data.score.four = course.data.score.five = course.data.score.times = 0;

            //课程分析及变量创建成功，开始进行这条课程的db写入
            db.collection('course_mains', function (err, col) {
              console.log('开始写入数据...');
              col.insert(course, function (err, doc) {
                if (!!doc) {
                  console.log('插入一条课程成功!');
                } else if (doc === null) {
                  console.log('collection不存在，请检查');
                } else if (!!err) {
                  console.log(err);
                }
              });
            });
          } //如果为已开课程
        });
      });
    } //db连接成功
  });

});

postReq.write(postData);
postReq.end();