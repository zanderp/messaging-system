var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageSchema   = new Schema({
    message: String,
    name: String,
    date: Date,
    uid: String,
    hid: String,
    uimg: String,
    read: String,
});
var Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
