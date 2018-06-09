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
const parkspace_to_grid = {
  1: 56,
  2: 57,
  3: 58,
  4: 59,
  5: 55,
  6: 47,
  7: 39,
  8: 31,
  9: 23,
  10: 32,
  11: 33,
  12: 34,
  13: 35,
  14: 0,
  15: 3
};

/* Open serial port ****Remember to do this before open socketio***** */
serialPort.on("open", function() {
  console.log("Serial Connected!");
});

var mem = [];

/* Open SocketIO */
serverIO.on("connection", function(socket) {
  serialPort.on("data", function(d) {
    var instruction = [];
    /* parse json */
    var obj = JSON.parse(d);
    //console.log((obj["occupied"][56]));

    /* get keys */
    var carID = obj["carID"];
    var occupied = obj["occupied"]; //occupaied is an 1 by 64 matrix
    var check = obj["check"];
    var check_car = obj["check_car"];

    /* Implement workflow with finite state machine*/
    var state;
    /* state 0: waiting, state 1: parking, state 2: validation */
    if (check_car == 1) {
      if (check == 1) state = 2;
      else state = 1;
    } else state = 0;

    switch (state) {
      case 0: // state 0
        //console.log("Waiting...");
        instruction.push("Waiting...");
        break;

      case 1: // state 1
        //console.log("Start parking process...");
        instruction.push("Start parking process...");
        if (carID == "FF FF FF FF") {
          //console.log("carID is not valid...");
          instruction.push("carID is not valid...");
          ////////////Todo: set the check_car back to 0//////////
        } else {
          //console.log("Assigining parkingspace...");
          instruction.push("Assigining parkingspace...");
          /* get assign */
          var assign = get_assign(carID, occupied);
          if (assign.length > 0) {
            mem = assign;
            //console.log("Please park on parkplace No." + String(assign));
            instruction.push("Please park on parkplace No." + String(assign));
            /* Wait for check change to 1 from Arduino */
            break;
          } else {
            //console.log("There is no parkingspace available.");
            instruction.push("There is no parkingspace available.");
            ////////////Todo: set the check_car back to 0////////////////
            break;
          }
        }

      case 2: // state 2
        //console.log("Finish parking... \n Checking validity...");
        instruction.push("Finish parking... \n Checking validity...");
        var valid = false;
        //console.log(mem);
        var after_parking = check_availability(
          mem,
          occupied,
          parkspace_to_grid
        );
        //console.log(mem);
        //console.log(after_parking);
        if (mem.length > after_parking.length) {
          valid = true;
          //console.log("You are correctly parked!");
          instruction.push("You are correctly parked!");
          mem = [];
          /////////Todo: set the check_car back to 0///////////
          break;
        } else {
          valid = false;
          //console.log("You parked at wrong place! \n Please park again.");
          instruction.push("You parked at wrong place! \n Please park again.");
          mem = [];
          ///////////Todo: set the check back to 0/////////////
          break;
        }
    }

    /////////////Todo: emit UI to browser ////////////////
    serverIO.sockets.emit("park", {
      occupied: occupied,
      instruction: instruction
    });
  });
});

function get_assign(carID, occupied) {
  let random_number = Math.random();
  let assign = [];

  /* Random decide */
  //if (random_number > 0.5) assign = [1];
  //else assign = [2];
  assign = [1];

  assign = check_availability(assign, occupied, parkspace_to_grid);
  return assign;
}

function check_availability(assign, occupied, parkspace_to_grid) {
  var copy_assign = assign.slice(0);
  for (let i = 0; i < copy_assign.length; i++) {
    let assign_on_grid = parkspace_to_grid[String(copy_assign[i])];
    //console.log(occupied);
    if (occupied[String(assign_on_grid)] == 1) copy_assign.splice(i, 1);
  }
  return copy_assign;
}
