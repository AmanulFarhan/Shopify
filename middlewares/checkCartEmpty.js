const Cart = require("../models/cart")

module.exports = {
    checkCartEmpty: function(req, res, next) {
        Cart.find({}).then((response) => {
            if (response.length !== 0) return next();
            return res.redirect("/")
        });
    }
}