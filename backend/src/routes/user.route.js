import express from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import { getMe, refreshToken, registerUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser );
router.post("/login", () => {}, () => {} );

router.post("/password/verify", requireAuth, () => {} );

router.get("/get-me", requireAuth, getMe );

router.get("/refresh-token", refreshToken );

export default router;