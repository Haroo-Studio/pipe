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


exports.togglePublic = function (nano, params, callback) {
    var couch = nano.db.use(params['haroo_id']);

    // generate last count and today
    var today = CommonUtil.getToday();
    var counter = 1;
    var padChar = 3;
    var shareUrl = '';

    publicDoc.find({ release_date: today }, null, { limit: 1, sort: { counter: -1 }}, function (err, todayDocs) {
        if (err) {
            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.document.public.database, params['result']);
            callback(params['result']);

            return;
        }

        if (!todayDocs.length) {
            shareUrl = today + '/' + makeZeroFill(counter, padChar);
        }

        publicDoc.findOne({haroo_id: params['haroo_id'], document_id: params['document_id']}, function (err, existDoc) {
            if (!existDoc) {
                console.log(todayDocs);
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
                        callback(params['result']);

                        return;
                    }
                });

                couch.get(params['document_id'], function (err, doc) {
                    if (err) {
                        params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.document.public.database, params['result']);
                        callback(params['result']);

                        return;
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
                        callback(params['result']);

                        return;
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
