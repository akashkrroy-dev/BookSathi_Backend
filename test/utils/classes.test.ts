import { describe, expect, it } from "vitest"
import { ApiRes, ApiErr } from "../../src/utils/classes.js"

describe("Api Res", () => {
    it("returns sucess:true for 200", () =>{
        const res = new ApiRes(200, "ok", { id: 1 })

        expect(res.statusCode).toBe(200)
        expect(res.success).toBe(true)
        expect(res).toMatchObject({
            message: "ok", data: { id: 1 }
        })
    })

    it("returns sucess:false for 400+", () => {
        const res = new ApiRes(400, "not ok", null)

        expect(res.statusCode).toBe(400)
        expect(res.success).toBe(false)
    })

    it("returns defult when no arges", () => {
        const res = new ApiRes()

        expect(res.statusCode).toBe(200)
        expect(res.message).toBe("Success")
        expect(res.data).toBeNull()
    })
})

describe("Api Err", () => {
    it("return sucess:false for 500", () => {
        const res = new ApiErr(500, "Error at This Route", null)

        expect(res.statusCode).toBe(500)
        expect(res.message).toBe("Error at This Route")
        expect(res.error).toBeNull()
    })

    it("return defult when no arges", () => {
        const res = new ApiErr()

        expect(res.statusCode).toBe(500)
        expect(res.message).toBe("Something Went Wrong")
        expect(res.success).toBe(false)
    })
})