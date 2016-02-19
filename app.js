var login = require("facebook-chat-api");
var fs = require('fs');
var CONFIG = require("./config");

var http = require('http');
var url = require('url');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var getUri = require('get-uri');

app.get('/', function(req, res){
  res.sendfile(__dirname+'/index.html');
});

app.get('/bj', function(req, res){
  res.sendfile(__dirname+'/public/assets/bj.JPG');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

login({email: CONFIG.email, password: CONFIG.password}, function callback (err, api) {
  io.on('connection', function(socket){
    if(err) return console.error(err);

    socket.on("loaded", function(data) {
      var base64Data = data.image.replace(/^data:image\/png;base64,/, "");
      var time = new Date().getTime().toString();
      require("fs").writeFile('images/' + time + '.png', base64Data, 'base64', function(err) {
         api.sendMessage({attachment: fs.createReadStream(__dirname+'/images/' + time + '.png')}, data.to, function(err, success) {
          if (err) {console.log(err); return;}
        });     
      });    
    });

    api.listen(function callback(err, message) {
      var msgBody = message.body.trim();
      trigger = "bjaylmao"
      if (msgBody.indexOf(trigger) === 0) {
        msg = msgBody.substring(trigger.length, msgBody.length).trim();
        if (msg.length === 0) {
          api.sendMessage({attachment: fs.createReadStream(__dirname+'/public/assets/bj.jpg')}, message.threadID, function(err, success) {
            if (err) {console.log(err); return;}
          });   
        } else {
          io.emit("new message", {"message": msg, "to": message.threadID});
        }
      }
    });  

    socket.on('error', function (err) {console.log(err); console.error(err.stack);});
  });
});