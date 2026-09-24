import express from "express"
import { createServer } from "node:http"
import app from "./app.js";
import env from "./config/env.config.js"
import connectDB, { connection } from "./config/database.config.js"

const server = createServer(app)

async function startServer() {
   try {
      await connectDB()
      server.listen(env.PORT, () => {
         console.log(`Server is Runing on port: ${env.PORT}`)
      })

      const shutdown = async (signal: string) => {
         console.log(`${signal} received, shutting down gracefully`)
         server.close(async () => {
            await connection.close()
            process.exit(0)
         })

         setTimeout(() => process.exit(1), 10000).unref()
      }
      process.on("SIGINT", () => shutdown("SIGINT"));
      process.on("SIGTERM", () => shutdown("SIGTERM"));
   } catch (error) {
      console.error("Failed to start server:", error)
      process.exit(1)
   }
}

startServer()