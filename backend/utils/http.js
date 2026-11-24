const mongoose = require('mongoose');

// Express 4 does not catch errors thrown in async handlers; pass them to the error handler.
const asyncHandler = (handler) => (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);

// An error with an HTTP status, sent to the client as { success: false, message }.
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);

// Trimmed string, or '' for anything missing.
const clean = (value) => (typeof value === 'string' ? value.trim() : value === undefined || value === null ? '' : String(value).trim());

// Turn a form value (missing, single value or array) into an array of non-empty trimmed strings.
const toList = (value) => [].concat(value === undefined || value === null ? [] : value).map(clean);

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { asyncHandler, HttpError, isValidId, clean, toList, escapeRegex };
