var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserlinksSchema   = new Schema({
    uid: String,
    hid: String
});
var Userlinks = mongoose.model('Userlinks', UserlinksSchema);
module.exports = Userlinks;
