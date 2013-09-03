/**
 * User用户表的model操作方法封装
 *
 * @author Daishengxiang
 */

var mongoose = require('./db');
var Schema = mongoose.Schema;

var _User = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  realname: {
    type: String,
    required: true
  },
  type: {
    type: Number,
    default: 1
  },
  gender: {
    type: String,
    default: 1
  },
  salt: {
    type: String
  }
});

var UserModel = mongoose.model('User', _User);

/**
 * 通过用户名查找用户信息
 * @param  {[type]}   username [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
UserModel.findByUsername = function(username, invisible, callback) {
  UserModel.findOne({
      username: username
    },
    invisible,
    function(err, data) {
      if (err) {
        return callback(err, null);
      } else {
        return callback(err, data);
      }
    });
}


module.exports = UserModel;