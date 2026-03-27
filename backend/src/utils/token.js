import conf from "../conf/config.js";
import jwt from "jsonwebtoken";

const generateToken = (userId, expiresIn=conf.expiresIn) => {

    return jwt.sign({ id: userId }, conf.jwtSecret, {
        expiresIn,
    });
};

export default generateToken;
