const {body, validationResult} = require("express-validator");

const validateProduct = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .isString()
        .withMessage('Category must be a string'),
    body('description') 
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    body('price') 
        .trim()
        .notEmpty()
        .withMessage('Price is required')
        .isFloat()
        .withMessage('Price must be a valid number'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("admin/addProduct", {
                errors: errors.array(),
                formData: req.body,
                image: req.file ? req.file.originalname : null,
            });
        };
        next();
    },
];

module.exports = validateProduct;