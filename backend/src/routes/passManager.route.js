import express from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import { savePassword } from "../controllers/passwordManager.controller.js";

const router = express.Router();

router.post("/save-password", requireAuth, savePassword);

export default router;
