import bcrypt from "bcryptjs"
import Account from "../../../models/account.model.js"
import { ApiErr } from "../../../utils/classes.js"

const verifyPassword = async (email: string, password: string) => {
    const account = await Account.findOne({ email, emailVerified: true })
    if (!account) throw new ApiErr(400, "Invalid Credentials")

    if (account.loginDisabled || account.active === false) {
        throw new ApiErr(403, "Account disabled")
    }

    if (typeof account.passwordHash !== "string" || account.passwordHash.length === 0) {
        throw new ApiErr(400, "Invalid Credentials")
    }

    const isValid = await bcrypt.compare(password, account.passwordHash)
    if (!isValid) throw new ApiErr(400, "Invalid Credentials")

    return account
}

export default verifyPassword