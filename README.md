#  Messaging system

##  Basic usage and development instructions

###  To get the app

On the server create a new directory, navigate into it and fill in the following commands.

`git config --global user.name "your username"`

`git config --global user.email "your email"`

`git init`

`git remote add origin https://github.com/zanderp/messaging.git`

`git pull origin master`

###  To run the server:

`npm install` - to get all the dependences

`npm install -g pm2`

`pm2 start server.js --name="Messaging system"`

pm2 is an app that will make our application as a service. We can do live modifications on the app without the need to restart the app.

* Update

Locked ports on mongodb server. To allow other servers to connect to the mongodb server, login into the mongodb server and run the following commmands:

`sudo ufw allow from the_ip_of_the_other_server_that_needs_mongodb/32 to any port 27017`

`sudo ufw status`

##Messaging API

###USERS

/api/users - get all USERS/create get/post

/api/users/id - edit/delete post/delete

###MESSAGES

/api/messages - get all MESSAGES/create get/post

/api/messages/id - edit/delete post/delete

###LINKS

/api/links - get all LINKS/create get/post

/api/links/id - edit/delete post/delete
