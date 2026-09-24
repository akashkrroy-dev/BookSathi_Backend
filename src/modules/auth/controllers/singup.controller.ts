// register, verifyOtp, resend Otp
import { createLoginSession } from "../services/session.js"
import { NextHandler } from "../../../types/handlers.js"
import { ApiErr, ApiRes } from "../../../utils/classes.js"
import createAccount from "../services/createAccount.js"
import otpVerify from "../services/otpVerify.js"
import sendEmail from "../services/sendEmail.js"
import createToken from "../services/createToken.js"
import { setAuthCookies } from "../../../utils/cookies.js"
import Account from "../../../models/account.model.js"
import verifyGoogleToken from "../services/verifyGoogleToken.js"
import upsertGoogleAccount from "../services/upsertGoogleAccount.js"

export const register: NextHandler = async (req, res) => {

   const { account, updated } = await createAccount(req.body)
   await sendEmail({
      name: `${account.firstName} ${account.lastName ?? ""}`.trim(),
      email: req.body.email,
      type: "v"
   })

   return res.status(updated ? 200 : 201).json(
      new ApiRes(updated ? 200 : 201, updated ? "Details updated, please verify OTP" : "Registered, please verify OTP", account)
   )
}

export const verifyOtp: NextHandler = async (req, res) => {

   const { email, otp } = req.body
   const account = await otpVerify(email, otp, "v")
   const { accessToken, refreshToken } = createToken(account._id.toString(), account.tokenVersion)
   await createLoginSession(
      account._id.toString(),
      refreshToken,
      {
         ...(req.ip ? { ipAddress: req.ip } : {}),
         ...(req.get("User-Agent") ? { userAgent: req.get("User-Agent") as string } : {}),
      }
   )
   setAuthCookies(res, refreshToken)
   return res.status(200).json(new ApiRes(200, "Email verified!", accessToken))
}

export const resendOtp: NextHandler = async (req, res) => {

   const { email, type = "v" } = req.body
   const account = await Account.findOne({ email })
   if (!account) { throw new ApiErr(400, "Account not found!") }

   await sendEmail({
      name: `${account.firstName} ${account.lastName ?? ""}`.trim(),
      email: req.body.email,
      type
   })

   return res.status(200).json(new ApiRes(200, "Details updated, please verify OTP", null))
}

export const googleLogin: NextHandler = async (req, res) => {
   const { idToken } = req.body
   if (!idToken) throw new ApiErr(400, "Google token required")

   const googleUser = await verifyGoogleToken(idToken)
   const account = await upsertGoogleAccount(googleUser)

   const { accessToken, refreshToken } = createToken(account._id.toString(), account.tokenVersion)
   await createLoginSession(
      account._id.toString(),
      refreshToken,
      {
         ...(req.ip ? { ipAddress: req.ip } : {}),
         ...(req.get("User-Agent") ? { userAgent: req.get("User-Agent") as string } : {}),
      }
   )
   setAuthCookies(res, refreshToken)
   return res.status(200).json(new ApiRes(200, "Google login successful", accessToken))
}