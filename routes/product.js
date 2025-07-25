const { Router } = require("express");
const Product = require("../models/product");
const validateProduct = require("../middlewares/validateProduct");
const multer = require("multer");
// const upload = require("../middlewares/multerUpload");
const { storage } = require("../config/cloudinary");
const productHelpers = require("../helpers/product-helpers");

const router = Router();

router.get("/:id", async(req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    return res.render("user/product", { 
        product,
        user: req.user,
    });
})

const upload = multer({ storage });

router.post("/", upload.single("image"), validateProduct, async(req, res) => {
    try {
        const product = await productHelpers.addProduct(req.body, req.file);
        console.log("product added");
        return res.redirect(`/product/${product._id}`);
    } catch(err) {
        console.error(err); 
        res.status(500).send("addProduct Went wrong");
    }
    
});

module.exports = router;