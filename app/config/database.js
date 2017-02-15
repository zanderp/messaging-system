module.exports = function(mongoose){
    mongoose.connect('mongodb://52.62.135.253:27017/chat');// initializing database connection
    //mongoose.connect('mongodb://localhost:27017/chat');// initializing database connection
}
