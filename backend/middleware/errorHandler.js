const multer = require('multer');
const { maxUploadBytes } = require('../config');

// Unknown /api routes
function notFound(req, res) {
    res.status(404).json({ success: false, message: `No API route for ${req.method} ${req.originalUrl}` });
}

// Every error ends up here and is sent back as { success: false, message }.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    let status = err.status || 500;
    let message = err.message;

    if (err instanceof multer.MulterError) {
        status = 400;
        message = err.code === 'LIMIT_FILE_SIZE'
            ? `Files must be smaller than ${Math.round(maxUploadBytes / 1024 / 1024)} MB`
            : err.message;
    } else if (err.name === 'ValidationError') {
        status = 400;
        message = Object.values(err.errors).map(e => e.message).join('. ');
    } else if (err.name === 'CastError') {
        status = 400;
        message = `Invalid value for ${err.path}`;
    } else if (err.code === 11000) {
        status = 400;
        message = 'This record already exists';
    } else if (err.type === 'entity.parse.failed') {
        status = 400;
        message = 'The request body is not valid JSON';
    }

    if (status >= 500) {
        console.error(err);
        message = 'Something went wrong on the server. Please try again.';
    }
    res.status(status).json({ success: false, message });
}

module.exports = { notFound, errorHandler };
