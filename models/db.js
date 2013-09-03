/**
 * 连接mongoose
 */

var settings = require('../global-setting');
var mongoose = require('mongoose');
mongoose.connect('mongodb://' + settings.host + '/' + settings.db);

module.exports = mongoose;