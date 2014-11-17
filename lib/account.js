var HarooCode = require('../lib/code');
var CommonUtil = require('../lib/common');

var Account = require('../model/account');

exports.createByEmail = function (params, callback) {
    var user = new Account({
        email: params.email,
        password: params.password,
        created_at: new Date(),
        profile: {
            nickname: params.nickname
        }
    });

    Account.findOne({ email: params.email }, function(err, existUser) {
        if (err) {
            params.result = HarooCode.account.create.database;
            params.result.passport = err;
            callback(params.result);

            return;
        }
        if (existUser) {
            params.result = HarooCode.account.create.duplication;

            callback(params.result);
        } else {
            user.haroo_id = CommonUtil.initHarooID(params.email);
            user.access_token = CommonUtil.getAccessToken();
            user.login_expire = CommonUtil.getLoginExpireDate();

            CommonUtil.initAccount(user.haroo_id, params.database);

            user.save(function(err) {
                if (err) {
                    params.result = HarooCode.account.create.database;
                    params.result.db_info = err;
                    callback(params.result);

                    return;
                }

                CommonUtil.saveSignUpLog(params.email);

                params.result = CommonUtil.setAccountToClient(HarooCode.account.create.done, user);

                callback(params.result);
            });
        }
    });
};