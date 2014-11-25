var passport = require('passport');

var HarooCode = require('../lib/code');
var CommonUtil = require('../lib/common');

var Account = require('../model/account');
var AccountToken = require('../model/accountToken');

function getValidateToken(params, callback) {
    AccountToken.findOne({access_token: params['accessToken'], access_host: params['accessHost'], haroo_id: params['haroo_id']}, function (err, existToken) {
        if (err) {
            callback(false, null);

            return;
        }
        if (existToken) {
            if (CommonUtil.isThisTokenExpired(existToken)) {
                callback(false, existToken);
            } else {
                // done right
                callback(true, existToken);
            }
        } else {
            callback(false, null);
        }
    });
}

exports.createByEmail = function (params, callback) {
    Account.findOne({ email: params['email'] }, function(err, existUser) {
        if (err) {
            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.account.create.database, params['result']);
            callback(params['result']);

            return;
        }
        if (existUser) {
            params['result'] = HarooCode.account.create.duplication;

            callback(params['result']);
        } else {
            // make new account
            var user = new Account({
                email: params['email'],
                password: params['password'],
                haroo_id: CommonUtil.initHarooID(params['email'], params['database']),
                db_host: params['database'].couch.host,
                created_at: Date.now(),
                profile: {
                    nickname: params['nickname']
                }
            });

            CommonUtil.initAccount(user.haroo_id, params.database);

            user.save(function(err) {
                if (err) {
                    params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.account.create.database, params['result'])
                    callback(params['result']);

                    return;
                }

                // make new account token
                var token = new AccountToken({
                    access_ip: params['accessIP'],
                    access_host: params['accessHost'],
                    access_token: CommonUtil.getAccessToken(),
                    haroo_id: user.haroo_id,
                    login_expire: CommonUtil.getLoginExpireDate(),
                    created_at: Date.now()
                });

                token.save(function (err) {
                    if (err) {
                        params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.token.database, params['result']);
                        callback(params['result']);

                        return;
                    }

                    CommonUtil.saveSignUpLog(params['email']);

                    // done right
                    params['result'] = CommonUtil.setAccountToClient(HarooCode.account.create.done, user, token);
                    callback(params['result']);
                });
            });
        }
    });
};

exports.loginByPassport = function (params, callback) {
    var req = params['req'];
    var res = params['res'];

    passport.authenticate('local', function(err, loginUser, info) {
        if (err) {
            params['result'] = CommonUtil.setPassportErrorToClient(err, HarooCode.account.login.database, params['result']);
            callback(params['result']);

            return;
        }
        if (loginUser && loginUser._id) {
            Account.findById(loginUser._id, function (err, updateUser) {
                // remove previous token for access IP and Host
                AccountToken.remove({haroo_id: updateUser.haroo_id, access_ip: params['accessIP'], access_host: params['accessHost']}, function (err) {
                    if (err) {
                        params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.token.database, params['result']);
                        callback(params['result']);

                        return;
                    }

                    // make new account token
                    var token = new AccountToken({
                        access_ip: params['accessIP'],
                        access_host: params['accessHost'],
                        access_token: CommonUtil.getAccessToken(),
                        haroo_id: updateUser.haroo_id,
                        login_expire: CommonUtil.getLoginExpireDate(),
                        created_at: Date.now()
                    });
                    token.save(function (err) {
                        if (err) {
                            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.token.database, params['result']);
                            callback(params['result']);

                            return;
                        }

                        CommonUtil.saveSignInLog(params['email']);

                        // done right
                        params['result'] = CommonUtil.setAccountToClient(HarooCode.account.login.done, updateUser, token);
                        callback(params['result']);
                    });
                });
            });
        } else {
            params['result'] = HarooCode.account.login.no_exist;
            callback(params['result']);
        }
    })(req, res);
};

exports.passwordResetByEmail = function (params, callback) {
    Account.findOne({email: params['email']}, function (err, existAccount) {
        if (err) {
            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.account.password.database, params['result']);
            callback(params['result']);
            return;
        }
        if (existAccount && existAccount.email) {
            var randomToken = CommonUtil.getRandomToken();
            existAccount.reset_password_token = randomToken;
            existAccount.reset_password_token_expire = CommonUtil.getPasswordResetExpire();
            existAccount.save();
            var host = params['protocol'] + '://' + params['hostname'];
            CommonUtil.sendPasswordResetMail(existAccount.email, {link: host + '/account/update-password/' + randomToken}, params['email_token']);

            params['result'] = HarooCode.account.password.send_mail;

            callback(params['result']);
        } else {
            params['result'] = HarooCode.account.password.no_exist;

            callback(params['result']);
        }
    });
};

