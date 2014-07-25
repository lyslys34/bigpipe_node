var fs = require('fs'),
    watch = require('node-watch');

var path = require('path');

var express = require('express');
var http = require('http');
var app = express();

var server = null;

function startServer() {
  server = http.createServer(app);
  server.listen(3000);
}

startServer();

var sockets = [];
server.on('connection', function (socket) {
    sockets.push(socket);
    socket.once('close', function () {
        sockets.splice(sockets.indexOf(socket), 1);
    });
});

function closeServer() {
    sockets.forEach(function (socket) {
        socket.destroy();
    });
    server.close(function () {
        console.info('close http server'); 
    });
    delete server;
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



app.use(function (req, res) {
  var file = fs.readFileSync('config.js', 'utf-8');
  console.info(typeof file);
  var fileJSONString = JSON.stringify(file);
  var fileObj = JSON.parse(fileJSONString);
  res.render('layout1',{
      s1: 'Hello',
      s2: 'world'
  });
});

watch('config.js', function (filename) {
    console.log(filename, ' changed');
    var file = fs.readFileSync('config.js', 'utf-8');
    console.info('file: ', file);
    closeServer();
    startServer();
});