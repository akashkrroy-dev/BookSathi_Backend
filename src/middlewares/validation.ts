import type { ZodType } from "zod"
import type { NextHandler } from "../types/handlers.js"
import { ApiErr } from "../utils/classes.js"

const validate = (
    schema: ZodType<unknown, any>,
    source: "body" | "query" | "params" = "body"
): NextHandler => (req, res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
        return next(new ApiErr(400, "Validation Failed", result.error.flatten()))
    }

    req[source] = result.data
    next()
}

export default validate