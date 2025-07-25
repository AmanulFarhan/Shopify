const userHelpers = require("../helpers/user-helpers")

module.exports = {
    setLocals: async( req, res, next ) => {
        try {
            if ( req.user ) {
                res.locals.user = req.user;
                res.locals.admin = req.user.role === "ADMIN";
                res.locals.cartCount = await userHelpers.getNumOfCartProducts( req.user._id );
            } else {
                res.locals.user = null;
                res.locals.admin = false;
                res.locals.cartCount = 0;
            }
            return next();
        } catch (err) {
            res.locals.user = null;
            res.locals.admin = false;
            res.locals.cartCount = 0;
            return next();
        }
    }
    
}