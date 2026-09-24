import bcrypt from "bcryptjs"
import Account from "../../../models/account.model.js"
import OtpModel from "../../../models/otp.model.js"
import { ApiErr, ApiRes } from "../../../utils/classes.js"

const otpVerify = async (email: string, otp: string, purpose: "v" | "p") => {
    const otpFile = await OtpModel.findOne({ email, purpose })

    if (!otpFile) throw new ApiErr(400, "No OTP, resend")
    if (otpFile.expiresAt < new Date()) {
        await otpFile.deleteOne()
        throw new ApiErr(410, "Expired, resend")
    }
    if (otpFile.attempt >= 5) throw new ApiErr(429, "Too many tries")

    const isValid = await bcrypt.compare(otp, otpFile.hashOtp)
    if (!isValid) {
        otpFile.attempt += 1
        await otpFile.save({ validateBeforeSave: false })
        throw new ApiErr(401, "Invalid OTP")
    }

    const account = await Account.findOneAndUpdate({ email }, { emailVerified: true })
    if (!account) throw new ApiErr(404, "Account not found")
    await otpFile.deleteOne()

    return account
}

export default otpVerify