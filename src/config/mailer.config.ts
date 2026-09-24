import nodemailer from "nodemailer"
import env from "./env.config.js"

const transpoter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS
    }
})

export default transpoter