import express, { urlencoded } from "express";
import cors from "cors";
import conf from "./conf/config.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import passwordManagerRoute from "./routes/passManager.route.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();

app.use(helmet());

app.use(urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));
app.use(
    cors({
        origin: conf.CORS_ORIGIN,
        credentials: true,
    }),
);
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(cookieParser());

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

// Security Middlewares

//routes
app.use("/api/auth", userRoute);
app.use("/api/password-manager", passwordManagerRoute);

app.get("/", (_req, res) => {
    res.json({ message: "Hello from the backend!" });
});

export default app;
