const errorHandler = (err, req, res, next) => {
    console.error("❌ Global Server Error:", err.message);
    if (process.env.NODE_ENV === "development") {
        console.error(err.stack);
    }
    res.status(500).send("Something went wrong on our servers. Please try again later.");
};

module.exports = errorHandler;
