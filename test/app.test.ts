import { describe, expect, it } from "vitest"
import request from "supertest"

import app from "../src/app.js"

describe("GET /health", () => {
  it("returns 200 + ok", async () => {
    const res = await request(app).get("/health")

    expect(res.status).toBe(200)
    expect(res.text).toBe("ok")
  })

  it("returns 404 for unknown route", async () => {
    const res = await request(app).get("/binbinbanban")

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ success: false, message: "Route not found" })
  })

  it("sets helmet security headers + hides x-powered-by", async () => {
    const res = await request(app).get("/health")

    expect(res.headers["x-dns-prefetch-control"]).toBe("off")
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN")
    expect(res.headers["x-powered-by"]).toBeUndefined()
  })

  it("413 on oversized JSON payload", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ firstName: "A".repeat(11 * 1024), lastName: "", email: "big@test.com", password: "password123" })

    expect(res.status).toBe(413)
    expect(res.body).toMatchObject({ success: false, message: "Payload too large" })
  })
})
