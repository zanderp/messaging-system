//initializing variables
var https 		   = require('https');
var express      = require('express');
var fs           = require('fs');
var _            = require('underscore');
var path         = require('path');
//persistent session
var session      = require('express-session'),
    cookie       = require('cookie'),
    cookieParser = require('cookie-parser'),
    sessionStore = new session.MemoryStore();

    //included rooms
var COOKIE_SECRET= 'secret';
var COOKIE_NAME  = 'sid';
var sid = '';
var options      = {
    key : fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt')
};
//initializing database variable
var mongoose   = require('mongoose');
require('./app/config/database')(mongoose);
//setting up the port.
var port         = 3000;
//initialize the app
var app          = express();
//getting user model
var User         = require('./app/models/user');
//getting message model
var Message      = require('./app/models/message');
//getting links model
var Userlinks  = require('./app/models/userlinks');
//setting up the json and parser for the API
var bodyParser   = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app session
app.use(cookieParser(COOKIE_SECRET));
app.use(session({
    name: COOKIE_NAME,
    store: sessionStore,
    secret: COOKIE_SECRET,
    saveUninitialized: true,
    resave: true,
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: null
    }
}));
sharedsession = require("express-socket.io-session");
//getting the chat model
var chat     = require('./app/models/chat');
//getting template engine and setting it up
var exphbs       = require('express-handlebars');
app.set('views', __dirname + '/app/views');
app.engine('.hbs', exphbs( { extname: '.hbs', defaultLayout: 'default' } ) );
app.set( 'view engine', '.hbs' );
app.use(express.static(__dirname + '/public'));
app.set('client', __dirname + 'client');
//getting the routes
var router = express.Router();
require('./app/routes.js')(router, app, path, User, Message, Userlinks);
app.use('/api', router);
//creating the server and logging it
var secure = https.createServer(options, app).listen(port, function(secure){
  console.log('Secure port opened on 3000.');
});
var io = require('socket.io').listen(secure);
//______________variables we need_______________//
var counter = 0;
//number of online users within our app
var online_users = 0;
//initializing the people object
var people = {};
//intializing the notifications list
var notifications = {};
//initializing the socket connection and establish the handshake
io.sockets.on('connection', function (socket) {
//Getting valuable data from handshake
  var handshakeData = socket.request;
  hid = handshakeData._query['uid'];
  himg = handshakeData._query['img'];
  nickname = handshakeData._query['nickname'];
  online_users += 1; // Will be adding the user to the online users
  socket.nickname = nickname;//Setting socket object values
  socket.uid = hid;
  //We will update the existing user's photo and nickname
  if(hid != undefined){
    User.update(
     { uid: hid },
     { $set:
        {
          img: himg,
          nickname:nickname
        }
     }
    );
  }
  init_users(socket); // Send the users list
  //Command to register or update the user into the our database
  socket.on('init', function (data) {
    User.findOne({
      uid: data[2] //finding the user by id
    },
    function (err, user) {
      if (user) {

        socket.emit('pseudoStatus', 'ok');// We will emit the status to proceed
        //Prepairing online user for listing
        var sock_exists = findUserByID(data[2]);
        if(sock_exists == false){
          people[socket.id] = {"nickname" : data[0], "device": data[1], "sid": socket.id, "uid": data[2], "uimg": data[3]};
        }else{
          socket.to(sock_exists).emit('kicked');
          if (io.sockets.connected[sock_exists]) {
            io.sockets.connected[sock_exists].disconnect();
          }
          people[socket.id] = {"nickname" : data[0], "device": data[1], "sid": socket.id, "uid": data[2], "uimg": data[3]};
        }

        socket.emit("joined"); //extra emit for GeoLocation
        //socket broadcast to display online notification
        socket.broadcast.emit('online', data[0]);
        setTimeout(function () {
          reloadUsers(socket);
        }, 1000);
      } else {//if the users isn't found we will add it to the database
        var newuser = new User({
          nickname: data[0],
          uid: data[2],
          img: data[3]
        });
        newuser.save(function(err) {
          if (err) throw err;
          socket.emit('pseudoStatus', 'ok');
          people[socket.id] = {"nickname" : data[0], "device": data[1], "sid": socket.id, "uid": data[2], "uimg": data[3]};
          reloadUsers(socket);
          socket.emit("joined"); //extra emit for GeoLocation
          socket.broadcast.emit('online', data[0]);
        });
      }
    });
    var init_notifications = [];
    Message.find({hid: data[2],read: 0},function(err, messages){
      console.log(data[2]);
      messages.forEach(function(message){
        init_notifications[init_notifications.length] = message;
      });
      console.log(init_notifications);
      socket.emit('init_notifications',init_notifications);
    });
  });
  socket.on('send-pm', function(sender, receiver , message) {
      var u1 = findUserByID(sender);
      var u2 = findUserByID(receiver);
      var dd =  new Date();
      //We send the message to the sender
      socket.emit('private-message', [message, people[u1].nickname, dd, people[u1].uid, people[u1].uimg, receiver]);
      console.log('Message sent to the clients');
      //We send the message to the receiver
      socket.to(u2).emit('private-message', [message, people[u1].nickname, dd, people[u1].uid, people[u1].uimg, receiver]);
      //socket.emit('pm', [message, people[socket.id].name, dd, room, people[socket.id].uid, people[socket.id].uimg]);
      //we check if the user is in the links or if not we will add it
      Userlinks.find({
        uid: sender,
        hid: receiver
      },function (err, userlinks) {
        if (err) throw err;
        if (userlinks.length > 0) {
          console.log('It exists.');
        }else{
          var links = new Userlinks({
            uid: sender,
            hid: receiver
          });
          links.save(function(err) {
            if (err) throw err;
            console.log('Added userlinks');
          });
          var links2 = new Userlinks({
            uid: receiver,
            hid: sender
          });
          links2.save(function(err) {
            if (err) throw err;
            console.log('Added userlinks 2');
          });
        }
      });
      //We save the message into the database
      var dbmessage = new Message({
          message: message,
          name: people[u1].nickname,
          date: dd,
          uid: sender,
          hid: receiver,
          uimg: people[u1].uimg,
          read: 0
        });
      dbmessage.save(function(err) {
        if (err) throw err;
        console.log("Messge saved.");
      });
  });
  //Read Message function
  socket.on('read-meassage',function(data){
    console.log('called');
    Message.findByIdAndUpdate(data, {$set:{read:1}},function(err, response){
      console.log(err);
      console.log(response);
    });
  });
  //IsTyping
  socket.on("typing", function(sender, receiver) {
      var u = findUserByID(receiver);
      //Broadcast to the receiver that the sender is typing
      socket.to(u).emit("isTyping", {showit: true, person: people[socket.id].nickname, uid: sender});
  });
  //Location
  socket.on("location-update", function(data) {
    //We show the flag
		location = data.country.toLowerCase();
		people[socket.id].country = location;
    //reloading the online users to display the location as well
		reloadUsers(socket);
	});
  //Private messages history
  socket.on('history',function(sender, receiver){
    var history = [];
    Message.find({uid: sender, hid: receiver},function(err, messages){
      messages.forEach(function(message){
        history[history.length] = message;
      });
    });
    Message.find({uid: receiver, hid: sender},function(err, messages){
      messages.forEach(function(message){
        history[history.length] = message;
      });
      socket.emit('user-history', history);
    });
  });
  //Managing Disconnection
  socket.on('disconnect', function () {
		  online_users -= 1; //We alter the online user count
      name = socket.nickname;
      socket.broadcast.emit('disconnect-notification', name);
      //socks.splice(socks.indexOf(socket), 1);
      //we will delete the person from the online people list
    	delete people[socket.id];
      //we will reload the users to the client side
      reloadUsers(socket);

		if (checkSocket(socket))
		{
			console.log(name+ " went offline.");
		}
	});
});
function init_users(socket){
  //initializing the userMap/all users variable
  var userMap = {};
  Userlinks.find({
    uid: socket.uid
  },function (err, userlinks) {
    if(userlinks.length > 0){
      console.log('In if');
      userlinks.forEach(function(userlink){
        if(userlink.hid){
          var hid = userlink.hid;
          User.find({uid: hid}, function(err, users) {
            users.forEach(function(user) {
              userMap[user._id] = user;// Getting the users from the database
            });
          });
        }
     });
    }
  });
  // User.find({}, function(err, users) {
  //   users.forEach(function(user) {
  //     userMap[user._id] = user;// Getting the users from the database
  //   });
  // });
  setTimeout(function () {
    socket.emit('allUsers', {"nb": online_users, "pseudos": userMap});//This will send all the users
  }, 1000);

}
function reloadUsers(socket) { // Send the count of the users to all

  io.sockets.emit("update-people", {people: people, count: online_users});//This will send the online users
  counter = counter + 1;
  console.log(socket);
  setTimeout(function () {
    var init_notifications = [];
    Message.find({hid: socket.uid, read: 0},function(err, messages){
      messages.forEach(function(message){
        init_notifications[init_notifications.length] = message;
      });
      socket.emit('init_notifications',init_notifications);
    });
  }, 3000);
  console.log(counter);
}
function findUserByID(id) {
    for(socketID in people) {
        if(people[socketID].uid == id) {
            return test = socketID;//we will return the socket of the user with the given id
        }
    }
  return false;
}
// Test the socket
function checkSocket(socket) {
	var test;
	if (socket.nickname == null ) test = false;
	else test = true;
	return test;
}
