import jwt from "jsonwebtoken"
import env from "../../../config/env.config.js"

const createToken = (id:string, v:number) => {
    const accessToken = jwt.sign({
        accountId: id,
        version: v
    }, env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })

    const refreshToken = jwt.sign({
        accountId: id,
        version: v
    }, env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    })

    return { accessToken, refreshToken }
}

export default createToken