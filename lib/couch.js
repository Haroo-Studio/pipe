function CouchConnect(database) {
    return require('nano')('http://' + database.couch.host);
}

module.exports = CouchConnect;