const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/");
    }
    next();
};

module.exports = { requireLogin };
