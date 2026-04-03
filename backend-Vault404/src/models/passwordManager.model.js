import mongoose from "mongoose";
import crypto from "crypto";
import { ALGORITHM } from "../constant.js";
import conf from "../conf/config.js";

function encryptPassword(password) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, conf.ENCRYPTION_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(password), cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}
function decryptPassword(password) {
    const [iv, encrypted] = password.split(":");
    const decipher = crypto.createDecipheriv(ALGORITHM, conf.ENCRYPTION_KEY, Buffer.from(iv, "hex"));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]);
    return decrypted.toString();
}

function calculateStrength(password) {
    const length = password.length;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (length < 8) return "weak";
    
    let typesCount = 0;
    if (hasUpperCase) typesCount++;
    if (hasLowerCase) typesCount++;
    if (hasNumbers) typesCount++;
    if (hasSymbols) typesCount++;

    if (length >= 12 && typesCount >= 3) return "strong";
    if (length >= 8 && typesCount >= 2) return "medium";
    
    return "weak";
}

const passwordManagerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
    },
    platformSlug: {
        type: String,
        required: [true, "Platform slug is required"],
    },
    platformName: {
        type: String,
        required: [true, "Platform name is required"],
    },
    username: {
        type: String,
        required: [true, "Username is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    strength: {
        type: String,
        enum: ["weak", "medium", "strong"],
        default: "medium",
    },
}, { timestamps: true });

passwordManagerSchema.pre("save", function () {
    if(this.isModified("password")) {
        // Calculate strength on the plain text password before encryption
        this.strength = calculateStrength(this.password);
        this.password = encryptPassword(this.password);
    }
})

passwordManagerSchema.methods.decryptPassword = function() {
    return decryptPassword(this.password);
}

export const PasswordManager = mongoose.model("PassManager", passwordManagerSchema);
