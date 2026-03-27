import jwt from "jsonwebtoken";
import conf from "../conf/config.js";

const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, conf.jwtSecret);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};

export default requireAuth;
