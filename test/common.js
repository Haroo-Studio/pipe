var CommonUtil = require('../lib/common');

exports.getToday = function (t) {
    t.expect(1);
    t.equal(CommonUtil.getToday(), new Date().toISOString().slice(0, 10));
    t.done();
};

exports.setAccountToClient = function (t) {
    t.expect(1);

    var userData = {
        "login_expire" : "1417550749401",
        "access_token" : "6c062089-ad66-4110-9f8f-187f67b57c01",
        "haroo_id" : "b4c4ae0692b435427b671649ea30848e7",
        "email" : "soomtong@gmail.com",
        "profile" : {
            "nickname" : "soomtong"
        },
        "db_host": "db1.haroopress.com"
    };
    var tokenData = {
        "access_ip" : "127.0.0.1",
        "access_host" : "sven-mac-pro1",
        "access_token" : "6d3ca5ff-6398-47d3-be49-49e18d8124e7",
        "haroo_id" : "b4c4ae0692b435427b671649ea30848e7",
        "login_expire" : "1417881428672"
    };
    var code = {
        code: 0,
        msg: {
            en: "message english"
        }
    };
    var result = {
        code: 0,
        msg: {
            en: "message english"
        },
        "email" : "soomtong@gmail.com",
        "haroo_id" : "b4c4ae0692b435427b671649ea30848e7",
        "profile" : {
            "nickname" : "soomtong"
        },
        "db_host": "db1.haroopress.com",
        "access_host": "sven-mac-pro1",
        "access_token": "6d3ca5ff-6398-47d3-be49-49e18d8124e7",
        "login_expire": "1417881428672"
    };
    t.deepEqual(CommonUtil.setAccountToClient(code, userData, tokenData), result);
    t.done();
};

exports.isThisTokenExpired = function (t) {
    t.expect(2);

    var HOUR = 3600000;
    var DAY = HOUR * 24;

    var validTokenData = {
        "login_expire" : Date.now() + DAY
    };
    var invalidTokenData = {
        "login_expire" : Date.now() - HOUR
    };

    t.ok(!CommonUtil.isThisTokenExpired(validTokenData));
    t.ok(CommonUtil.isThisTokenExpired(invalidTokenData));
    t.done();
};

exports.makeHarooID = function (t) {
    var database = {
        "mongo": {
            "host": "mongodb://localhost:27017/test",
            "id": "hello",
            "pass": "world"
        },
        "couch": {
            "host": "db1.haroopress.com",
            "port": "80",
            "id": "a",
            "pass": "1"
        }
    };
    t.expect(1);
    var email = 'soomtong@gmail.com';
    var validHarooID = CommonUtil.initHarooID(email, database);

    t.equal(validHarooID, CommonUtil.initHarooID(email, database));
    t.done();
};

exports.makeZeroFill = function (t) {
    t.expect(6);
    t.equal(CommonUtil.makeZeroFill(), '001');
    t.equal(CommonUtil.makeZeroFill(4), '004');
    t.equal(CommonUtil.makeZeroFill(14), '014');
    t.equal(CommonUtil.makeZeroFill(414), '414');
    t.equal(CommonUtil.makeZeroFill(8414), '8414');
    t.equal(CommonUtil.makeZeroFill(6, 4), '0006');
    t.done();
};