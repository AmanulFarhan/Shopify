function verifyLogin(req, res, next) {
    if (req.user) {
        return next();
    }

    // Check if it's an AJAX request
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({ loginRequired: true });
    }

    // Otherwise, redirect as normal
    return res.redirect("/user/signin");
}

module.exports = { verifyLogin }
