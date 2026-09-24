import Account from "../../../models/account.model.js"
import { ApiErr } from "../../../utils/classes.js"
import type verifyGoogleToken from "./verifyGoogleToken.js"

type GoogleUser = Awaited<ReturnType<typeof verifyGoogleToken>>

const upsertGoogleAccount = async (googleUser: GoogleUser) => {
    let account = await Account.findOne({
        $or: [{ providerId: googleUser.providerId }, { email: googleUser.email }]
    })

    if (account) {
        if (account.loginDisabled || account.active === false) {
            throw new ApiErr(403, "Account disabled")
        }
        if (!account.providerId) account.providerId = googleUser.providerId
        if (!account.emailVerified) account.emailVerified = true
        if (!account.avatarUrl && googleUser.avatarUrl) {
            account.avatarUrl = googleUser.avatarUrl
        }
        await account.save()
        return account
    }

    return Account.create({
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        email: googleUser.email,
        emailVerified: true,
        provider: "google" as const,
        providerId: googleUser.providerId,
        ...(googleUser.avatarUrl ? { avatarUrl: googleUser.avatarUrl } : {}),
        role: "member" as const,
    })
}

export default upsertGoogleAccount
