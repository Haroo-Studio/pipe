var mongoose = require('mongoose');

var loggingSchema = new mongoose.Schema({
    email: { type: String, index: true, lowercase: true },
    token: { type: String, index: true },
    created_at: Date,
    updated_at: Date,
    removed_at: Date,
    linked_at: Date,
    unlinked_at: Date,
    signed_in: Date,
    signed_out: Date,
    reset_password: Date,
    check_token: Date
});

module.exports = mongoose.model('account_log', loggingSchema);