const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
    deliveryDetails: {
        mobile: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
        },
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
        },
        quantity: {
            type: Number,
            default: 1,
        }
    }],
    totalAmount: {
        type: Number,
    },
    status: {
        type: String,
    },
}, { timestamps: true });

const Order = model("order", orderSchema);

module.exports = Order;