import bcrypt from "bcryptjs"

import type { RegisterInput } from "../auth.schema.js"
import { ApiErr } from "../../../utils/classes.js"
import Account from "../../../models/account.model.js"

const createAccount = async (data: RegisterInput) => {

    const { password, firstName, lastName, email, phone } = data

    const existingUser = await Account.findOne({ email })
    if (existingUser) {
        if (existingUser.emailVerified) {
            throw new ApiErr(400, "Account already created, try to login")
        }
        
        existingUser.firstName = firstName
        existingUser.lastName = lastName ?? ""
        if (phone !== undefined) {
            existingUser.phone = phone
        }
        if (password) {
            existingUser.passwordHash = await bcrypt.hash(password, 12)
        }
        await existingUser.save()
        const updated = existingUser.toObject()
        const { passwordHash, ...safe } = updated
        return { account: safe, updated: true as const }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const account = await Account.create({
        firstName,
        lastName,
        email,
        ...(phone !== undefined ? { phone } : {}),
        passwordHash,
        provider: "local" as const,
        role: "member" as const,
    });
    const created = account.toObject();
    delete (created as Partial<typeof created>).passwordHash;
    return { account: created, updated: false as const };
}

export default createAccount