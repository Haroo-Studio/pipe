var HarooCode = require('../lib/code');
var CommonUtil = require('../lib/common');
var AccountLog = require('../lib/accountLog');

var AccountToken = require('../model/accountToken');


exports.findByToken = function (params, callback) {
    AccountToken.findOne({access_token: params['accessToken'], access_host: params['accessHost']}, function (err, existToken) {
        if (err) {
            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.token.database, params['result']);
            callback(params['result']);

            return;
        }
        if (existToken) {
            if (CommonUtil.isThisTokenExpired(existToken)) {
                params['result'] = HarooCode.token.expired;
                callback(params['result']);
            } else {
                // done right
                params['result'] = HarooCode.token.validate;
                params['result'].haroo_id = existToken.haroo_id;
                params['result'].access_host = existToken.access_host;
                params['result'].access_token = existToken.access_token;
                params['result'].login_expire = existToken.login_expire;
                callback(params['result']);

                AccountLog.checkToken({token: params['accessToken']});
            }
        } else {
            params['result'] = HarooCode.token.no_exist;
            callback(params['result']);
        }
    });
};

exports.findByTokenWithKeep = function (params, callback) {
    AccountToken.findOne({access_token: params['accessToken'], access_host: params['accessHost']}, function (err, existToken) {
        if (err) {
            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.token.database, params['result']);
            callback(params['result']);

            return;
        }
        if (existToken) {
            if (CommonUtil.isThisTokenExpired(existToken)) {
                params['result'] = HarooCode.token.expired;
                callback(params['result']);
            } else {
                existToken.login_expire = CommonUtil.getLoginExpireDate();
                existToken.save();
                // done right
                params['result'] = HarooCode.token.extended;
                params['result'].haroo_id = existToken.haroo_id;
                params['result'].access_host = existToken.access_host;
                params['result'].access_token = existToken.access_token;
                params['result'].login_expire = existToken.login_expire;
                callback(params['result']);

                AccountLog.checkToken({token: params['accessToken']});
            }
        } else {
            params['result'] = HarooCode.token.no_exist;
            callback(params['result']);
        }
    });
};

exports.findByTokenWithExpire = function (params, callback) {
    AccountToken.findOne({access_token: params['accessToken'], access_host: params['accessHost']}, function (err, existToken) {
        if (err) {
            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.token.database, params['result']);
            callback(params['result']);

            return;
        }
        if (existToken) {
            if (CommonUtil.isThisTokenExpired(existToken)) {
                params['result'] = HarooCode.token.expired;
                callback(params['result']);
            } else {
                existToken.remove(function (err, token) {
                    if (err) {
                        params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.token.database, params['result']);
                        callback(params['result']);

                        return;
                    }
                    // done right
                    params['result'] = HarooCode.token.removed;
                    params['result'].access_token = token.access_token;
                    callback(params['result']);

                    AccountLog.checkToken({token: params['accessToken']});
                });
            }
        } else {
            params['result'] = HarooCode.token.no_exist;
            callback(params['result']);
        }
    });
};
