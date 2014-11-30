function CouchConnect(database, callback) {
    var nano = require('nano')('http://' + database.couch.host);

    callback(nano);
}

module.exports = CouchConnect;