const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { maxUploadBytes } = require('../config');
const { HttpError } = require('../utils/http');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Allowed file types for each upload field
const ALLOWED = {
    resume: ['.pdf', '.doc', '.docx'],
    certificate: ['.pdf', '.jpg', '.jpeg', '.png'],
};

const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    // Random name: keeps the extension, avoids clashes and unsafe characters,
    // and makes the public link hard to guess.
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: maxUploadBytes, files: 2 },
    fileFilter: (req, file, cb) => {
        const allowed = ALLOWED[file.fieldname];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowed) return cb(new HttpError(400, `Unexpected file field "${file.fieldname}"`));
        if (!allowed.includes(ext)) {
            return cb(new HttpError(400, `The ${file.fieldname} must be one of: ${allowed.join(', ')}`));
        }
        cb(null, true);
    },
});

// URL the browser can open for a saved file
const fileUrl = (file) => (file ? `/uploads/${file.filename}` : null);

// Delete a previously uploaded file (e.g. when a profile gets a new resume)
function removeUpload(url) {
    if (!url || !url.startsWith('/uploads/')) return;
    const filePath = path.join(UPLOAD_DIR, path.basename(url));
    fs.unlink(filePath, () => {}); // Ignore errors: the file may already be gone
}

module.exports = { upload, fileUrl, removeUpload, UPLOAD_DIR };
