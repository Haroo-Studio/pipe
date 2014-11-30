var HarooCode = require('../lib/code');
var CommonUtil = require('../lib/common');

var publicDoc = require('../model/publicDocument');

function makeZeroFill(num, numZeros) {
    // ref. http://stackoverflow.com/questions/1267283/how-can-i-create-a-zerofilled-value-using-javascript
    var n = Math.abs(num);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
    var zeroString = Math.pow(10, zeros).toString().substr(1);
    if (num < 0) {
        zeroString = '-' + zeroString;
    }

    return zeroString + n;
}

exports.togglePublic = function (couch, params, callback) {
    // generate last count and today
    var today = CommonUtil.getToday();
    var counter = 1;
    var padChar = 3;
    var shareUrl = '';

    publicDoc.find({ release_date: today }, null, { limit: 1, sort: { counter: -1 }}, function (err, todayDocs) {
        if (err) {
            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.document.public.database, params['result']);
            return callback(params['result']);
        }

        if (!todayDocs.length) {
            shareUrl = today + '/' + makeZeroFill(counter, padChar);
        }

        publicDoc.findOne({haroo_id: params['haroo_id'], document_id: params['document_id']}, function (err, existDoc) {
            if (!existDoc) {
                counter = todayDocs.length ? Number(todayDocs[0].counter) + 1 : counter;

                shareUrl = today + '/' + makeZeroFill(counter, padChar);

                var shareDoc = new publicDoc({
                    release_date: today,
                    counter: counter,
                    public: true,
                    haroo_id: params['haroo_id'],
                    document_id: params['document_id']
                });

                shareDoc.save(function (err) {
                    if (err) {
                        params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.document.public.database, params['result']);
                        return callback(params['result']);
                    }
                });

                couch.get(params['document_id'], function (err, doc) {
                    if (err) {
                        params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.document.public.database, params['result']);
                        return callback(params['result']);
                    } else {
                        var meta = doc.meta || {};
                        // set public url
                        meta.share = shareUrl;
                        doc.meta = meta;

                        couch.insert(doc, params['document_id'], function (err, body) {
                            params['result'] = HarooCode.document.public.done;
                            params['result'].shareUrl = meta.share;
                            params['result'].public = true;

                            callback(params['result']);
                        });
                    }
                });

            } else {
                var isPublic = existDoc.public;
                existDoc.public = isPublic ? false: true;
                existDoc.save();

                counter = Number(existDoc.counter);
                shareUrl = today + '/' + makeZeroFill(counter, padChar);

                couch.get(params['document_id'], function (err, doc) {
                    if (err) {
                        params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.document.public.database, params['result']);
                        return callback(params['result']);
                    } else {
                        var meta = doc.meta || {};
                        // toggle public url
                        meta.share = isPublic ? undefined : shareUrl;
                        doc.meta = meta;

                        couch.insert(doc, params['document_id'], function (err, body) {
                            params['result'] = HarooCode.document.public.done;
                            params['result'].shareUrl = meta.share;
                            params['result'].public = !isPublic;

                            callback(params['result']);
                        });
                    }
                });
            }
        });
    });
};

exports.togglePublicFromWeb = function (couch, params, callback) {
    // generate last count and today
    var today = CommonUtil.getToday();
    var counter = 1;
    var padChar = 3;
    var shareUrl = '';

    publicDoc.find({ release_date: today }, null, { limit: 1, sort: { counter: -1 }}, function (err, todayDocs) {
        if (err) return callback({ ok: false });

        if (!todayDocs.length) {
            shareUrl = today + '/' + makeZeroFill(counter, padChar);
        }

        publicDoc.findOne({haroo_id: params['haroo_id'], document_id: params['document_id']}, function (err, existDoc) {
            if (!existDoc) {
                counter = todayDocs.length ? Number(todayDocs[0].counter) + 1 : counter;

                shareUrl = today + '/' + makeZeroFill(counter, padChar);

                var shareDoc = new publicDoc({
                    release_date: today,
                    counter: counter,
                    public: true,
                    haroo_id: params['haroo_id'],
                    document_id: params['document_id']
                });

                shareDoc.save(function (err) {
                    if (err) return callback({ ok: false });
                });

                couch.get(params['document_id'], function (err, doc) {
                    if (err) {
                        return callback({ ok: false });
                    } else {
                        var meta = doc.meta || {};
                        // set public url
                        meta.share = shareUrl;
                        doc.meta = meta;

                        couch.insert(doc, params['document_id'], function (err, body) {
                            var result = {
                                ok: true,
                                public: !isPublic,
                                shareUrl: meta.share
                            };
                            callback(result);
                        });
                    }
                });

            } else {
                var isPublic = existDoc.public;
                existDoc.public = isPublic ? false: true;
                existDoc.save();

                counter = Number(existDoc.counter);
                shareUrl = today + '/' + makeZeroFill(counter, padChar);

                couch.get(params['document_id'], function (err, doc) {
                    if (err) {
                        console.log(err);
                        return callback({ ok: false });
                    } else {
                        var meta = doc.meta || {};
                        // toggle public url
                        meta.share = isPublic ? undefined : shareUrl;
                        doc.meta = meta;

                        couch.insert(doc, params['document_id'], function (err, body) {
                            var result = {
                                ok: true,
                                public: !isPublic,
                                shareUrl: meta.share
                            };
                            callback(result);
                        });
                    }
                });
            }
        });
    });
};
