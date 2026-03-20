const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/signup",
    [
        body("name").notEmpty().withMessage("Name is required."),
        body("password")
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
            .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Must contain one special character.")
            .matches(/\d/).withMessage("Must contain one number."),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("signup", { errors: errors.array() });
        }
        
        try {
            const existingUser = await User.findOne({ name: req.body.name });
            if (existingUser) {
                return res.render("signup", { errors: [{ msg: "Username already exists." }] });
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = await User.create({ 
                name: req.body.name, 
                password: hashedPassword 
            });
            req.session.userId = user._id.toString();
            res.redirect("/home");
        } catch (error) {
            next(error); 
        }
    }
);

router.post("/login", async (req, res, next) => {
    try {
        const user = await User.findOne({ name: req.body.name });
        if (!user) return res.render("login", { error: "User not found" });
        
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (isMatch) {
            req.session.userId = user._id.toString();
            res.redirect("/home");
        } else {
            res.render("login", { error: "Wrong credentials" });
        }
    } catch (error) {
        next(error);
    }
});

router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

module.exports = router;
