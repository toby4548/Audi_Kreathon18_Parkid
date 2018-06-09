var io = require("socket.io");
var express = require("express");
var serveStatic = require("serve-static");

// Import Serialport package

var SerialPort = require("serialport");
var serialPort = new SerialPort("COM5", {
  baudRate: 9600,
  parser: SerialPort.parsers.readline("\n")
});


//var five = require("johnny-five");
//var board = new five.Board();

// Build static webpage with express
var app = express();

app.use(express.static("park"));
app.use(function(req, res) {
  res.statusCode = 404;
  res.end("<h1>ERROR!</h1>");
});

var server = app.listen(5438, function() {
  console.log("server running at 5438 port.");
});

// Import socketio
var serverIO = io(server);

var matrix;
var new_value = 0;

serverIO.on("connection", function(socket) {
  serverIO.emit("occupied", { val: new_value });
});

/*
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
      serverIO.sockets.emit("occupied", { val: newVal }); // 傳出即時感測資料
    }
    oldVal = newVal;
  });
});
*/

// Get Data from Arduino via serialport

var obj;
var besetzt = 0;
serialPort.on("open", function() {
  console.log("Serial Connected!");

  serialPort.on("data", function(d) {
    
    console.log("Data from Arduino:" + d);
    obj = JSON.parse(d);
    besetzt = Number(obj.besetzt);
    console.log(besetzt);
    serverIO.sockets.emit("occupied", { val: besetzt });
    
    const parser = usbport.pipe(new Readline()); 
    parser.on('data', console.log);
  });
});


// interprete this data

