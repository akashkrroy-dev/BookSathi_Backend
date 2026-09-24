import mongoose from "mongoose"
import { IOtpModel } from "../types/models.interface.js"

const schema = new mongoose.Schema<IOtpModel>({
    email: { type: String, required: true },
    purpose: { type: String, enum: ["v", "p"], required: true },
    hashOtp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempt: { type: Number, default: 0 },

}, { timestamps: true })

schema.index({ email: 1, purpose: 1 }, { unique: true })

const OtpModel = mongoose.model<IOtpModel>("Otp", schema)
export default OtpModel