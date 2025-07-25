const Order = require("../models/order");
const Product = require("../models/product");

module.exports = {
    addProduct: async(data, file) => {
        const { name, category, description, price } = data;
        const product = await Product.create({
            name,
            category,
            description,
            price,
            image: {
                url: file.path,//file ? '/uploads/' + file.filename: null,
                public_id: file.filename
            }
        });
        return product;
    },
    updateProduct: (id, data, file) => {
        return new Promise((resolve, reject) => {
            Product.updateOne({ _id: id },
                 { $set: {
                    name: data.name,
                    category: data.category,
                    description: data.description,
                    price: data.price,
                    imageUrl: file ? '/uploads/' + file.filename: null,
                 } })
                .then(() => {
                    resolve();
                })
        })

    },
    getAllProducts: async () => {
        return await Product.find({});
    },
    // getOneProduct: async (id) => {
    //     return await Product.findOne({ _id: id });
    // }
    getOneProduct: (id) => {
        return new Promise((resolve, reject) => {
          Product.findOne({ _id: id }).then((response) => {
            resolve(response);
          });
        })
    },
    getTotalOrders: async () => {
        const orders = await Order.find({ status: { $in: ["placed", "shipped"] } });
        return orders.length;
    },
    getTotalRevenue: async () => {
        const orders = await Order.find({ status: { $in: ["placed", "shipped"] } });
        let revenue = 0;
        orders.forEach((order) => {
            revenue += order.totalAmount;
        });
        return revenue;
    },
    getTotalProducts: async () => {
        const products = await Product.find({});
        return products.length;
    }
};