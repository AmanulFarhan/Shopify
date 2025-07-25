const { Schema, model } = require("mongoose");

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        url: {
            type: String,
        },
        public_id: {
            type: String
        }
    }
}, { timestamps: true });

const Product = model("Product", productSchema);

module.exports = Product;