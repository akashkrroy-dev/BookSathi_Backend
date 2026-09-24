import mongoose from "mongoose"
import type { ISession } from "../types/models.interface.js"

const schema = new mongoose.Schema<ISession>({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        index: true,
    },
    location: { type: String },
    lastTime: { type: Date },
    ipAddres: { type: String },
    userAgent: { type: String },

    refreshTokenHash: { type: String, required: true },
    previousRefreshTokenHash: { type: String, default: null },
    previousTokenExpiresAt: { type: Date, default: null },
    
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
}, { timestamps: true })

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
schema.index({ refreshTokenHash: 1 })

const SessionModel = mongoose.model<ISession>("Session", schema)
export default SessionModel
