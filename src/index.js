const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const hbs = require("hbs");
const { body, validationResult } = require("express-validator");
const collection = require("./mongodb");
const multer = require("multer");
const sharp = require("sharp");
const archiver = require("archiver");

const app = express();
const templatePath = path.join(__dirname, "../templates");

// Configuration
app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to validate dimensions
const validateDimensions = (req, res, next) => {
    const { width, height } = req.body;
    if (!width || !height || isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return res.status(400).send("Please provide valid width and height values");
    }
    req.dimensions = { width: parseInt(width), height: parseInt(height) };
    next();
};

// Image processing middleware
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
        console.error("Image processing error:", error);
        res.status(500).send("Error processing images");
    }
};

// Routes
app.get("/", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));


// Image Upload Route
app.post("/multiple-upload", 
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

// Signup Route
app.post("/signup",
    [
        body("name").notEmpty().withMessage("Name is required."),
        body("password")
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
            .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Must contain one special character.")
            .matches(/\d/).withMessage("Must contain one number."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("signup", { errors: errors.array() });
        }
        
        try {
            await collection.create({ 
                name: req.body.name, 
                password: req.body.password 
            });
            res.render("home");
        } catch (error) {
            res.status(500).render("signup", { 
                errors: [{ msg: "Registration failed. Please try again." }] 
            });
        }
    }
);

// Login Route
app.post("/login", async (req, res) => {
    try {
        const user = await collection.findOne({ name: req.body.name });
        if (!user) return res.send("User not found");
        
        if (user.password === req.body.password) {
            res.render("home");
        } else {
            res.send("Wrong credentials");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error occurred");
    }
});

// Start Server
app.listen(3000, () => console.log("🚀 Server running on port 3000"));