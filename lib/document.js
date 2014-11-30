var HarooCode = require('../lib/code');
var CommonUtil = require('../lib/common');

var publicDoc = require('../model/publicDocument');

exports.togglePublic = function (couch, params, callback) {
    // generate last count and today
    var today = CommonUtil.getToday();
    var shareUrl = '';

    publicDoc.find({ release_date: today }, null, { limit: 1, sort: { counter: -1 }}, function (err, todayDocs) {
        if (err) {
            params['result'] = CommonUtil.setDBErrorToClient(err, HarooCode.document.public.database, params['result']);
            return callback(params['result']);
        }

        if (!todayDocs.length) {
            shareUrl = today + '/' + CommonUtil.makeZeroFill();
        }

        publicDoc.findOne({haroo_id: params['haroo_id'], document_id: params['document_id']}, function (err, existDoc) {
            if (!existDoc) {
                var counter = todayDocs.length ? Number(todayDocs[0].counter) + 1 : 1;  // default counter = 1

                shareUrl = today + '/' + CommonUtil.makeZeroFill(counter);

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
    var shareUrl = '';

    publicDoc.find({ release_date: today }, null, { limit: 1, sort: { counter: -1 }}, function (err, todayDocs) {
        if (err) return callback({ ok: false });

        if (!todayDocs.length) {
            shareUrl = today + '/' + CommonUtil.makeZeroFill();
        }

        publicDoc.findOne({haroo_id: params['haroo_id'], document_id: params['document_id']}, function (err, existDoc) {
            if (!existDoc) {
                var counter = todayDocs.length ? Number(todayDocs[0].counter) + 1 : 1;  // default counter = 1

                shareUrl = today + '/' + CommonUtil.makeZeroFill(counter);

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

                shareUrl = today + '/' + CommonUtil.makeZeroFill(Number(existDoc.counter));

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
