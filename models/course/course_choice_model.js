/**
 * courses_model
 */

var mongoose = require('../db');
var Schema = mongoose.Schema;

var _CourseChoice = new Schema({
  username: { type: String, required: true },
  time: { type: Date },
  choice: { type: Array, required: true }
});

var CourseChoiceModel = mongoose.model('course_choice', _CourseChoice);

/**
 * 插入一条选课记录，以学号为唯一字段
 * @param {[type]}   obj      [description]
 * @param {Function} callback [description]
 */
CourseChoiceModel.setNewItem = function(obj, callback) {
  
  var instance = new CourseChoiceModel(obj);
  CourseChoiceModel.findOne({ username: obj.username }, { choice: 1 }, function (err, data) {
    if (!!err) {
      return callback(err, null);
    } else if (data === null) {
      //return callback(err, null);
      
      instance.save(function(err, data) {
        if (err) {
          return callback(err, null);
        } else {
          //如果需要让后面的函数继续执行下一步，则返回true
          return callback(null, true);
        }
      });

    } else {
      //遍历选择结果数组，并判断当前提交项是否已经选择
      var flag = false;
      for (var i in data.choice) {
        if (obj.choice === data.choice[i]) {
          flag = false;
          break;
        } else {
          flag = true;
        }
      }

      if (flag === true) {
        //如果不存在重复选课，写入新的选课内容，然后返回真
        CourseChoiceModel.update({ username: obj.username }, { $push: { choice: obj.choice } }, function(err, data) {
          if (err) {
            return callback(err, null);
          } else {
            return callback(err, data);
          }
        });
        return callback(null, true);
      } else {
        return callback('Already choosen.', null);
      }
      
    }
  });

  
}


module.exports = CourseChoiceModel;