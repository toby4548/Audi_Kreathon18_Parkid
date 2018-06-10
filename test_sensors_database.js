var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/sensors');
console.log("Connected!\n");

// è¨­ç½®ç¶±è¦
var dht11Schema = new mongoose.Schema(
  {
    'Temperature': Number,
    'Moisture': Number,
    'Time': { type: Date, default: Date.now }
  }
);

// å®šç¾©è‡ªè¨‚çš„show()æ–¹æ³•
dht11Schema.methods.show = function () {
  var msg = "Temperatureï¼š" + this['Temperatur'] +
	      ", Moistureï¼š" + this['Moisture'] + 
          ", Timeï¼š" + this['Time'];

  console.log(msg);  // åœ¨æŽ§åˆ¶å°è¼¸å‡ºæº«ã€æ¿•åº¦å’Œæ™‚é–“è³‡æ–™
}

// å»ºç«‹æ¨¡åž‹
var DHT11 = mongoose.model('dht11', dht11Schema);

DHT11.find(function (err, docs) {
  if ( err || !docs) {
    console.log("æ‰¾ä¸åˆ°dht11çš„è³‡æ–™ï¼");
  } else {
    docs.forEach(function(d) {
      var data = new DHT11(d);  // ç”¢ç”Ÿè³‡æ–™ç‰©ä»¶
      data.show();
    });
  }
});

/*
DHT11.find()
     .select('-_id -Time')
     .and([{'Temperature' : { $gte: 24 }}, {'Moisture': {$gte:60}}])
     .exec(function(err, docs) {
        if ( err || !docs) {
ã€€ã€€        console.log("æ‰¾ä¸åˆ°dht11çš„è³‡æ–™ï¼");
        } else {
            console.log(docs);
        }
     });
*/
