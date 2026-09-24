import env from "../config/env.config.js";
import transpoter from "../config/mailer.config.js";
import otpHtml from "../html/otpHtml.js";
import type { SendMailOtp } from "../types/services.js";

export const sendMailOtp = ({ email, subject, name, otp }: SendMailOtp) => {
    return transpoter.sendMail({
        from: env.EMAIL_USER,
        to: email,
        subject,
        html: otpHtml(name, otp)
    })
}
