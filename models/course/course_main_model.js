/**
 * courses_main_model
 */

var mongoose = require('../db');
var Schema = mongoose.Schema;

var _Course = new Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String
  },
  variable: {
    stu: {
      gender: {
        males: { type: Number, default: 0 },
        females: { type: Number, default: 0 }
      }
    },
    teacher: {
      name: {
        type: String
      },
      id: {
        type: Number
      }
    },
    time: {
      display: {
        type: String
      },
      week: {
        begin: {
          type: Number
        },
        end: {
          type: Number
        }
      },
      section: {
        begin: {
          type: Number
        },
        end: {
          type: Number
        }
      }
    },
    place: {
      display: {
        type: String
      },
      building: {
        type: String
      },
      room: {
        type: String
      }
    },
    credit: {
      type: String
    },
    selected: {
      type: Number
    },
    total: {
      type: Number
    },
    attr: {
      type: String
    },
    campus: {
      type: String
    },
    college: {
      type: String
    }
  },
  data: {
    score: {
      one: {
        type: Number,
        default: 0
      },
      two: {
        type: Number,
        default: 0
      },
      three: {
        type: Number,
        default: 0
      },
      four: {
        type: Number,
        default: 0
      },
      five: {
        type: Number,
        default: 0
      },
      average: {
        type: String,
        default: 0
      },
      times: {
        type: Number,
        default: 0
      }
    },
    taoke: {
      date: { type: Array, default: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      rate: { type: Array, default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    },
    diandao: {
      date: { type: Array, default: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      rate: { type: Array, default: [23, 22, 24, 20, 23, 22, 25, 22, 20, 21, 22, 23] }
    }
  },
  comments: {
    type: Array
  }
});

var CourseModel = mongoose.model('course_main', _Course);

CourseModel.findAllCourses = function(filter, callback) {

  CourseModel.find({}, filter, function(err, data) {
    if (err) {
      return callback(err, null);
    } else {
      return callback(err, data);
    }
  });

}

CourseModel.findByCode = function (code, filter, callback) {

  CourseModel.findOne({code: code}, filter, function (err, data) {
    if (err) {
      return callback(err, null);
    } else {
      return callback(err, data);
    }
  });

}

CourseModel.getNameByCode = function (code, callback) {

  CourseModel.findOne({code: code}, {name: 1}, function (err, data) {
    if (!!err) {
      return callback(err, null);
    } else if (!data) {
      return callback('db has a empty result.', null);
    } else if (!!data) {
      return callback(err, data);
    }
  });

}

/**
 * 验证是否允许选课，响应并增加单一用户单次提交的选课请求
 * @param {[type]}   itemCode [description]
 * @param {Function} callback [description]
 */
CourseModel.addOneSelected = function(itemCode, callback) {
  CourseModel.findOne({
    code: itemCode
  }, {
    'variable.selected': 1,
    'variable.total': 1
  }, function(err, data) {
    if (err) {
      return callback(err, null);
    } else {
      if (data.variable.selected === data.variable.total) {
        var tmpErr = {msg: 'No free space.'};
        callback(tmpErr, null);
      } else {
        CourseModel.update({
          code: itemCode
        }, {
          $inc: {
            'variable.selected': 1
          }
        }, {
          multi: true
        }, function(err, data) {
          if (err) {
            return callback(err, null);
          } else {
            return callback(err, data);
          }
        });
      }
    }
  });
}

CourseModel.addOneScore = function (params, callback) {
  var grade = params.score;
  var code = params.code;

  //当mongodb执行函数filed2需要填入变量时需要这样操作，使变量允许进入对象中。
  //because JS doesn't permit anything other than constant strings in object literal syntax
  var incPart = {};
  incPart['data.score.' + grade] = 1;
  incPart['data.score.times'] = 1;

  CourseModel.update({ code: code }, { $inc: incPart }, function (err, data) {
      if (err) {
        return callback(err, null);
      } else {
        CourseModel.find({ code: code }, { 'data.score' : 1 }, function (err, data) {
          if (!!err) {
            return callback(err, data);
          } else {
            var average = (data[0].data.score.five * 5 + data[0].data.score.four * 4 + data[0].data.score.three * 3 + data[0].data.score.two * 2 + data[0].data.score.one) / data[0].data.score.times;
            average = average.toFixed(1);

            CourseModel.update({ code: code }, { $set : { 'data.score.average' : average }}, function (err, data) {
              return callback(err, data);
            });
          }
        });
        
        // return callback(err, data);
      }
  });

}




module.exports = CourseModel;