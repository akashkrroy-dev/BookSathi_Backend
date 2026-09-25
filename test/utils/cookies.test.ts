import { describe, expect, it, vi } from "vitest"
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE_MAX_AGE } from "../../src/utils/cookies.js"

describe("setAuthCookies", () => {
    it("store refreshToken in cookies", () => {
        const res = { cookie: vi.fn(), clearCookie: vi.fn() } as any

        setAuthCookies(res, "tok123")

        expect(res.cookie).toHaveBeenCalledTimes(1)
        expect(res.cookie).toHaveBeenCalledWith(
            "refreshToken",
            "tok123",
            expect.objectContaining({
                httpOnly: true, sameSite: "lax"
            })
        )
    })

    describe("clearAuthCookies", () => {
        it("clears refreshToken cookie", () => {
            const res = { cookie: vi.fn(), clearCookie: vi.fn() } as any

            clearAuthCookies(res)

            expect(res.clearCookie).toHaveBeenCalledTimes(1)
            expect(res.clearCookie).toHaveBeenCalledWith(
                "refreshToken",
                expect.objectContaining({ httpOnly: true, sameSite: "lax" })
            )
        })
    })
})