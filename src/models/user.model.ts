import mongoose from "mongoose";
import type { IUser } from "../types/models.interface.js";

// * MODEL NEED TO UPDATE VALIDATE OTP FOR REDUCE COST
// * WILL ADD NEW OTPMODEL COUNT OTP_RECORDE

const schema = new mongoose.Schema<IUser>({
   name: { type: String, required: true },
   phone: { type: String, required: true, unique: true },
   status: {
      type: String, default: "new",
      enum: ["new", "good", "warning", "blocked"]
   },
   noShowCount: { type: Number, default: 0 },
   totalBookings: { type: Number, default: 0 },
   totalNoShow: { type: Number, default: 0 },
   lastSeenAt: { type: Date },
   
}, { timestamps: true })

schema.index({
   status: 1
})

const User = mongoose.model<IUser>("User", schema)
export default User