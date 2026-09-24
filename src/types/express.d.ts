import type { HydratedDocument } from "mongoose"
import type { IAccount } from "./models.interface.js"

declare global {
    namespace Express {
        interface Request {
            account?: HydratedDocument<IAccount>
        }
    }
}

export {}
