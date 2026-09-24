import { OAuth2Client } from "google-auth-library"
import env from "../../../config/env.config.js"
import { ApiErr } from "../../../utils/classes.js"

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID)

const verifyGoogleToken = async (idToken: string) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID
    }).catch(() => { throw new ApiErr(401, "Invalid Google Token") })

    const p = ticket.getPayload()
    if (!p?.email || !p?.sub) throw new ApiErr(401, "Invalid Google token")
    if (p.email_verified === false) throw new ApiErr(400, "Google email not verified")

    return {
        providerId: p.sub,
        email: p.email.toLowerCase(),
        firstName: p.given_name ?? "User",
        lastName: p.family_name ?? "",
        avatarUrl: p.picture
    }
}

export default verifyGoogleToken