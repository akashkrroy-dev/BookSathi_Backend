import { describe, expect, it } from "vitest"
import generateOtp from "../../src/utils/generateOtp"

describe("Genrate Otp test", () => {
    it("return a 6 digit otp", () => {
        const otp = generateOtp()

        expect(otp).toHaveLength(6)
        expect(otp).toMatch(/^\d{6}$/)
        expect(Number(otp)).not.toBeNaN()

        for(let i = 0; i < 100; i++){
            expect(generateOtp()).toMatch(/^\d{6}$/)
        }
    })
})