const {body, validationResult} = require("express-validator");
const User = require("../models/user");

const validateUser = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('User name is required'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required'),
    body('password') 
        .trim()
        .notEmpty()
        .withMessage('Password is required'),
    (req, res, next) => {
        let errors = validationResult(req).array();

        if (errors.length > 0) {
            res.render("user/editProfile", {
                errors,
                formData: req.body,
                image: req.file ? req.file.originalname : null,
            });
        };
        next();
    },
];

module.exports = validateUser;