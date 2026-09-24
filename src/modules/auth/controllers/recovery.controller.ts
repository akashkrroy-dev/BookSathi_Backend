import { NextHandler } from "../../../types/handlers.js"
import Account from "../../../models/account.model.js"
import { ApiErr, ApiRes } from "../../../utils/classes.js"
import sendEmail from "../services/sendEmail.js"
import otpVerify from "../services/otpVerify.js"
import updatePassword from "../services/updatePassword.js"
import { clearAuthCookies } from "../../../utils/cookies.js"

export const requestPasswordReset: NextHandler = async (req, res) => {
   const { email } = req.body
   const account = await Account.findOne({ email, emailVerified: true })
   if (!account || !account.emailVerified === true) return res.status(200).json(new ApiRes(200, "If account exists, OTP sent", null))
   if(account.provider === "google") return res.status(200).json(new ApiRes(200, "Try to Login by google", null))

   await sendEmail({
      name: `${account.firstName} ${account.lastName ?? ""}`.trim(),
      email: req.body.email,
      type: "p"
   })

   return res.status(200).json(new ApiRes(200, "OTP sent", null))
}

export const verifyPasswordReset: NextHandler = async (req, res) => {
   const { email, otp, password } = req.body
   const account = await otpVerify(email, otp, "p")
   if(!account) throw new ApiErr(400, "Invalid Otp")
   
   await updatePassword(account, password)
   clearAuthCookies(res)
   return res.status(200).json(new ApiRes(200, "Password Updated", null))
}