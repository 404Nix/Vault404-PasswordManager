import conf from "../conf/config.js";
import { User } from "../models/user.model.js";
import generateToken from "../utils/token.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    const { name, icon, email, password } = req.body;

    const alreadyRegistered = await User.findOne({ email });

    if (alreadyRegistered) {
        return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({
        name,
        icon,
        email,
        password,
    });

    const accessToken = generateToken(user._id);

    const refreshToken = generateToken(user._id, "7d");

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
        message: "User registered successfully",
        user: {
            name: user.name,
            email: user.email,
            icon: user.icon,
        },
        accessToken,
    });
};

export const getMe = async (req, res) => {
    const { id } = req.user;

    const user = await User.findById(id);

    res.status(200).json({
        message: "User fetched successfully",
        user: {
            name: user.name,
            email: user.email,
            icon: user.icon,
        },
    });
};

export const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(refreshToken, conf.jwtSecret);

    const accessToken = generateToken(decoded.id);

    const newrefreshToken = generateToken(decoded.id, "7d");

    res.cookie("refreshToken", newrefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
        message: "Access token refreshed successfully",
        accessToken,
    });
};
