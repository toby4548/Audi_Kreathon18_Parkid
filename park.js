/* Build static webpage with express */
var express = require("express");
var serveStatic = require("serve-static");

var app = express();

app.use(express.static("www"));
app.use(function(req, res) {
  res.statusCode = 404;
  res.end("<h1>ERROR!</h1>");
});

var server = app.listen(5438, function() {
  console.log("server running at 5438 port.");
});

/* Open Serialport */

var SerialPort = require("serialport");
var serialPort = new SerialPort("COM5", {
  baudRate: 9600,
  parser: SerialPort.parsers.readline("\n")
});

/* Open database from mongoose */

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/sensors");
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  // we're connected!
  console.log("MongleDB Connected!");
});

/* Set up schema for mongoose */
var parkSchema = new mongoose.Schema({
  carID: String,
  function: Number,
  parkingspace: Number
});

/* establish socketio object */
var io = require("socket.io");
var serverIO = io(server);

/* Declare global variables */
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

const parkspace_to_function = {
  /*
  function -1: No function
  function 0: Hebebuehne(Raedern) 
  function 1: Hebebuehne(Raedern)+Spureinstellung
  function 2: Hebebuehne(Karosse)
  function 3: Verdeckwechsel
  function 4: Hebebuehne(Absauganlage+Motorpruefung)
  function 5: Elektropruefungen
  */

  1: [0],
  2: [0],
  3: [2],
  4: [3],
  5: [0],
  6: [1],
  7: [0],
  8: [0],
  9: [0],
  10: [5],
  11: [2],
  12: [2],
  13: [0],
  14: [4],
  15: [1]
};

const function_to_parkspace = {
  0: [1, 2, 5, 7, 8, 9, 13],
  1: [6],
  2: [15],
  3: [3, 11, 12],
  4: [4],
  5: [14],
  6: [10]
};

const grid_to_parkspace = swap(parkspace_to_grid);

/* Get data from database */
var db_carID;
var db_function;

parkSchema.methods.show = function() {
  console.log("Test");
  var msg =
    "carID" +
    this["carID"] +
    ", function_required" +
    this["function"] +
    ", parkingspace" +
    this["parkingspace"];

  console.log(msg);
};

/* Open serial port ****Remember to do this before open socketio***** */
serialPort.on("open", function() {
  console.log("Serial Connected!");
});

var mem = [];
var check = 0;
var check_car = 0;

/* Open SocketIO */
serverIO.on("connection", function(socket) {
  console.log("SocketIO start!");

  serialPort.on("data", function(d) {
    var instruction = [];
    /* parse json */
    var obj = JSON.parse(d);
    //console.log((obj["occupied"][56]));

    /* get keys */
    var carID = obj["carID"];
    var occupied = obj["occupied"]; //occupaied is an 1 by 64 matrix
    check = obj["check"];
    check_car = obj["check_car"];

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
        instruction.push("carID detected. \n Start parking service...");
        if (carID == "FF FF FF FF") {
          //console.log("carID is not valid...");
          instruction.push("carID is not valid...");
          ////////////Todo: set the check_car back to 0//////////
        } else {
          //console.log("Assigining parkingspace...");
          instruction.push(
            "Your carID is: " + carID + "\nAssigining parkingspace..."
          );
          /* Get carID information from database */
          var PARK = mongoose.model("pid1", parkSchema);
          PARK.find({ carID: carID }, function(err, docs) {
            if (err || !docs) {
              //console.log("Error! Not found in database!");
              /////////////////Todo: set check_car back to 0/////////////////
            } else {
              docs.forEach(function(d) {
                var data = new PARK(d);
                db_carID = data["carID"];
                db_function = data["function"];
                //data.show();

                /* get assign */
                var assign = get_assign(carID, db_function, occupied, check);
                if (assign.length > 0) {
                  mem = assign;
                  //console.log("Please park on parkplace No." + String(assign));
                  instruction.push(
                    "Please park at parkplace No." + String(assign)
                  );
                  /* Wait for check change to 1 from Arduino */
                  //break;
                } else {
                  //console.log("There is no parkingspace available.");
                  instruction.push("There is no parkingspace available.");
                  ////////////Todo: set the check_car back to 0////////////////
                  //break;
                }
              });
            }
          });
        }

        console.log("Got data from DB!");

      case 2: // state 2
        //console.log("Finish parking... \n Checking validity...");
        instruction.push("Finish parking... \n Checking validity...");
        var valid = false;
        //console.log(mem);
        var after_parking = check_availability(
          carID,
          mem,
          occupied,
          parkspace_to_grid,
          check
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

function get_assign(carID, db_carID, occupied, check) {
  let assign = [];
  /* Random decide for testing 
  let random_number = Math.random();
  if (random_number > 0.5) assign = [1];
  else assign = [2];
  */

  /* find all parkspace with the function */
  var functional_space = function_to_parkspace[db_carID];
  assign = functional_space;
  console.log(assign);

  assign = check_availability(
    carID,
    assign,
    occupied,
    parkspace_to_grid,
    check
  );
  return assign;
}

function check_availability(carID, assign, occupied, parkspace_to_grid, check) {
  console.log(check);
  console.log(assign);
  var copy_assign = assign.slice(0);
  for (let i = 0; i < copy_assign.length; i++) {
    let assign_on_grid = parkspace_to_grid[String(copy_assign[i])];
    //console.log(occupied);
    if (occupied[String(assign_on_grid)] == 1) {
      /* If the availability check is done after parking, get is parked space to DB */
      if (check == 1) {
        var parked_place = grid_to_parkspace[assign_on_grid];
        /* Find and update in DB */
        var UPDATE_PARK = mongoose.model("pid1", parkSchema);
        UPDATE_PARK.findOneAndUpdate(
          { carID: carID },
          { $set: { parkingspace: parked_place } },
          function(err, doc) {
            if (err) console.log("Database Error! Can't update parkspace");
            console.log(doc);
          }
        );
      }
      copy_assign.splice(i, 1);
    }
  }
  return copy_assign;
}

function swap(json) {
  var ret = {};
  for (var key in json) {
    ret[json[key]] = key;
  }
  return ret;
}
