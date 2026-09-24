import type { Response } from "express"
import env from "../config/env.config.js"

const isProd = env.NODE_ENV === "production"

export const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

const baseOpts = {
    httpOnly: true as const,
    secure: isProd,
    sameSite: "lax" as const,
}

export const setAuthCookies = (res: Response, refreshToken: string) => {
    res.cookie("refreshToken", refreshToken, { ...baseOpts, maxAge: REFRESH_COOKIE_MAX_AGE })
}

export const clearAuthCookies = (res: Response) => {
    res.clearCookie("refreshToken", { ...baseOpts })
}
