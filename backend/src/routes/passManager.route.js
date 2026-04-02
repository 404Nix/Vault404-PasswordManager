import express from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import {
    deletePassword,
    getPasswordById,
    listPasswords,
    savePassword,
    updatePassword,
} from "../controllers/passwordManager.controller.js";

const router = express.Router();

router.post("/save-password", requireAuth, savePassword);
router.get("/list-passwords", requireAuth, listPasswords);
router.get("/get-password/:id", requireAuth, getPasswordById);
router.put("/update-password/:id", requireAuth, updatePassword);
router.delete("/delete-password/:id", requireAuth, deletePassword);

export default router;
