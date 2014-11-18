var passport = require('passport');

var HarooCode = require('../lib/code');
var CommonUtil = require('../lib/common');

var Account = require('../model/account');

var emailToken = require('../config/mailer')['email-token'];

exports.createByEmail = function (params, callback) {
    var user = new Account({
        email: params['email'],
        password: params['password'],
        created_at: Date.now(),
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

exports.passwordResetByEmail = function (params, callback) {
    Account.findOne({ email: params['email'] }, function (err, existAccount) {
        if (err) {
            params['result'] = HarooCode.account.password.database;
            params['result'].passport = err;
            callback(params['result']);

            return;
        }

        if (existAccount && existAccount.email) {
            var randomToken = CommonUtil.getRandomToken();

            existAccount.reset_password_token = randomToken;
            existAccount.reset_password_token_expire = CommonUtil.getPasswordResetExpire();
            existAccount.save();
            var host = params['protocol'] + '://' + params['hostname'];

            CommonUtil.sendPasswordResetMail(existAccount.email, {link: host + '/account/update-password/' + randomToken}, emailToken);

            params['result'] = HarooCode.account.password.send_mail;

            callback(params['result']);
        } else {
            params['result'] = HarooCode.account.password.no_exist;

            callback(params['result']);
        }
    });
};

exports.findByToken = function (params, callback) {
    Account.findOne({access_token: params['accessToken']}, function (err, existUser) {
        if (err) {
            params['result'] = HarooCode.account.token.no_exist;
            params['result'].passport = err;
            callback(params['result']);

            return;
        }

        if (existUser) {
            var now = Date.now();

            if (existUser.login_expire > now) {
                CommonUtil.saveAccountAccessLog('check_token', existUser.email);

                params['result'] = CommonUtil.setAccountToClient(HarooCode.account.token.allowed, existUser);

                callback(params['result']);
            } else {
                params['result'] = HarooCode.account.token.denied;

                callback(params['result']);
            }
        } else {
            params['result'] = HarooCode.account.token.no_exist;

            callback(params['result']);
        }
    });
};

exports.findByHarooID = function (params, callback) {
    Account.findOne({haroo_id: params['haroo_id']}, function (err, existUser) {
        if (err) {
            params['result'] = HarooCode.account.haroo_id.database;
            params['result'].passport = err;
            callback(params['result']);

            return;
        }

        if (existUser && (existUser.access_token == params['accessToken'])) {
            var now = Date.now();

            if (existUser.login_expire > now) {
                CommonUtil.saveAccountAccessLog('signed_in', params['email']);

                params['result'] = CommonUtil.setAccountToClient(HarooCode.account.haroo_id.success, existUser);

                callback(params['result']);
            } else {
                params['result'] = HarooCode.account.haroo_id.expired;

                callback(params['result']);
            }
        } else {
            params['result'] = HarooCode.account.haroo_id.invalid;

            callback(params['result']);
        }
    });
};

exports.updatePasswordByEmail = function (params, callback) {
    Account.findOne({haroo_id: params['haroo_id'], email: params['email']}, function (err, updateUser) {
        if (err) {
            params['result'] = HarooCode.account.haroo_id.database;
            params['result'].db_info = err;
            callback(params['result']);

            return;
        }

        if (updateUser && (updateUser.access_token == params['accessToken'])) {
            var now = Date.now();

            if (updateUser.login_expire > now) {
                updateUser.password = params['password'];
                updateUser.access_token = CommonUtil.getAccessToken();
                updateUser.login_expire = CommonUtil.getLoginExpireDate();

                updateUser.save(function (err) {
                    if (err) {
                        params['result'] = HarooCode.account.update.database;
                        params['result'].db_info = err;

                        callback(params['result']);

                        return;
                    }

                    // good
                    CommonUtil.saveAccountAccessLog('change_password', params['email']);

                    params['result'] = CommonUtil.setAccountToClient(HarooCode.account.update.done, updateUser);

                    callback(params['result']);
                });
            } else {
                params['result'] = HarooCode.account.haroo_id.expired;

                callback(params['result']);
            }
        } else {
            params['result'] = HarooCode.account.haroo_id.invalid;

            callback(params['result']);
        }
    });
};

exports.updateInfoByEmail = function (params, callback) {
    Account.findOne({ email: params['email'] }, function(err, existUserForUpdate) {
        if (err) {
            params['result'] = HarooCode.account.haroo_id.database;
            params['result'].passport = err;
            callback(params['result']);

            return;
        }

        if (existUserForUpdate && (existUserForUpdate.access_token == params['accessToken'])) {
            var now = Date.now();

            if (existUserForUpdate.login_expire > now) {
                existUserForUpdate.profile.nickname = params['nickname'];
                existUserForUpdate.updated_at = now;
                existUserForUpdate.access_token = CommonUtil.getAccessToken();
                existUserForUpdate.login_expire = CommonUtil.getLoginExpireDate();

                existUserForUpdate.save(function (err, affectedUser) {
                    if (err) {
                        params['result'] = HarooCode.account.update.database;
                        params['result'].db_info = err;
                        callback(params['result']);

                        return;
                    }

                    // good
                    CommonUtil.saveAccountUpdateLog(params['email']);

                    params['result'] = CommonUtil.setAccountToClient(HarooCode.account.create.done, affectedUser);

                    callback(params['result']);
                });
            } else {
                params['result'] = HarooCode.account.haroo_id.expired;

                callback(params['result']);
            }
        } else {
            params['result'] = HarooCode.account.update.no_exist;

            callback(params['result']);
        }
    });
};

exports.logoutByEmail = function (params, callback) {
    Account.findOne({haroo_id: params['haroo_id'], email: params['email']}, function (err, logoutUser) {
        if (err) {
            params['result'] = HarooCode.account.dismiss.database;
            params['result'].db_info = err;
            callback(params['result']);

            return;
        }

        if (logoutUser && logoutUser.access_token == params['accessToken']) {
            params['result'] = HarooCode.account.dismiss.done;

            var now = Date.now();

            if (logoutUser.login_expire > now) {
                logoutUser.access_token = undefined;
                logoutUser.login_expire = undefined;

                logoutUser.save(function (err) {
                    if (err) {
                        params['result'] = HarooCode.account.dismiss.database;
                        params['result'].db_info = err;
                        callback(params['result']);

                        return;
                    }

                    // good
                    CommonUtil.saveSignOutLog(params['email']);

                    params['result'] = HarooCode.account.dismiss.done;

                    callback(params['result']);
                });
            } else {
                params['result'] = HarooCode.account.haroo_id.expired;

                callback(params['result']);
            }
        } else {
            params['result'] = HarooCode.account.haroo_id.invalid;

            callback(params['result']);
        }
    });
};