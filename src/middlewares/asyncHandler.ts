import { RequestHandler } from "express"
import { NextHandler } from "../types/handlers.js"

const asyncWrapper = (reqHandle: NextHandler): RequestHandler =>
  async (req, res, next) => {
    Promise.resolve(reqHandle(req, res, next)).catch(next)
  }

export default asyncWrapper
