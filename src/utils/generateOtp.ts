import crypto from "node:crypto"

const generateOtp = (): string => String(crypto.randomInt(0, 1000000)).padStart(6, "0")
export default generateOtp