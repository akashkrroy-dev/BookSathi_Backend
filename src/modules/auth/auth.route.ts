import express from "express"

import asyncWrapper from "../../middlewares/asyncHandler.js"
import validate from "../../middlewares/validation.js"
import verifyAccessToken from "../../middlewares/verifyAccessToken.js"
import {
    register,
    resendOtp,
    verifyOtp,
    googleLogin
} from "./controllers/singup.controller.js"

import {
    login,
    logout,
    logoutFromAllDevices,
    refreshAccessToken
} from "./controllers/session.controller.js"

import {
    requestPasswordReset,
    verifyPasswordReset
} from "./controllers/recovery.controller.js"

import {
    loginSchema,
    registerSchema,
    rendOtpSchema,
    resendOtpSchema,
    resetPasswordSchema,
    verifyOtpSchema,
    googleAuthSchema
} from "./auth.schema.js"

import {
    authLimiter,
    refreshLimiter,
    resendLimiter
} from "../../middlewares/rateLimit.js"

const router = express.Router()

router.post("/register", authLimiter, validate(registerSchema), asyncWrapper(register))
router.post("/google", authLimiter, validate(googleAuthSchema), asyncWrapper(googleLogin))
router.post("/verify-otp", authLimiter, validate(verifyOtpSchema), asyncWrapper(verifyOtp))
router.post("/resend-otp", resendLimiter, validate(resendOtpSchema), asyncWrapper(resendOtp))
router.post("/login", authLimiter, validate(loginSchema), asyncWrapper(login))
router.post("/refresh", refreshLimiter, asyncWrapper(refreshAccessToken))
router.post("/logout", verifyAccessToken, asyncWrapper(logout))
router.post("/logout-all", verifyAccessToken, asyncWrapper(logoutFromAllDevices))
router.post("/password/forgot", authLimiter, validate(rendOtpSchema), asyncWrapper(requestPasswordReset))
router.post("/password/reset", authLimiter, validate(resetPasswordSchema), asyncWrapper(verifyPasswordReset))

export default router