import { PasswordManager } from "../models/passwordManager.model.js";

export const savePassword = async (req, res) => {
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
};
