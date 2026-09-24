import jwt from "jsonwebtoken"
import type { HydratedDocument } from "mongoose"
import type { AccessTokenPayload } from "../../../types/services.js"
import type { ISession } from "../../../types/models.interface.js"
import env from "../../../config/env.config.js"
import { ApiErr } from "../../../utils/classes.js"
import Account from "../../../models/account.model.js"
import SessionModel from "../../../models/session.model.js"
import hashToken from "../../../utils/hashToken.js"

export interface SessionMeta {
    ipAddress?: string
    userAgent?: string
}

export const createLoginSession = async (accountId: string, refreshToken: string, meta: SessionMeta = {}) => {
    const refreshTokenHash = hashToken(refreshToken)
    const lastTime = new Date()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)

    const session = await SessionModel.create({
        accountId,
        lastTime,
        ...(meta.ipAddress ? { ipAddres: meta.ipAddress } : {}),
        ...(meta.userAgent ? { userAgent: meta.userAgent } : {}),
        refreshTokenHash,
        expiresAt
    })

    return session._id
}

export const verifyRefreshSession = async (refToken: string) => {
    let payload: AccessTokenPayload
    try {
        const decoded = jwt.verify(refToken, env.REFRESH_TOKEN_SECRET)
        if (
            typeof decoded === "string" ||
            typeof decoded.accountId !== "string" ||
            typeof decoded.version !== "number"
        ) throw new ApiErr(403, "Invalid token payload")
        payload = decoded as AccessTokenPayload
    } catch (error) {
        if (error instanceof ApiErr) throw error
        if (error instanceof jwt.TokenExpiredError) throw new ApiErr(403, "Refresh token expired")
        throw new ApiErr(403, "Invalid refresh token")
    }

    const refreshTokenHash = hashToken(refToken)
    const [account, session] = await Promise.all([
        Account.findById(payload.accountId),
        SessionModel.findOne({ accountId: payload.accountId, refreshTokenHash, revoked: false, expiresAt: { $gt: new Date() } })
    ])

    if (!account) throw new ApiErr(403, "Account not found")
    if (account.tokenVersion !== payload.version) throw new ApiErr(403, "Token version mismatch")
    if (session) {
        if (session.revoked) throw new ApiErr(403, "Session revoked")
        if (session.expiresAt < new Date()) throw new ApiErr(403, "Session expired")
    }

    return { account, session }
}

export const rotateRefreshSession = async (session: HydratedDocument<ISession>, refreshToken: string) => {
    const previousRefreshTokenHash = session.refreshTokenHash
    const previousTokenExpiresAt = new Date(Date.now() + 30 * 1000)
    const refreshTokenHash = hashToken(refreshToken)
    await session.updateOne({
        $set: {
            previousRefreshTokenHash,
            previousTokenExpiresAt,
            refreshTokenHash,
            lastTime: new Date(),
        },
    })

    return true
}
