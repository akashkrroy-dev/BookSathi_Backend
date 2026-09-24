import bcrypt from "bcryptjs"

import type { SendOtpMailParams } from "../../../types/services.js"
import { sendMailOtp } from "../../../utils/sendMail.js"
import generateOtp from "../../../utils/generateOtp.js"
import OtpModel from "../../../models/otp.model.js"

const sendEmail = async (params: SendOtpMailParams) => {
    const { name, email, type } = params
    const otp = generateOtp()
    const hashOtp = await bcrypt.hash(otp, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await OtpModel.findOneAndUpdate(
        { email, purpose: type },
        { $set: { hashOtp, expiresAt, attempt: 0 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    const subjects = {
        v: "Verify your BookSathi email — OTP valid for 10 minutes",
        p: "Reset your BookSathi password — OTP valid for 10 minutes",
    }

    sendMailOtp({
        email,
        subject: subjects[type],
        name,
        otp
    }).catch((err) => console.error("mail fail", email, err))

    return { success: true }
}

export default sendEmail