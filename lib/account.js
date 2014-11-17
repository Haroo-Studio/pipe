var passport = require('passport');

var HarooCode = require('../lib/code');
var CommonUtil = require('../lib/common');

var Account = require('../model/account');

exports.createByEmail = function (params, callback) {
    var user = new Account({
        email: params['email'],
        password: params['password'],
        created_at: new Date(),
        profile: {
            nickname: params['nickname']
        }
    });

    Account.findOne({ email: params['email'] }, function(err, existUser) {
        if (err) {
            params['result']= HarooCode.account.create.database;
            params['result'].passport = err;
            callback(params['result']);

            return;
        }
        if (existUser) {
            params['result']= HarooCode.account.create.duplication;

            callback(params['result']);
        } else {
            user.haroo_id = CommonUtil.initHarooID(params['email']);
            user.access_token = CommonUtil.getAccessToken();
            user.login_expire = CommonUtil.getLoginExpireDate();

            CommonUtil.initAccount(user.haroo_id, params.database);

            user.save(function(err) {
                if (err) {
                    params['result']= HarooCode.account.create.database;
                    params['result'].db_info = err;
                    callback(params['result']);

                    return;
                }

                CommonUtil.saveSignUpLog(params['email']);

                params['result']= CommonUtil.setAccountToClient(HarooCode.account.create.done, user);

                callback(params['result']);
            });
        }
    });
};

exports.loginByPassport = function (params, callback) {
    var req = params['req'];
    var res = params['res'];

    passport.authenticate('local', function(err, loginUser, info) {
        if (err) {
            params['result']= HarooCode.account.login.database;
            params['result'].passport = err;
            callback(params['result']);

            return;
        }
        if (loginUser && loginUser._id) {
            Account.findById(loginUser._id, function (err, updateUser) {
                updateUser.access_token = CommonUtil.getAccessToken();
                updateUser.login_expire = CommonUtil.getLoginExpireDate();

                updateUser.save(function (err) {
                    if (err) {
                        params['result']= HarooCode.account.login.database;
                        params['result'].db_info = err;

                        callback(params['result']);

                        return;
                    }
                    CommonUtil.saveSignInLog(params['email']);

                    params['result']= CommonUtil.setAccountToClient(HarooCode.account.login.done, updateUser);

                    callback(params['result']);
                });
            });
        } else {
            params['result']= HarooCode.account.login.no_exist;

            callback(params['result']);
        }
    })(req, res);
};