import bcrypt from "bcryptjs"
import type { HydratedDocument } from "mongoose"
import type { IAccount } from "../../../types/models.interface.js"
import SessionModel from "../../../models/session.model.js"

const updatePassword = async(account:HydratedDocument<IAccount>, password:string) => {
    const passwordHash = await bcrypt.hash(password, 12)
    account.passwordHash = passwordHash
    account.tokenVersion += 1
    const [_, sessions] = await Promise.all([
        account.save(),
        SessionModel.updateMany(
            { accountId: account._id, revoked: false },
            { $set: { revoked: true }}
        )
    ])

    return true
}

export default updatePassword