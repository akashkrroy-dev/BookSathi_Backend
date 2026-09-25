import { describe, expect, it } from "vitest"
import jwt from "jsonwebtoken"
import createToken from "../../../src/modules/auth/services/createToken.js"

describe("create token", () => {
    it("return access + refreshToken", () => {

        const { accessToken, refreshToken } = createToken("abc", 1)
        expect(typeof accessToken).toBe("string")
        expect(typeof refreshToken).toBe("string")

        expect(accessToken).not.toBe(refreshToken)

        const decoded: any = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!)
        expect(decoded).toMatchObject({
            accountId: "abc", version: 1
        })
    })
})