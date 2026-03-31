import mongoose from "mongoose";
import conf from "../conf/config.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${conf.MONGODB_URI}`);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;
