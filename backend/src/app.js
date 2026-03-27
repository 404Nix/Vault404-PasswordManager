import express, { urlencoded } from "express";
import cors from "cors";
import conf from "./conf/config.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";

const app = express();

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

//routes
app.use("/api/auth", userRoute);

app.get("/", (_req, res) => {
    res.json({ message: "Hello from the backend!" });
});

export default app;
