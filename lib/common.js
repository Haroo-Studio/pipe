var MD5 = require('MD5');
var cuid = require('cuid');
var uuid = require('node-uuid');
var nodemailer = require('nodemailer');
var emailTemplates = require('swig-email-templates');

var InitAccount = require('init-user');

var AccountLog = require('../model/accountLog');

var HOUR = 3600000;
var DAY = HOUR * 24;

function initAccount (haroo_id, database) {
    var InitUserDB = new InitAccount.initUserDB(database.couch.host, database.couch.port, database.couch.id, database.couch.pass);

    InitUserDB.createNewAccount(haroo_id, function (err, res) {
        if (err) {
            throw new Error('fail make new account with couch database');
        }
    });
}

function initHarooID(email, database) {
    var nameToken = database['couch']['host'] || "database1";

    return InitAccount.initHarooID(email, nameToken);
}

function saveAccountAccessLog(type, userEmail) {
    var log = new AccountLog();

    log.email = userEmail;
    log[type] = Date.now();

    log.save();
}

function saveTokenAccessLog(type, accessToken) {
    var log = new AccountLog();

    log.token = accessToken;
    log[type] = Date.now();

    log.save();
}

function saveHarooIDAccessLog(type, harooID) {
    var log = new AccountLog();

    log.haroo_id = harooID;
    log[type] = Date.now();

    log.save();
}

function saveAccountLinkLog(provider, userEmail) {
    var log = new AccountLog({
        provider: provider,
        email: userEmail,
        linked_at: Date.now()
    });

    log.save();
}

function getToday() {
    return new Date().toISOString().slice(0, 10);
}

function getAccessToken() {
    return uuid.v4();
}

function getGravatarUrl(param) {
    var option = {
        size: param.size && param.size,
        default: param.default && param.default
    };

    var postfix = (option.size || option.default) ? '?' : '';

    return "http://www.gravatar.com/avatar/" + MD5(param.email)
        + postfix + (option.size ? 's=' + option.size + '&' : '')
        + (option.default ? 'd=' + option.default + '' : '');
}

function getRandomToken() {
    return uuid.v1();
}

function getDefaultPublicUserID() {
    // reason why cuid is simple & fast, timebase, machinebase, no need uuid type.
    return cuid();
}

function getExpireDate() {
    return Date.now() + ( 15 * DAY );
}

function getPasswordResetExpire() {
    return Date.now() + Number(DAY);
}

function setAccountToClient(codeStub, userData, tokenData) {
    var result = codeStub;

    result.email = userData.email;
    result.haroo_id = userData.haroo_id;
    result.profile = userData.profile;
    result.db_host = userData.db_host || 'default_database.haroopress.com';

    if (tokenData) {
        if (tokenData.access_host) result.access_host = tokenData.access_host;
        if (tokenData.access_token) result.access_token = tokenData.access_token;
        if (tokenData.login_expire) result.login_expire = tokenData.login_expire;
    }

    if (userData) {
        if (userData.provider) result.provider = userData.provider;
        if (userData.tokens) result.tokens = userData.tokens;
    }

    return result;
}

function setDBErrorToClient(err, code, result) {
    result = code;
    result.db_info = err;

    return result;
}

function setPassportErrorToClient(err, code, result) {
    result = code;
    result.passport = err;

    return result;
}

function isThisTokenExpired(tokenData) {
    var now = Date.now();

    return tokenData.login_expire < now;
}

function sendPasswordResetMail(address, context, emailToken) {
    var smtpTransport = nodemailer.createTransport(emailToken);

    emailTemplates({ root: __dirname + "/templates" }, function (error, render) {
        var email = {
            from: emailToken['reply'], // sender address
            to: address,
//            bcc: emailToken.bcc,
            subject: "Reset your password link described"
        };

        render('password_reset_email.html', context, function (error, html) {
            console.log(html);
            email.html = html;
            smtpTransport.sendMail(email, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Message sent: " + info.response);
                }

                // if you don't want to use this transport object anymore, uncomment following line
                smtpTransport.close(); // shut down the connection pool, no more messages
            });
        });
    });
}

function makeZeroFill(num, numZeros) {
    // ref. http://stackoverflow.com/questions/1267283/how-can-i-create-a-zerofilled-value-using-javascript
    if (!num) num = 1;
    if (!numZeros) numZeros = 3;
    var n = Math.abs(num);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
    var zeroString = Math.pow(10, zeros).toString().substr(1);
    if (num < 0) {
        zeroString = '-' + zeroString;
    }

    return zeroString + n;
}

module.exports = {
    initAccount: initAccount,
    initHarooID: initHarooID,
    getToday: getToday,
    makeZeroFill: makeZeroFill,
    getAccessToken: getAccessToken,
    getGravatar: getGravatarUrl,
    isThisTokenExpired: isThisTokenExpired,
    getRandomToken: getRandomToken,
    defaultUserID: getDefaultPublicUserID,
    getLoginExpireDate: getExpireDate,
    saveTokenAccessLog: saveTokenAccessLog,
    saveHarooIDAccessLog: saveHarooIDAccessLog,
    saveAccountAccessLog: saveAccountAccessLog,
    saveAccountLinkLog: saveAccountLinkLog,
    setPassportErrorToClient: setPassportErrorToClient,
    setDBErrorToClient: setDBErrorToClient,
    setAccountToClient: setAccountToClient,
    sendPasswordResetMail: sendPasswordResetMail,
    getPasswordResetExpire: getPasswordResetExpire
};