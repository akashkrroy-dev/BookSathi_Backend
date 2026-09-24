import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import env from "./config/env.config.js"
import AuthRoute from "./modules/auth/auth.route.js"
import errorHandler from "./middlewares/errorHandler.js"
import { ApiErr } from "./utils/classes.js"

const app = express()
app.set("trust proxy", 1)

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())

app.get("/health", (_, res) => {
   res.type("text").send("ok")
})

app.use("/auth", AuthRoute)
app.use((_req, _res, next) => next(new ApiErr(404, "Route not found")))
app.use(errorHandler)

export default app