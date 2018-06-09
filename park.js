var io = require("socket.io");
var express = require("express");
var serveStatic = require("serve-static");
var SerialPort = require("serialport");
var serialPort = new SerialPort("COM5", {
  baudRate: 9600,
  parser: SerialPort.parsers.readline("\n")
});

/* Build static webpage with express */
var app = express();

app.use(express.static("www"));
app.use(function(req, res) {
  res.statusCode = 404;
  res.end("<h1>ERROR!</h1>");
});

var server = app.listen(5438, function() {
  console.log("server running at 5438 port.");
});

/* establish socketio object */
var serverIO = io(server);

var matrix;

/* Open serial port ****Remember to do this before open socketio***** */
serialPort.on("open", function() {
  console.log("Serial Connected!");
});

/* Open SocketIO */
serverIO.on("connection", function(socket) {
  var occupied = 0;

  serialPort.on("data", function(d) {
    //console.log("Data from Arduino:" + d);

    /* parse json */
    var obj = JSON.parse(d);
    occupied = Number(obj.occupied);

    //console.log(besetzt);

    serverIO.sockets.emit("occupied", { val: occupied });
  });
});
