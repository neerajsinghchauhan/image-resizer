const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const archiver = require("archiver");
const { requireLogin } = require("../middlewares/authMiddleware");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const validateDimensions = (req, res, next) => {
    const { width, height } = req.body;
    if (!width || !height || isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return res.status(400).send("Please provide valid width and height values");
    }
    req.dimensions = { width: parseInt(width), height: parseInt(height) };
    next();
};

const processImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send("No files uploaded");
    }

    try {
        req.resizedImages = await Promise.all(
            req.files.map(async (file) => {
                const buffer = await sharp(file.buffer)
                    .resize(req.dimensions.width, req.dimensions.height)
                    .jpeg({ quality: 90 })
                    .toBuffer();

                return {
                    buffer,
                    filename: `resized-${Date.now()}-${file.originalname}`
                };
            })
        );
        next();
    } catch (error) {
        next(error); 
    }
};

router.post("/multiple-upload", 
    requireLogin,
    upload.array("images", 10),
    validateDimensions,
    processImages,
    (req, res) => {
        const archive = archiver("zip", { zlib: { level: 9 }});
        
        res.attachment("resized-images.zip");
        archive.pipe(res);

        req.resizedImages.forEach(({ buffer, filename }) => {
            archive.append(buffer, { name: filename });
        });

        archive.finalize();
    }
);

module.exports = router;
