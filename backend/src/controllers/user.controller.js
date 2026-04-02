import conf from "../conf/config.js";
import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import generateAccessToken from "../utils/accessToken.js";
import generateRefreshToken from "../utils/refreshToken.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { PasswordManager } from "../models/passwordManager.model.js";

export const registerUser = async (req, res) => {
    try {
        const { name, icon, email, password } = req.body;

        const alreadyRegistered = await User.findOne({ email });

        if (alreadyRegistered) {
            return res
                .status(409)
                .json({ message: "Email is already registered" });
        }

        const user = await User.create({
            name,
            icon,
            email,
            password,
        });

        const refreshToken = generateRefreshToken(user._id);

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const session = await Session.create({
            userId: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });

        const accessToken = generateAccessToken(user._id, session._id);

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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email,
        });

        if (!user) {
            return res.status(409).json({ message: "User Not Found" });
        }

        const decoded = bcrypt.compare(password, user.password);

        if (!decoded) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const refreshToken = generateRefreshToken(user._id);

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const session = await Session.create({
            userId: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });

        const accessToken = generateAccessToken(user._id, session._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            message: "User logged In successfully",
            user: {
                name: user.name,
                email: user.email,
                icon: user.icon,
            },
            accessToken,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMe = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(refreshToken, conf.jwtSecret);

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const session = await Session.findOne({
            refreshTokenHash,
            revoked: false,
        });

        if (!session) {
            return res
                .status(401)
                .json({ message: "Session invalid or expired" });
        }

        const newRefreshToken = generateRefreshToken(decoded.id);

        const accessToken = generateAccessToken(decoded.id, session._id);

        const newRefreshTokenHash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");

        session.refreshTokenHash = newRefreshTokenHash;
        await session.save();

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logOut = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const session = await Session.findOne({
            refreshTokenHash,
            revoked: false,
        });

        if (!session) {
            return res
                .status(401)
                .json({ message: "Session invalid or expired" });
        }

        session.revoked = true;
        await session.save();

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

        res.status(200).json({
            message: "Logged Out successfully!",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logOutAll = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(refreshToken, conf.jwtSecret);

        await Session.updateMany(
            {
                userId: decoded.id,
                revoked: false,
            },
            {
                revoked: true,
            },
        );

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

        res.status(200).json({
            message: "Logged Out from All Devices Successfully!",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUserAccount = async (req, res) => {
    try {
        const { id } = req.user;

        await PasswordManager.deleteMany({
            userId: id,
        });

        await Session.updateMany(
            {
                userId: id,
                revoked: false,
            },
            {
                revoked: true,
            },
        );

        const deleteUser = await User.findByIdAndDelete({
            _id: id,
        });

        if (!deleteUser) {
            return res.status(401).json({
                message: "Error While Deleting Account Please Try Again!",
            });
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

        res.status(200).json({
            message: "Account Deleted Successfully!",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
