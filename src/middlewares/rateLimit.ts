import rateLimit from "express-rate-limit"

const jsonMsg = (message: string) => ({ success: false, message, error: null })

export const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: jsonMsg("Too many attempts, try later")
})

export const resendLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: jsonMsg("Too many OTP requests, try later")
})

export const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: jsonMsg("Too many requests, try later")
})

export const readLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method !== "GET" && req.method !== "HEAD",
    message: jsonMsg("Too many requests")
})

export const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => ["GET","HEAD","OPTIONS"].includes(req.method),
    message: jsonMsg("Too many attempts, try later")
})