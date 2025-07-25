const JWT = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

function createTokenForUser(user) {
    const payload = {
        _id: user._id
    };
    const token = JWT.sign( payload, secret );
    return token;
}

async function validateToken(token) {
    const payload = JWT.verify( token, secret );
    const User = require("../models/user");
    const user = await User.findById(payload._id);
    return user;
}

module.exports = {
    createTokenForUser,
    validateToken,
}