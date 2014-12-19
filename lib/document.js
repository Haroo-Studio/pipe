var HarooCode = require('../lib/code');
var CommonUtil = require('../lib/common');

var PublicDocument = require('../model/publicDocument');

exports.togglePublic = function (couch, params, callback) {
    // generate last count and today
    var today = CommonUtil.getToday();
    var shareUrl = '';

    PublicDocument.find({ release_date: today }, null, { limit: 1, sort: { counter: -1 }}, function (err, todayDocs) {
        if (err) {
            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.document.public.database, params['result']);
            return callback(params['result']);
        }

        if (!todayDocs.length) {
            shareUrl = today + '/' + CommonUtil.makeZeroFill();
        }

        PublicDocument.findOne({haroo_id: params['haroo_id'], document_id: params['document_id']}, function (err, existDoc) {
            if (!existDoc) {
                var counter = todayDocs.length ? Number(todayDocs[0].counter) + 1 : 1;  // default counter = 1

                shareUrl = today + '/' + CommonUtil.makeZeroFill(counter);

                var shareDoc = new PublicDocument({
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

                shareUrl = today + '/' + CommonUtil.makeZeroFill(Number(existDoc.counter));

                couch.get(params['document_id'], function (err, doc) {
                    if (err) {
                        params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.document.public.database, params['result']);
                        return callback(params['result']);
                    } else {
                        var meta = doc.meta || {};
                        // toggle public url
                        meta.share = isPublic ? undefined : shareUrl;
                        doc.meta = meta;

                        couch.insert(doc, params['document_id'], function (err) {
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

exports.publicView = function (nano, params, callback) {
    PublicDocument.findOne({release_date: params.date, counter: params.counter}, function (err, publicDoc) {
        if (err || !publicDoc || !publicDoc.haroo_id || !publicDoc.document_id) {
            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.document.public.database, params['result']);
            return callback(params['result']);
        }

        var couch = nano.db.use(publicDoc['haroo_id']);

        couch.get(publicDoc['document_id'], function (err, document) {
            if (!document) {
                params['result'] = HarooCode.document.view.database;
                return callback(params['result']);
            }

            if (!params['counted']) {
                publicDoc.viewCount = publicDoc.viewCount ? publicDoc.viewCount + 1 : 1;
                publicDoc.save();
            }

            params['result'] = HarooCode.document.view.done;
            params['result'].doc = document;
            params['result'].meta = publicDoc;

            callback(params['result']);
        });
    });
};

exports.toggleImportant = function (couch, params, callback) {
    // generate last count and today

    couch.get(params['document_id'], function (err, doc) {
        if (err) {
            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.document.important.database, params['result']);
            return callback(params['result']);
        } else {
            var important = doc.important || false;
            important = !important ? true : undefined;
            doc.important = important;
            couch.insert(doc, params['document_id'], function (err) {
                params['result'] = HarooCode.document.important.done;
                params['result'].important = important;
                callback(params['result']);
            });
        }
    });
};