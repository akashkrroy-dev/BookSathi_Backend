import jwt from "jsonwebtoken"
import env from "../config/env.config.js"
import Account from "../models/account.model.js"
import { NextHandler } from "../types/handlers.js"
import { ApiErr } from "../utils/classes.js"
import { AccessTokenPayload } from "../types/services.js"

const verifyAccessToken: NextHandler = async(req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) throw new ApiErr(403, "No token provided")

    const [scheme, token] = authHeader.split(" ")
    if (scheme !== "Bearer" || !token) throw new ApiErr(403, "Invalid authorization header")

    let payload: AccessTokenPayload
    try {
        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET)
        if (
            typeof decoded === "string" ||
            typeof decoded.accountId !== "string" ||
            typeof decoded.version !== "number"
        ) {
            throw new ApiErr(403, "Invalid or expired token")
        }
        payload = decoded as AccessTokenPayload
    } catch (err) {
        if (err instanceof ApiErr) throw err
        throw new ApiErr(403, "Invalid or expired token")
    }

    const account = await Account.findById(payload.accountId)
    if (!account) throw new ApiErr(403, "Account not found")
    if (account.tokenVersion !== payload.version) {
        throw new ApiErr(403, "Access token expired")
    }
    if (account.loginDisabled || account.active === false) {
        throw new ApiErr(403, "Account disabled")
    }
    req.account = account
    next()
}

export default verifyAccessToken