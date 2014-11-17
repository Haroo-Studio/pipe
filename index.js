var database = require('./config/database');
var mongoose = require('mongoose');

mongoose.connect(database['mongo'].host);
mongoose.connection.on('error', function () {
    console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});

module.exports = {
    HarooCode: require('./lib/code'),
    CommonUtil: require('./lib/common'),
    Account: require('./lib/account')
};