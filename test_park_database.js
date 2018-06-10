var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/sensors');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("connected");
});


var parkSchema = new mongoose.Schema({
    'carID': Number,
    'function_required': Number,
    'parkingspace':{ type: Date, default: Date.now }
});

console.log("test");


// å®šç¾©è‡ªè¨‚çš„show()æ–¹æ³•
parkSchema.methods.show = function () {
  console.log("Test");
  var msg = "carID" + this['carid'] +
	      ", function_required" + this['function'] + 
          ", parkingspace" + this['parkspace'];

  console.log(msg); 
}

// å»ºç«‹æ¨¡åž‹
var PARK = mongoose.model('park', parkSchema);

PARK.find(function (err, docs) {
  if ( err || !docs) {
    console.log("æ‰¾ä¸åˆ°dht11çš„è³‡æ–™ï¼");
  } else {
    docs.forEach(function(d) {
      var data = new PARK(d);  // ç”¢ç”Ÿè³‡æ–™ç‰©ä»¶
      data.show();
    });
  }
});


