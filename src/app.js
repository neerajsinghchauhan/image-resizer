const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");

const indexRoutes = require("./routes/indexRoutes");
const authRoutes = require("./routes/authRoutes");
const imageRoutes = require("./routes/imageRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const templatePath = path.join(__dirname, "../templates");

// Configuration
app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "default_secret_key_123"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Registers Routes Middleware
app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", imageRoutes);

// Global Error Handler catches all unhandled next(error)
app.use(errorHandler);

module.exports = app;
