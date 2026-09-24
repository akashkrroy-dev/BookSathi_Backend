import env from "../config/env.config.js"
import { createHmac } from "node:crypto"

const hashToken = (token: string): string => {
    return createHmac("sha256", env.HASH_SECRET)
        .update(token)
        .digest("hex")
}

export default hashToken