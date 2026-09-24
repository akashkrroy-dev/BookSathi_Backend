import type { NextFunction, Request, Response } from "express"
import { ApiErr } from "../utils/classes.js"

const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ApiErr) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: err.error ?? null
        })
    }

    if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: unknown }).code === 11000) {
        return res.status(409).json({ success: false, message: "Already exists", error: null })
    }

    console.error(err)
    return res.status(500).json({
        success: false,
        message: "Something went wrong",
        error: null
    })
}

export default errorHandler