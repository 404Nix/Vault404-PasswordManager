// middleware/validate.js
import { body, validationResult } from "express-validator";

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

export const validateRegister = [
    body("email").isEmail().withMessage("Invalid email!").normalizeEmail(),
    body("name")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Name is required!"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters!"),
];

export const validateLogin = [
    body("email").isEmail().withMessage("Invalid email!"),
    body("password").notEmpty().withMessage("Password is required!"),
];
