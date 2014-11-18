var CommonUtil = require('../lib/common');

exports.getToday = function (test) {
    test.expect(1);
    test.equal(CommonUtil.getToday(), new Date().toISOString().slice(0, 10));
    test.done();
};

exports.setAccountToClient = function (test) {
    test.expect(1);
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
        "access_token" : "6c062089-ad66-4110-9f8f-187f67b57c01",
        "login_expire" : "1417550749401",
        "profile" : {
            "nickname" : "soomtong"
        },
        "db_host": "db1.haroopress.com"
    };
    test.deepEqual(CommonUtil.setAccountToClient(code, userData), result);
    test.done();
};