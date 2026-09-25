import { describe, expect, it } from "vitest"
import hashToken from "../../src/utils/hashToken.js"

describe("verifying hash token", () => {
    it("return 64-car hex", () => {
        expect(hashToken("abc")).toMatch(/^[a-f0-9]{64}$/)
    })

    it("is deterministic - same input sane output", () => {
        expect(hashToken("hello")).toBe(hashToken("hello"))
    })

    it("diffrent inout give diffrent outputs", () => {
        expect(hashToken("a")).not.toBe(hashToken("b"))
    })

    it("not return input as-is", () => {
        expect(hashToken("abc")).not.toBe("abc")
    })
})