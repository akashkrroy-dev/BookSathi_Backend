// logout, logout from all, refreshAccessToken, login
import { NextHandler } from "../../../types/handlers.js"
import verifyPassword from "../services/verifyPassword.js"
import createToken from "../services/createToken.js"
import { createLoginSession, verifyRefreshSession, rotateRefreshSession } from "../services/session.js"
import { setAuthCookies } from "../../../utils/cookies.js"
import { ApiErr, ApiRes } from "../../../utils/classes.js"
import SessionModel from "../../../models/session.model.js"
import Account from "../../../models/account.model.js"
import hashToken from "../../../utils/hashToken.js"
import { clearAuthCookies } from "../../../utils/cookies.js"

export const login: NextHandler = async (req, res) => {
   const { email, password } = req.body

   const account = await verifyPassword(email, password)
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
   return res.status(200).json(new ApiRes(200, "Login successful", accessToken))
}

export const logout: NextHandler = async (req, res) => {
   const account = req.account
   if (!account) throw new ApiErr(401, "Not authenticated")
   const refreshToken = req.cookies.refreshToken
   if (!refreshToken) throw new ApiErr(401, "Refresh token not found")
   const tokenHash = hashToken(refreshToken)

   const session = await SessionModel.findOneAndUpdate(
      { accountId: account?._id, refreshTokenHash: tokenHash },
      { revoked: true }
   )
   if (!session) throw new ApiErr(404, "Session not found")
   clearAuthCookies(res)
   return res.status(200).json(new ApiRes(200, "Logout successful", null))
}

export const logoutFromAllDevices: NextHandler = async (req, res) => {
   const account = req.account
   if (!account) throw new ApiErr(401, "Not authenticated")

   await Promise.all([
      SessionModel.updateMany(
         { accountId: account._id, revoked: false },
         { revoked: true }
      ),
      Account.updateOne(
         { _id: account._id },
         { $inc: { tokenVersion: 1 } }
      )
   ])

   clearAuthCookies(res)
   return res.status(200).json(new ApiRes(200, "Logged out from all devices successfully", null))
}

export const refreshAccessToken: NextHandler = async (req, res) => {

   const refToken = req.cookies.refreshToken
   if (!refToken) throw new ApiErr(403, "Invalid refresh token")

   const { account, session } = await verifyRefreshSession(refToken)
   if (!session) {
      const tokenHash = hashToken(refToken)
      const reused = await SessionModel.findOne({
         accountId: account._id,
         previousRefreshTokenHash: tokenHash,
      })

      if (
         reused &&
         !reused.revoked &&
         reused.previousTokenExpiresAt &&
         reused.previousTokenExpiresAt > new Date()
      ) {
         const { accessToken, refreshToken } = createToken(account._id.toString(), account.tokenVersion)
         await rotateRefreshSession(reused, refreshToken)
         setAuthCookies(res, refreshToken)
         return res.status(200).json(new ApiRes(200, "Token refreshed", accessToken))
      }

      if (reused && !reused.revoked) {
         await Promise.all([
            SessionModel.updateMany(
               { accountId: account._id, revoked: false },
               { revoked: true },
            ),
            Account.updateOne(
               { _id: account._id },
               { $inc: { tokenVersion: 1 } },
            )
         ])
         clearAuthCookies(res)
         throw new ApiErr(403, "Session reused")
      }
      throw new ApiErr(403, "Session not found")
   }
   const { accessToken, refreshToken } = createToken(account._id.toString(), account.tokenVersion)
   await rotateRefreshSession(session, refreshToken)
   setAuthCookies(res, refreshToken)

   return res.status(200).json(new ApiRes(200, "Token refreshed", accessToken))
}