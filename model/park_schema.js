var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pid_test');
var parkSchema = new mongoose.Schema({
    '_id': ObjectID();
    'carID': String,
    'function_required': Number,
    'parkingspace': Number
});
var PARK_SCHEMA = mongoose.model('park', parkSchema);
module.exports = DHT11;