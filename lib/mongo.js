function MongoInit(database) {
    var mongoose = require('mongoose');

    mongoose.connect(database['mongo'].host);
    mongoose.connection.on('error', function () {
        console.error('MongoDB Connection Error. Make sure MongoDB is running.');
    });
}

module.exports = MongoInit;