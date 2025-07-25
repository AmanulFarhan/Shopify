const { validateToken } = require("../service/authentication");


function checkForAuthentication(cookieName) {
    return async(req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        if ( !tokenCookieValue ) return next();

        try {
            const user = await validateToken( tokenCookieValue );
            req.user = user;
        } catch(err) {
            console.log(err);
        }
        next();
    }
}

module.exports = {
    checkForAuthentication,
}