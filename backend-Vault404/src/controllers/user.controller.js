import conf from "../conf/config.js";
import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import generateAccessToken from "../utils/accessToken.js";
import generateRefreshToken from "../utils/refreshToken.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { PasswordManager } from "../models/passwordManager.model.js";

const isProduction = process.env.NODE_ENV === "production";
console.log("Backend Environment - isProduction:", isProduction, "NODE_ENV:", process.env.NODE_ENV);

const cookieOptions = {
    httpOnly: true,
    // SameSite: 'none' is often required for cross-port localhost requests in modern browsers
    // In dev, we can use 'none' without 'secure' in some browsers, but 'lax' is safer if they are seen as same-site.
    // Let's try 'lax' but explicitly disable 'secure'.
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
console.log("Cookie Options configured as:", cookieOptions);


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

        res.cookie("refreshToken", refreshToken, cookieOptions);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                name: user.name,
                email: user.email,
                icon: user.icon,
                updatedAt: user.updatedAt,
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

        const decoded = await bcrypt.compare(password, user.password);

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

        res.cookie("refreshToken", refreshToken, cookieOptions);

        res.status(200).json({
            message: "User logged In successfully",
            user: {
                name: user.name,
                email: user.email,
                icon: user.icon,
                updatedAt: user.updatedAt,
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
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        console.log("Headers arriving:", req.headers);
        console.log("Cookies arriving:", req.cookies);
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            console.log("No refresh token found in cookies");
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

        res.cookie("refreshToken", newRefreshToken, cookieOptions);

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
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
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
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
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
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
        });

        res.status(200).json({
            message: "Account Deleted Successfully!",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        user.password = newPassword;
        await user.save(); // pre-save hook will hash it

        res.status(200).json({
            message: "Password updated successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const { name, email, currentPassword } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the new email is already taken by another user
        if (email && email !== user.email) {
            const existing = await User.findOne({ email, _id: { $ne: id } });
            if (existing) {
                return res.status(409).json({ message: "Email is already in use by another account" });
            }

            // Require password for email change
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to change email" });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Incorrect password for email update" });
            }

            user.email = email;
        }

        if (name) user.name = name;
        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                name: user.name,
                email: user.email,
                icon: user.icon,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getActiveSessions = async (req, res) => {
    try {
        const { id } = req.user;

        const sessions = await Session.find({
            userId: id,
            revoked: false,
        }).sort({ updatedAt: -1 });

        // Get the current session ID from the JWT so frontend can mark "this device"
        const token = req.headers.authorization?.split(" ")[1];
        let currentSessionId = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, conf.jwtSecret);
                currentSessionId = decoded.sessionId || null;
            } catch (_) { /* ignore */ }
        }

        const formatted = sessions.map((s) => ({
            id: s._id,
            ip: s.ip,
            userAgent: s.userAgent,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
            isCurrent: String(s._id) === String(currentSessionId),
        }));

        res.status(200).json({
            message: "Sessions fetched successfully",
            sessions: formatted,
            count: formatted.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
