var CommonUtil = require('../lib/common');

var AccountLog = require('../model/accountLog');

exports.externalLink = function (provider, params) {
    CommonUtil.saveAccountLinkLog(provider, params['email']);
};

exports.externalUnlink = function (params) {
    CommonUtil.saveAccountAccessLog('unlinked_at', params['email']);
};

exports.login = function (params) {
    CommonUtil.saveAccountAccessLog('signed_in', params['email']);
};

exports.logout = function (params) {
    AccountLog.findOneAndUpdate({email: params['email']}, {signed_out: new Date()}, {sort: {_id: -1}},
        function (err, lastLog) {
            if (!lastLog) {
                CommonUtil.saveAccountAccessLog('signed_out', params['email']);
            }
        });
};

exports.signUp = function (params) {
    CommonUtil.saveAccountAccessLog('signed_up', params['email']);
};

exports.signIn = function (params) {
    CommonUtil.saveAccountAccessLog('signed_in', params['email']);
};

exports.signOut = function (params) {
    AccountLog.findOneAndUpdate({email: params['email']}, {signed_out: Date.now()}, {sort: {_id: -1}},
        function (err, lastLog) {
            if (!lastLog) {
                CommonUtil.saveAccountAccessLog('signed_out', params['email']);
            }
        });
};

exports.update = function (params) {
    CommonUtil.saveAccountAccessLog('updated_at', params['email']);
};

exports.remove = function (params) {
    CommonUtil.saveAccountAccessLog('removed_at', params['email']);
};

exports.changePassword = function (params) {
    CommonUtil.saveAccountAccessLog('change_password', params['email']);
};

exports.resetPasswordMail = function (params) {
    CommonUtil.saveAccountAccessLog('reset_password', params['email']);
};