const { Router } = require("express");
const validateUser = require("../middlewares/validateUser");
const Product = require("../models/product");
const userHelpers = require("../helpers/user-helpers");
const User = require("../models/user");
const { verifyLogin } = require("../middlewares/verifyLogin");
const productHelpers = require("../helpers/product-helpers");
const { checkCartEmpty } = require("../middlewares/checkCartEmpty");
const { storage } = require("../config/cloudinary");
const multer = require("multer");

const router = Router();

router.get("/signup", (req, res) => {
    return res.render("user/signup");
});

router.get("/signin", (req, res) => {
    if ( req.user ) {
        res.redirect("/");
    } else {
        const err = req.query.error; 
        res.render("user/signin", { error: err });
    }
});

router.get("/logout", (req, res) => {
    return res.clearCookie("token").redirect("/");
});

router.get("/profile", async(req, res) => {
    const user = await User.findOne({ _id: req.user._id });
    if (user) {
        req.user = user;
    }
    return res.render("user/profile", { user });
});

router.get("/edit-profile", (req, res) => {
    return res.render("user/editProfile", { formData: {} });
});

const upload = multer({ storage });

router.post("/edit-profile",upload.single("userImage"), async(req, res) => {
    try {
        const user = await userHelpers.updateUser(req.user._id, req.body, req.file);
        console.log("user added");
        return res.redirect("/user/profile");
    } catch(err) {
        console.error(err); 
        res.status(500).send("User Profile Went wrong");
    }
});

router.get("/cart", verifyLogin, async(req, res) => {
    userHelpers.getAllCartProducts(req.user._id)
        .then((response) => {
            if (!response || response.items.length === 0) return res.redirect("/");
            return res.render("user/cart", { items: response.items });
        })
});

router.get("/cart/increment/:id", (req, res) => {
    userHelpers.incrementCount( req.user._id, req.params.id )
        .then(() => {
            res.json({ status: true });
        });
});

router.get("/cart/decrement/:id", (req, res) => {
    userHelpers.decrementCount( req.user._id, req.params.id )
        .then(() => {
            res.json({ status: true });
        });
});

router.get("/add-to-cart/:id", verifyLogin, (req, res) => {
    userHelpers.addToCart( req.params.id, req.user._id )
        .then(() => {
            res.json({ status: true });
        })
});

router.get("/cart/remove-cart-item/:id", async(req, res) => {
    const status = await userHelpers.removeCartItem( req.user._id, req.params.id );
    res.json(status);
});

router.get("/cart/place-order", checkCartEmpty, (req, res) => {
    userHelpers.getTotalAmount( req.user._id )
        .then((response) => {
            return res.render("user/place-order", { total: response });
        })
});

router.get("/cart/checkout", (req, res) => {
    return res.render("user/checkout");
});

router.get("/cart/orders", async(req, res) => {
    const orders = await userHelpers.getUserOrders( req.user._id );
    return res.render("user/orders", { orders: orders });
});

router.get("/cart/view-order-products/:id", async(req, res) => {
    const products = await userHelpers.viewOrderProducts( req.params.id );
    console.log("pro: " + products);
    return res.render("user/orderProducts", { products });
});

router.post("/cart/place-order", async(req, res) => {
    const cartItems = await userHelpers.getCartProductList( req.user._id );
    const orderProducts = cartItems.map((item) => {
        return {
            productId: item.product._id,
            quantity: item.quantity,
        }
    });
    const total = await userHelpers.getTotalAmount( req.user._id );
    userHelpers.placeOrder( req.user._id, req.body, orderProducts, total )
        .then((response) => {
            if (req.body["payment"] == 'COD') {
                req.payment = 'cod';
                res.json({ codSuccess: true });
            } else {
                userHelpers.generateRazorPay(response.id, response.total)
                    .then((response) => {
                        res.json(response);
                    })
            }
        });
});

router.post("/verifyPayment", (req, res) => {
    userHelpers.verifyPayment(req.body).then(() => {
        userHelpers.changeOrderStatus( req.body['order[receipt]'] ).then(() => {
            console.log("Payment Successfull");
            res.json({ status: true });
        })
    }).catch((err) => {
        console.log(err);
        res.json({ status: false, errMsg: "Payment Failed: "+err });
    })
});

router.post("/signup", validateUser, async(req, res) => {
    await userHelpers.addUser( req.body );
    return res.redirect("/user/signin");
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken({ email, password });
        return res.cookie("token", token).redirect("/");
        
    } catch(err) {
        res.redirect("/user/signin?error=Incorrect%20Email%20or%20Password");
    };
});

module.exports = router;