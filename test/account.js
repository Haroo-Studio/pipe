var mongoose = require('mongoose');
var database = require('./config');

var Account = require('../lib/account');

var params = {
    email: "test@email.com",
    nickname: "new tester",
    password: "password",
    accessHost: "test.local",
    accessIP: "100.9.9.9",
    haroo_id: '',
    database: database,
    result: {}
};

exports.setUp = function (callback) {
    mongoose.connect(database['mongo'].host);
    mongoose.connection.on('error', function () {
        console.error('MongoDB Connection Error. Make sure MongoDB is running.');
    });

    var AccountModel = require('../model/account');

    AccountModel.remove({email: params.email}, function (err, affected) {
        //console.log(err ? err: "", "remove documents before tests:" ,affected);

        callback();
    });
};

exports.createByEmail = function (t) {
    t.expect(2);

    Account.createByEmail(params, function (result) {
        t.equal(result.email, params.email);
        t.equal(result.db_host, params.database.couch.host);
        t.done();
    });
};


exports.findByHarooID = function (t) {
    t.expect(2);

    Account.createByEmail(params, function (result) {
        params['accessToken'] = result.access_token;
        params['haroo_id'] = result.haroo_id;

        Account.findByHarooID(params, function (result2) {
            t.equal(result.access_token, result2.access_token);
            t.equal(result.haroo_id, result2.haroo_id);
            t.done();
        });
    });
};

exports.tearDown = function (callback) {
    var AccountModel = require('../model/account');

    AccountModel.remove({email: params.email}, function (err, affected) {
        mongoose.disconnect();
        //console.log(err ? err: "", "remove documents after tests:" ,affected);

        callback();
    });
};