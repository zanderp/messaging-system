module.exports = function(router, app, path, User, Message, Userlinks){
  //---------------------------------------//
  // middleware to use for all requests
  router.use(function(req, res, next) {
  	// do logging
  	console.log('Something is happening.');
  	next();
  });
  router.route('/messages')
	.post(function(req, res) {
		var message = new Message();		// Create message object
		message.message = req.body.message;  //using the request to get messages
    message.name = req.body.name;
    message.date = req.body.date;
    message.uid = req.body.uid;
    message.hid = req.body.hid;
    message.uimg = req.body.uimg;
    message.read = 0;
		message.save(function(err) {
			if (err)
				res.send(err);
			res.json({ message: 'New message was created!' });
		});
	})
	.get(function(req, res) {
		Message.find(function(err, messages) {
			if (err)
				res.send(err);

			res.json(messages);
		});
	});
router.route('/messages/:message_id')
	.get(function(req, res) {
		Message.findById(req.params.message_id, function(err, message) {
			if (err)
				res.send(err);
			res.json(message);
		});
	})
	.put(function(req, res) {
		Message.findById(req.params.message_id, function(err, message) {
			if (err)
				res.send(err);
        message.message = req.body.message;  //using the request to get messages
        message.name = req.body.name;
        message.date = req.body.date;
        message.uid = req.body.uid;
        message.hid = req.body.hid;
        message.uimg = req.body.uimg;
        message.read = req.body.read;
			Message.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Message updated!' });
			});

		});
	})
	.delete(function(req, res) {
		Message.remove({
			_id: req.params.message_id
		}, function(err, message) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});
  //---------------------------------------//
  router.route('/users')
	.post(function(req, res) {
		var user = new User();
		user.nickname = req.body.nickname;
    user.uid = req.body.uid;
    user.img = req.body.img;
		user.save(function(err) {
			if (err)
				res.send(err);
			res.json({ message: 'New user was created!' });
		});
	})
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err)
				res.send(err);

			res.json(users);
		});
	});
router.route('/users/:user_id')
	.get(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err)
				res.send(err);
			res.json(user);
		});
	})
	.put(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err)
				res.send(err);
        user.nickname = req.body.nickname;
        user.uid = req.body.uid;
        user.img = req.body.img;
			User.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'User updated!' });
			});

		});
	})
	.delete(function(req, res) {
		User.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err)
				res.send(err);
			res.json({ message: 'Successfully deleted' });
		});
	});
  //---------------------------------------//
  router.route('/links')
  .post(function(req, res) {
    var link = new Userlinks();
    link.nickname = req.body.uid;
    link.uid = req.body.hid;
    link.save(function(err) {
      if (err)
        res.send(err);
      res.json({ message: 'New link was created!' });
    });


  })
  .get(function(req, res) {
    Userlinks.find(function(err, links) {
      if (err)
        res.send(err);

      res.json(links);
    });
  });
router.route('/links/:link_id')

  // get the bear with that id
  .get(function(req, res) {
    UserLinks.findById(req.params.link_id, function(err, link) {
      if (err)
        res.send(err);
      res.json(link);
    });
  })
  .put(function(req, res) {
    Userlinks.findById(req.params.link_id, function(err, link) {
      if (err)
        res.send(err);
        link.nickname = req.body.uid;
        link.uid = req.body.hid;
      Userlinks.save(function(err) {
        if (err)
          res.send(err);
        res.json({ message: 'Link updated!' });
      });

    });
  })
  .delete(function(req, res) {
    Userlinks.remove({
      _id: req.params.link_id
    }, function(err, link) {
      if (err)
        res.send(err);
      res.json({ message: 'Successfully deleted' });
    });
  });
  //---------------------------------------//
  // app.get('/usersList', function(req, res) {
  //   User.find({}, function(err, users) {
  //     var userMap = {};
  //     users.forEach(function(user) {
  //       userMap[user._id] = user;
  //     });
  //     res.send(userMap);
  //   });
  // });
  // app.get('/messagesList', function(req,res){
  //   Message.find({}, function(err, messages) {
  //     var messagesMap = {};
  //     messages.forEach(function(message) {
  //       messagesMap[message._id] = message;
  //     });
  //     res.send(messagesMap);
  //   });
  // });
  // app.get('*', function (req, res) {
  //   res.sendFile('index.html',  { root: path.join(__dirname, '../client') });
  // });

  // app.get('/', function( req, res, next ) {
  //   return res.render('index');
  // });
}
