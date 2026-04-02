import jwt from "jsonwebtoken";
import conf from "../conf/config.js";

const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access token is missing!" });
    }

    try {
        const decoded = jwt.verify(token, conf.jwtSecret);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res
                .status(401)
                .json({ message: "Token expired, please refresh!" });
        }
        return res.status(401).json({ message: "Invalid token!" });
    }
};

export default requireAuth;
