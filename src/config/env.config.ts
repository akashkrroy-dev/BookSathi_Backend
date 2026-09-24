import dotenv from "dotenv"
dotenv.config()

if (!process.env.PORT) { throw new Error("PORT required") }
if (!process.env.NODE_ENV){ throw new Error("NODE_ENV required")}
if (!process.env.NAME) { throw new Error("NAME required") }
if (!process.env.MONGO_URI) { throw new Error("URL required") }
if (!process.env.EMAIL_USER) { throw new Error("EMAIL_USER required") }
if (!process.env.EMAIL_PASS) { throw new Error("EMAIL_PASS required") }
if(!process.env.ACCESS_TOKEN_SECRET){ throw new Error("ACCESS_TOKEN_SECRET required")}
if(!process.env.REFRESH_TOKEN_SECRET){ throw new Error("REFRESH_TOKEN_SECRET required")}
if(!process.env.HASH_SECRET){ throw new Error("HASH_SECRET required")}
if(!process.env.CLIENT_URL){ throw new Error("CLIENT_URL required")}
if(!process.env.GOOGLE_CLIENT_ID){ throw new Error("GOOGLE_CLIENT_ID required")}

const env = {
    PORT: process.env.PORT || 3000,
    NAME: process.env.NAME,
    NODE_ENV: process.env.NODE_ENV,
    URI: process.env.MONGO_URI,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    HASH_SECRET: process.env.HASH_SECRET,
    CLIENT_URL: process.env.CLIENT_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
}

export default env