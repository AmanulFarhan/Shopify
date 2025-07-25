const { Schema, model } = require("mongoose");
const { createHmac, randomBytes, Hmac } = require("crypto");
const { createTokenForUser } = require("../service/authentication");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String, 
        required: true,
        unique: true,
    },
    mobile: {
        type: Number,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageUrl: {
        type: String,
        default: "/images/avatar.png",
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER',
    }
}, { timestamps: true });

userSchema.pre("save", function(next) {
    const user = this;
    if (!user.isModified("password")) return next();

    const salt = randomBytes(16).toString("hex");

    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");

    this.password = hashedPassword;
    this.salt = salt;
    next();
});

userSchema.static("matchPasswordAndGenerateToken", async function({ email, password }) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
        .update(password)
        .digest("hex");


    if ( hashedPassword !== userProvidedHash ) throw new Error("Incorrect Password");
    
    const token = createTokenForUser(user);
    return token;
});

const User = model("user", userSchema);

module.exports = User;