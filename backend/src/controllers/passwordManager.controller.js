import { PasswordManager } from "../models/passwordManager.model.js";

export const savePassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { username, password, platformSlug, platformName } = req.body;

        const passManager = await PasswordManager.create({
            userId: id,
            platformSlug,
            platformName,
            username,
            password,
        });

        res.status(201).json({
            message: "Password saved/secured successfully!",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const listPasswords = async (req, res) => {
    try {
        const { id } = req.user;
        const passwords = await PasswordManager.find({
            userId: id,
        });

        if (passwords.length === 0) {
            return res.status(400).json({
                message: "Didn't Find Any Saved Passwords",
            });
        }

        res.status(200).json({
            message: "Passwords Fetched Successfully!",
            passwords: passwords,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPasswordById = async (req, res) => {
    try {
        const { id } = req.user;
        const { id: passId } = req.params;

        const passwordById = await PasswordManager.findOne({
            _id: passId,
            userId: id,
        });

        if (!passwordById) {
            return res.status(404).json({
                message: "Password Does Not Exist",
            });
        }

        res.status(200).json({
            message: "Password Fetched Successfully",
            data: {
                username: passwordById.username,
                password: passwordById.decryptPassword(),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { id: passId } = req.params;
        const { username, password } = req.body;

        const updatePassword = await PasswordManager.findOne({
            userId: id,
            _id: passId,
        });

        if (!updatePassword) {
            return res.status(401).json({
                message: "Error While Updating Please Try Again!",
            });
        }

        if (username) updatePassword.username = username;
        if (password) updatePassword.password = password;

        await updatePassword.save();

        res.status(201).json({
            message: "Username And Password Updated Successfully!",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { id: passId } = req.params;
        const deletePassword = await PasswordManager.findOneAndDelete({
            userId: id,
            _id: passId,
        });

        if (!deletePassword) {
            return res.status(401).json({
                message: "Entry Doesn't Exist!",
            });
        }

        res.status(200).json({
            message: "Entry Deleted Successfully!",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
