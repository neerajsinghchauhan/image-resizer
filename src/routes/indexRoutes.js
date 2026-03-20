const express = require("express");
const { requireLogin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", (req, res) => res.render("login"));
router.get("/signup", (req, res) => res.render("signup"));
router.get("/home", requireLogin, (req, res) => res.render("home"));

module.exports = router;
