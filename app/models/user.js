var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    nickname: String,
    uid: String,
    img: String,
});
var User = mongoose.model('User', UserSchema);
module.exports = User;
