var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ChatSchema   = new Schema({
    name: String
});

module.exports = mongoose.model('Chat', ChatSchema);
