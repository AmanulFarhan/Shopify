const Cart = require("../models/cart");
const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: 'rzp_test_67klMYKmGOMhj3',
  key_secret: 'ybihQrPYV5Ww58VnWNs4kN5G',
});

module.exports = {
    addUser: async function( data ) {
        await User.create({
            fullName: data.name,
            email: data.email,
            password: data.password,
        });
    },
    updateUser: async function( userId, data, file ) {
        await User.updateOne({ _id: userId },{
            $set: {
                fullName: data.name,
                email: data.email,
                mobile: data.mobile,
                address: data.address,
                profileImageUrl: file ? file.path: "",
            }
        });
    },
    addToCart: ( proId, userId ) => {
        return new Promise(async(resolve, reject) => {
            const userCart = await Cart.findOne({ user: userId })
            if ( userCart ) {
                const proIndex = userCart.items.findIndex(
                    (item) => item.product.toString() === proId
                );
                if (proIndex > -1) {
                    userCart.items[proIndex].quantity += 1;
                } else {
                    userCart.items.push({ product: proId });
                }
                await userCart.save();
                resolve();
                
            } else {
                Cart.create({
                    user: userId,
                    items: [{
                        product: proId,
                    }]
                }).then((response) => resolve());

            }
        })
    },
    getAllCartProducts: ( userId ) => {
        return new Promise((resolve, reject) => {
            Cart.findOne({ user: userId }).populate("items.product").then((response) => {
                resolve(response);
            });
        })
    },
    
    getCartProductList: async( userId ) => {
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        console.log(cart.items);
        return cart.items;
    },
    getNumOfCartProducts: async( userId ) => {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) return 0;
        let count = 0;
        for (let i=0; i< cart.items.length; i++) {
            count += cart.items[i].quantity;
        }
        return count;
    },
    incrementCount: ( userId, proId ) => {
        return Cart.updateOne(
            { user: userId, "items.product": new mongoose.Types.ObjectId(proId) },
            { $inc: { "items.$.quantity": 1 } }
        );
    },
    decrementCount: ( userId, proId ) => {
        return Cart.updateOne(
            { user: userId, "items.product": new mongoose.Types.ObjectId(proId) },
            { $inc: { "items.$.quantity": -1 } }
        );
    },
    removeCartItem: async ( userId, proId ) => {
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        let proname = null;
        cart.items.forEach((item) => {
            if (item.product._id.toString() === proId) {
                proname = item.product.name;
            }
        });
        
        await Cart.updateOne(
            { user: userId },
            { $pull: { items: { product: new mongoose.Types.ObjectId(proId) } } }    
        );
        if (cart.items.length == 1) {
            return { cartEmpty: true, proname: proname }
        };
        
        return { cartEmpty: false, proname: proname };
       
    },
    getTotalAmount( userId ) {
        return new Promise(async(resolve, reject) => {
            const cart = await Cart.findOne({ user: userId }).populate("items.product");
            let total = 0;
            cart.items.forEach((item) => {
                total += (item.product.price * item.quantity);
            });
            resolve(total);
        })
    },
    placeOrder( userId, order, orderProducts, total ) {
        return new Promise((resolve, reject) => {
            Order.create({
                deliveryDetails: {
                    mobile: order.mobile,
                    address: order.address,
                    pincode: order.pincode,
                },
                userId: order.userId,
                paymentMethod: order.payment,
                products: orderProducts,
                totalAmount: total,
                status: order.payment==="COD"?"placed":"pending",
            }).then((response) => {
                
                Cart.deleteOne({ user: userId }).then(() => {
                    resolve({
                        id: response._id,
                        total: response.totalAmount,
                    });
            });
                
            })
        })
    },
    viewOrderProducts: ( orderId ) => {
        return Order.findOne({ _id: orderId }).populate("products.productId").then((response) => {
            return response.products;
        })
    },
    getUserOrders: async(userId) => {
        const orders = await Order.find({ userId: userId });
        return orders;
    },
    getTotalUsers: async () => {
        const users = await User.find({ role: "USER" });
        return users.length;
    },
    generateRazorPay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: orderId, 
            };
            instance.orders.create(options, function(err, order) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("New Order: ", order);
                    resolve(order);
                }
                
            });
        });
    },
    verifyPayment: (details) => {
       return new Promise((resolve, reject) => {
            console.log(details);
            const crypto = require("crypto");
            console.log("Verifying Payment...\n");
            const hmac = crypto.createHmac("SHA256", "ybihQrPYV5Ww58VnWNs4kN5G");
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            const expectedSignature = hmac.digest("hex");
            if (expectedSignature === details['payment[razorpay_signature]']) {
                console.log("verifying success");
                resolve();
            } else {
                console.log("verifying failed");
                reject();
            }
       });
    },
    changeOrderStatus: async(orderId) => {
        console.log("changing status\n");
        console.log("sd: "+orderId);
        const placedOrder = await Order.updateOne({ _id: orderId },
            {
                 $set: {
                     status: "placed" 
                 } 
            }
        );
        console.log(placedOrder);
        
    }
};
