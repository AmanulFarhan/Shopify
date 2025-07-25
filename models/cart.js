const { Schema, model } = require("mongoose");

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    items: [{
        product : {
            type: Schema.Types.ObjectId,
            ref: "Product",
        },
        quantity: {
            type: Number,
            default: 1,
        }
    }],
}, { timestamps: true });

const Cart = model("cart", cartSchema);

module.exports = Cart;