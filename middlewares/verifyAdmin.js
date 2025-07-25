function isAdmin(req, res, next) {
    if (res.locals.admin) {
        return next();
    }
    return res.status(403).send("Access denied. Admins only.");
}

module.exports = { isAdmin }