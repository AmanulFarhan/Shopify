const Order = require("../models/order");
const User = require("../models/user");

module.exports = {
    getAllPlacedOrders: async function() {
        const placedOrders = await Order.find({ status: {$in: ["placed", "shipped"]} });
        return placedOrders;
    },
    getAllUsers: async function() {
        const users = await User.find({ role: "USER" });
        return users;
    },
    shipOrder: function(orderId) {
        return new Promise((resolve, reject) => {
            console.log("helpers");
            Order.findById(orderId).then((order) => {
                order.status = "shipped";
                order.save().then(() => {
                    resolve();
                })
            })
        });
    }
}