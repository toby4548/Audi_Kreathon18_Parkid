var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/sensors');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("connected");
});


var parkSchema = new mongoose.Schema({
    'carID': String,
    'function': Number,
    'parkingspace':Number
});

console.log("test");


// å®šç¾©è‡ªè¨‚çš„show()æ–¹æ³•
parkSchema.methods.show = function () {
  console.log("Test");
  var msg = "carID" + this['carID'] +
	      ", function_required" + this['function'] + 
          ", parkingspace" + this['parkingspace'];

  console.log(msg); 
}

// å»ºç«‹æ¨¡åž‹
var PARK = mongoose.model('pid1', parkSchema);

/*
PARK.find({'carID':'1A 2B 3C 4D'}, function (err, docs) {
  if ( err || !docs) {
    console.log("æ‰¾ä¸åˆ°dht11çš„è³‡æ–™ï¼");
  } else {
    docs.forEach(function(d) {
      var data = new PARK(d);  // ç”¢ç”Ÿè³‡æ–™ç‰©ä»¶
      data.show();
    });
  }
});
*/
var place;
PARK.find({'carID':'1A 2B 3C 4D'}).exec(function(err,data){
  if (err) console.log("Error");
  place = data['parkingplace'];
  console.log( data);
});

PARK.find({'carID':'1A 2B 3C 4D'}).exec(function(err,data){
  if (err) console.log("Error");
  place = data['function'];
  console.log(data);
});

