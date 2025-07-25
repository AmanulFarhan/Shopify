const { Router } = require("express");
const Product = require("../models/product");
const productHelpers = require("../helpers/product-helpers");
const upload = require("../middlewares/multerUpload");
const adminHelpers = require("../helpers/admin-helpers");
const { isAdmin } = require("../middlewares/verifyAdmin");
const { cloudinary } = require("../config/cloudinary");

const router = Router();

router.get("/view-products", isAdmin, async(req, res) => {
    const products = await Product.find({});
    return res.render("admin/viewProducts", { products, admin: true, user: req.user });
});

router.get("/add-product",isAdmin, (req, res) => {
    return res.render("admin/addProduct", { admin: true, user: req.user });
});

router.get("/delete-product/:id",isAdmin, async(req, res) => {
    const product = await Product.findOneAndDelete({ _id: req.params.id });
    if (product) {
        await cloudinary.uploader.destroy(product.image.public_id);
    }
    return res.redirect("/admin/view-products");
});

router.get("/edit-product/:id", isAdmin, async(req, res) => {
    productHelpers.getOneProduct(req.params.id)
        .then((product) => {
            return res.render("admin/editProduct", { product, admin: true, user: req.user });
        });
});

router.get("/view-orders",isAdmin, async(req, res) => {
    const placedOrders = await adminHelpers.getAllPlacedOrders();
    return res.render("admin/viewOrders", { placedOrders });
});

router.get("/view-users", isAdmin, async (req, res) => {
    const users = await adminHelpers.getAllUsers();
    return res.render("admin/viewUsers", { users });
})

router.get("/ship-order/:id",isAdmin, (req, res) => {
    adminHelpers.shipOrder(req.params.id).then(() => {
        console.log("shippedorder");
        res.json({ status: true });
    });
});

router.post("/edit-product/:id",isAdmin, upload.single("image"), (req, res) => {
    productHelpers.updateProduct(req.params.id, req.body, req.file)
        .then(() => {
            return res.redirect("/admin/view-products");
        });
});

module.exports = router;