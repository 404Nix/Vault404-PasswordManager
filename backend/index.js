import "dotenv/config";
import app from "./src/app.js";
import conf from "./src/conf/config.js";
import connectDB from "./src/db/index.js";
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);


connectDB()
    .then(() => {
        app.on("error", (err) => {
            console.error("Server error:", err);
        });

        app.listen(conf.PORT, () => {
            console.log(`Server is running on port ${conf.PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to the database:", err);
        process.exit(1);
    });
