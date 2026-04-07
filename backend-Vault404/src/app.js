import express, { urlencoded } from "express";
import cors from "cors";
import conf from "./conf/config.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import passwordManagerRoute from "./routes/passManager.route.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "connect-src": ["'self'", "https://cdn.jsdelivr.net"],
                "img-src": ["'self'", "data:", "https://cdn.simpleicons.org"],
            },
        },
    }),
);

app.use(
    cors({
        origin: conf.CORS_ORIGIN,
        credentials: true,
    }),
);
app.use(cookieParser());
app.use(compression());

app.use((req, res, next) => {
    if (req.query) {
        const query = { ...req.query };
        Object.defineProperty(req, "query", {
            value: query,
            writable: true,
            configurable: true,
            enumerable: true,
        });
    }
    next();
});

app.use(mongoSanitize());
app.use(xss());

app.use(urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later!",
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many attempts, please try again later!",
});

app.use("/api/", limiter);
app.use("/api/auth", authLimiter);

//routes
app.use("/api/auth", userRoute);
app.use("/api/password-manager", passwordManagerRoute);

// app.get("/", (_req, res) => {
//     res.json({ message: "Hello from the backend!" });
// });

app.get("*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(`[Error] ${req.method} ${req.path}:`, err.message);

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
});

export default app;
