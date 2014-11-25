var CommonUtil = require('../lib/common');

var AccountLog = require('../model/accountLog');

exports.logout = function (params) {
    AccountLog.findOneAndUpdate({email: params['email']}, {signed_out: new Date()}, {sort: {_id: -1}},
        function (err, lastLog) {
            if (!lastLog) {
                CommonUtil.saveAccountAccessLog('signed_out', params['email']);
            }
        });
};

exports.login = function (params) {
    CommonUtil.saveAccountAccessLog('signed_in', params['email']);
};