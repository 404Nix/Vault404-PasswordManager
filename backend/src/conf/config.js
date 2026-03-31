const requiredKeys = {
    MONGODB_URI: process.env.MONGODB_URI,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    jwtSecret: process.env.jwtSecret,
    accessTokenExpiresIn: process.env.accessTokenExpiresIn,
    refreshTokenExpiresIn: process.env.refreshTokenExpiresIn,
};

for (const [key, value] of Object.entries(requiredKeys)) {
    if (!value) throw new Error(`Missing environment variable: ${key}`);
}

const conf = {
    MONGODB_URI: String(process.env.MONGODB_URI),
    PORT: Number(process.env.PORT) || 3000,
    CORS_ORIGIN: process.env.CORS_ORIGIN.split(","),
    ENCRYPTION_KEY: String(process.env.ENCRYPTION_KEY),
    jwtSecret: String(process.env.jwtSecret),
    accessTokenExpiresIn: String(process.env.accessTokenExpiresIn),
    refreshTokenExpiresIn: String(process.env.refreshTokenExpiresIn),
};

export default conf;
