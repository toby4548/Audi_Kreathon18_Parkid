var io = require('socket.io');
var express = require("express");
var serveStatic = require('serve-static');

var five = require("johnny-five");
var board = new five.Board({
                  port: "/dev/ttyACM0"
                   });

var app = express();

app.use(express.static('matrix'));
app.use(function(req, res){
	res.statusCode = 404;
	res.end("<h1>ERROR!</h1>");
})

var server = app.listen(5438, function() {
   console.log("server running at 5438 port.");
});

var serverIO = io(server);

var matrix;
var new_value = 0;

serverIO.on('connection', function(socket){
  serverIO.emit('occupied',{'val': new_value})
/*
  socket.on('live_matrix', function(data) {
    if (matrix != null) {
    	matrix.draw(data.m);
     }
  });
*/
});

board.on("ready", function() {

  matrix = new five.Led.Matrix({
    pins: {
      data: 11,
      clock: 13,
      cs: 10
    }
  });

  matrix.on();

  var cds = new five.Sensor("A0");
  var oldVal = 0;
  
  cds.scale([0, 100]).on("change", function() {
    newVal = Math.floor(this.value);
	  
    if (newVal != oldVal) {
      serverIO.sockets.emit('occupied', { 'val': newVal });  // 傳出即時感測資料
    }
    oldVal = newVal;
 });
});
