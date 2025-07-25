const express = require("express");
require('dotenv').config();
const path = require("path");
const productRoute = require("./routes/product");
const adminRoute = require("./routes/admin");
const userRoute = require("./routes/user");
const { connectToMongoDB } = require("./config/connection");
const productHelpers = require("./helpers/product-helpers");
const userHelpers = require("./helpers/user-helpers");
const cookieParser = require("cookie-parser");
const { checkForAuthentication } = require("./middlewares/authentication");
const { setLocals } = require("./middlewares/setLocals");
const app = express();
const PORT = process.env.PORT;

connectToMongoDB(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.log("Error: ", err));
    
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(checkForAuthentication("token"));
app.use(setLocals);

app.use("/product", productRoute);
app.use("/admin", adminRoute);
app.use("/user", userRoute);

app.get("/", async(req, res) => {
    try {
        const products = await productHelpers.getAllProducts();
        const totalOrders = await productHelpers.getTotalOrders();
        const totalUsers = await userHelpers.getTotalUsers();
        const totalRevenue = await productHelpers.getTotalRevenue();
        const totalProducts = await productHelpers.getTotalProducts();
        return res.render("home", {
            products,
            totalOrders,
            totalUsers,
            totalRevenue,
            totalProducts,
        });
    } catch( err ) {
        console.log(err);
        res.status(500).send("Error loading Products");
    }
});


app.listen(PORT, () => console.log("Server Started on PORT: "+PORT));
