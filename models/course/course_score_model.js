var mongoose = require('../db');
var Schema = mongoose.Schema;

var _Course = new Schema({
  username: { type: String, required: true, unique: true },
  gScore: {
    type: Array
  }
});

var CourseModel = mongoose.model('course_score', _Course);

CourseModel.setOnesScore = function (params, callback) {
  

    var username = params.username;
    var gScore = [{
      code: params.code,
      score: params.score,
      time: Date.now()
    }];

    CourseModel.findOne({ username: username }, {username: 1}, function (err, data) {
      if (data) {
        CourseModel.findOne({ 'gScore.code': gScore[0].code }, {}, function (err, data) {
          if (!data) {
            CourseModel.update({username: username}, {$push: { gScore: gScore[0] }}, function (err, data) {
              if (!err) {
                callback(null, data);
              } else {
                callback(err, null);
              }
            });
          } else {
            callback('Marked already.', null);
          }
        });
      } else {
        CourseModel.create({username: username, gScore: gScore}, function (err, data) {
          callback(err, data)
        });
      }
    });
    
}

module.exports = CourseModel;