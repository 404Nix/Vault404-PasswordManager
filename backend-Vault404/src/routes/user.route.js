import express from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import {
    deleteUserAccount,
    getMe,
    loginUser,
    logOut,
    logOutAll,
    refreshToken,
    registerUser,
    updatePassword,
    updateProfile,
    getActiveSessions,
} from "../controllers/user.controller.js";
import { validate, validateLogin, validateRegister, validateUpdatePassword, validateUpdateProfile } from "../utils/validators.js";

const router = express.Router();

router.post("/register", validateRegister, validate, registerUser);
router.post("/login", validateLogin, validate, loginUser);

router.get("/get-me", requireAuth, getMe);

router.get("/refresh-token", refreshToken);

router.post("/logout", requireAuth, logOut);
router.post("/logout-all", requireAuth, logOutAll);

router.put("/update-password", requireAuth, validateUpdatePassword, validate, updatePassword);
router.put("/update-profile", requireAuth, validateUpdateProfile, validate, updateProfile);

router.get("/sessions", requireAuth, getActiveSessions);

router.delete("/delete-user", requireAuth, deleteUserAccount);

export default router;
