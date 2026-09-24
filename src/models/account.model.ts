import mongoose from "mongoose"
import type { IAccount } from "../types/models.interface.js"

const schema = new mongoose.Schema<IAccount>({
   firstName: { type: String, required: true, trim: true },
   lastName: { type: String, default: "", trim: true },
   email: {
      type: String, unique: true, sparse: true,
      lowercase: true, trim: true
   },
   emailVerified: { type: Boolean, default: false },
   phone: { type: String, trim: true },
   passwordHash: { type: String },
   tokenVersion: { type: Number, default: 0 },

   provider: {
      type: String, enum: ["local", "google"],
      default: "local", index: true
   },
   providerId: { type: String, sparse: true },
   avatarUrl: { type: String },

   role: {
      type: String, required: true,
      enum: ["owner", "staff", "superadmin", "member"],
      default: "member",
      index: true
   },
   businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null, index: true
   },
   bookable: { type: Boolean, default: false },
   loginDisabled: { type: Boolean, default: false },
   workTime: {
      start: { type: String },
      end: { type: String },
      weekOff: { type: [Number], default: [] }
   },
   salary: { type: Number },
   absentDates: { type: [String], default: [] },
   canEditServices: { type: Boolean, default: false },
   active: { type: Boolean, default: true },
}, { timestamps: true })

schema.index({ businessId: 1, role: 1 })
schema.index({ businessId: 1, active: 1 })
schema.index({ provider: 1, providerId: 1 }, { unique: true, sparse: true })

const Account = mongoose.model<IAccount>("Account", schema)
export default Account