exports.findByHarooID = function (params, callback) {
    getValidateToken(params, function (result, token) {
        if (result) {
            Account.findOne({haroo_id: params['haroo_id']}, function (err, existUser) {
                if (err) {
                    params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.account.haroo_id.database, params['result']);
                    callback(params['result']);

                    return;
                }

                if (existUser) {
                    CommonUtil.saveAccountAccessLog('signed_in', params['email']);

                    // done right
                    params['result'] = CommonUtil.setAccountToClient(HarooCode.account.haroo_id.success, existUser, token);
                    callback(params['result']);
                } else {
                    params['result'] = HarooCode.account.haroo_id.invalid;
                    callback(params['result']);
                }
            });
        } else {
            params['result'] = HarooCode.token.no_exist;
            callback(params['result']);
        }
    });
};

exports.updatePasswordByEmail = function (params, callback) {
    getValidateToken(params, function (result, token) {
        if (result) {
            Account.findOne({haroo_id: params['haroo_id'], email: params['email']}, function (err, updateUser) {
                if (err) {
                    params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.account.haroo_id.database, params['result']);
                    callback(params['result']);

                    return;
                }

                if (updateUser) {
                    updateUser.password = params['password'];

                    updateUser.save(function (err) {
                        if (err) {
                            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.account.update.database, params['result']);
                            callback(params['result']);

                            return;
                        }
                        CommonUtil.saveAccountAccessLog('change_password', params['email']);

                        // done right
                        params['result'] = CommonUtil.setAccountToClient(HarooCode.account.update.done, updateUser, token);
                        callback(params['result']);
                    });
                } else {
                    params['result'] = HarooCode.account.haroo_id.invalid;
                    callback(params['result']);
                }
            });
        } else {
            params['result'] = HarooCode.token.no_exist;
            callback(params['result']);
        }
    });
};

exports.updateInfoByEmail = function (params, callback) {
    getValidateToken(params, function (result, token) {
        if (result) {
            Account.findOne({ email: params['email'] }, function(err, updateUser) {
                if (err) {
                    params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.account.haroo_id.database, params['result']);
                    callback(params['result']);

                    return;
                }

                if (updateUser) {
                    updateUser.profile.nickname = params['nickname'];
                    updateUser.updated_at = Date.now();

                    updateUser.save(function (err, affectedUser) {
                        if (err) {
                            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.account.update.database, params['result']);
                            callback(params['result']);

                            return;
                        }

                        CommonUtil.saveAccountUpdateLog(params['email']);

                        // done right
                        params['result'] = CommonUtil.setAccountToClient(HarooCode.account.create.done, affectedUser, token);
                        callback(params['result']);
                    });
                } else {
                    params['result'] = HarooCode.account.update.no_exist;
                    callback(params['result']);
                }
            });
        } else {
            params['result'] = HarooCode.token.no_exist;
            callback(params['result']);
        }
    });
};

exports.logoutByEmail = function (params, callback) {
    Account.findOne({haroo_id: params['haroo_id'], email: params['email']}, function (err, logoutUser) {
        if (err) {
            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.account.dismiss.database, params['result']);
            callback(params['result']);

            return;
        }

        if (logoutUser) {
            // remove previous token for access IP and Host
            AccountToken.remove({haroo_id: logoutUser.haroo_id, access_ip: params['accessIP'], access_host: params['accessHost']}, function (err) {
                if (err) {
                    params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.token.database, params['result']);
                    callback(params['result']);

                    return;
                }

                CommonUtil.saveSignOutLog(params['email']);

                // done right
                params['result'] = HarooCode.account.dismiss.done;
                callback(params['result']);
            });
        } else {
            params['result'] = HarooCode.account.haroo_id.invalid;
            callback(params['result']);
        }
    });
};

exports.deleteByPassport = function (params, callback) {
    var req = params['req'];
    var res = params['res'];

    passport.authenticate('local', function(err, validUser, info) {
        if (err) {
            params['result'] = CommonUtil.setPassportErrorToClient(err, HarooCode.account.remove.database, params['result']);
            callback(params['result']);

            return;
        }

        if (validUser) {
            // remove all token for this account
            AccountToken.remove({haroo_id: validUser.haroo_id}, function (err) {
                if (err) {
                    params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.token.database, params['result']);
                    callback(params['result']);

                    return;
                }

                // done right
                Account.remove({_id: validUser._id}, function (err, countAffected) {

                    console.log('remove account :', countAffected, validUser);

                    if (err) {
                        params['result'] = HarooCode.account.remove.database;
                        callback(params['result']);
                    } else {
                        CommonUtil.saveAccountRemoveLog(params['email']);
                        params['result'] = HarooCode.account.remove.done;
                        callback(params['result']);
                    }
                });
            });
        } else {
            params['result'] = HarooCode.account.haroo_id.invalid;
            callback(params['result']);
        }
    })(req, res);
};