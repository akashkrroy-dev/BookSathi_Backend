import { beforeAll, afterEach, afterAll, describe, expect, it, vi } from "vitest"
import request from "supertest"

vi.mock("../../../src/middlewares/rateLimit.js", () => ({
  authLimiter: (_req: any, _res: any, next: any) => next(),
  resendLimiter: (_req: any, _res: any, next: any) => next(),
  refreshLimiter: (_req: any, _res: any, next: any) => next(),
}))

vi.mock("../../../src/config/mailer.config.js", () => ({
  default: { sendMail: vi.fn().mockResolvedValue(true) },
}))

vi.mock("../../../src/utils/generateOtp.js", () => ({
  default: () => "123456",
}))

vi.mock("../../../src/modules/auth/services/verifyGoogleToken.js", () => ({
  default: async () => ({
    providerId: "g123",
    email: "g@test.com",
    firstName: "G",
    lastName: "User",
    avatarUrl: undefined,
  }),
}))

import app from "../../../src/app.js"
import Account from "../../../src/models/account.model.js"
import { startTestDB, clearTestDB, stopTestDB } from "../../helpers/db.js"
import bcrypt from "bcryptjs"

beforeAll(async () => {
  await startTestDB()
})

afterEach(async () => {
  await clearTestDB()
})

afterAll(async () => {
  await stopTestDB()
})

const validBody = {
  firstName: "Akash",
  lastName: "Roy",
  email: "reg@test.com",
  password: "password123",
}

describe("POST /auth/register", () => {
  it("400 on bad email", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validBody, email: "bad" })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ success: false, message: "Validation Failed" })
  })

  it("400 on short password", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validBody, password: "short" })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it("201 new account + no passwordHash leak", async () => {
    const res = await request(app).post("/auth/register").send(validBody)

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      success: true,
      message: "Registered, please verify OTP",
    })
    expect(res.body.data.email).toBe("reg@test.com")
    expect(res.body.data.passwordHash).toBeUndefined()
  })

  it("200 re-register unverified updates details", async () => {
    await request(app).post("/auth/register").send(validBody)

    const res = await request(app)
      .post("/auth/register")
      .send({ ...validBody, firstName: "Updated" })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe("Details updated, please verify OTP")
    expect(res.body.data.firstName).toBe("Updated")
  })

  it("400 when already verified", async () => {
    await request(app).post("/auth/register").send(validBody)
    await Account.updateOne({ email: "reg@test.com" }, { emailVerified: true })

    const res = await request(app).post("/auth/register").send(validBody)

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({
      success: false,
      message: "Account already created, try to login",
    })
  })
})


describe("POST /auth/login", () => {

  async function seedVerifiedUser(email = "login@test.com", password = "password123", extra = {}) {
    const passwordHash = await bcrypt.hash(password, 4)

    return Account.create({
      firstName: "Log", email, emailVerified: true, passwordHash, provider: "local", role: "member",
      ...extra,
    })
  }

  it("400 on bad email", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "bad", password: "password123" })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ success: false, message: "Validation Failed" })
  })

  it("400 on short password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@test.com", password: "short" })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it("400 unknown email", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@test.com", password: "password123" })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ success: false, message: "Invalid Credentials" })
  })

  it("400 unverified account", async () => {
    await request(app).post("/auth/register").send(validBody)

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "reg@test.com", password: "password123" })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Invalid Credentials")
  })

  it("400 wrong password", async () => {
    await seedVerifiedUser()

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@test.com", password: "wrongpass123" })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Invalid Credentials")
  })

  it("403 disabled account", async () => {
    await seedVerifiedUser("login@test.com", "password123", { loginDisabled: true })

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@test.com", password: "password123" })

    expect(res.status).toBe(403)
    expect(res.body.message).toBe("Account disabled")
  })

  it("200 login success + cookie + accessToken", async () => {
    await seedVerifiedUser()
    const res = await (request(app).post("/auth/login")).send({
      email: "login@test.com", password: "password123"
    })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, message: "Login successful" })
    expect(typeof res.body.data).toBe("string")
    expect(res.body.data.passwordHash).toBeUndefined()
    const cookies = res.headers["set-cookie"] as unknown as string[]
    expect(cookies.join(";")).toContain("refreshToken=")
  })
})

describe("POST /auth/verify-otp", () => {
  it("400 on bad email", async () => {
    const res = await request(app)
      .post("/auth/verify-otp")
      .send({ email: "bad", otp: "123456" })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ success: false, message: "Validation Failed" })
  })

  it("400 on short otp", async () => {
    const res = await request(app)
      .post("/auth/verify-otp")
      .send({ email: "reg@test.com", otp: "12" })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it("400 no OTP yet", async () => {
    const res = await request(app)
      .post("/auth/verify-otp")
      .send({ email: "nobody@test.com", otp: "123456" })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ success: false, message: "No OTP, resend" })
  })

  it("401 wrong OTP", async () => {
    await request(app).post("/auth/register").send(validBody)

    const res = await request(app)
      .post("/auth/verify-otp")
      .send({ email: "reg@test.com", otp: "000000" })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe("Invalid OTP")
  })

  it("200 correct OTP verifies + cookie + accessToken", async () => {
    await request(app).post("/auth/register").send(validBody)

    const res = await request(app)
      .post("/auth/verify-otp")
      .send({ email: "reg@test.com", otp: "123456" })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, message: "Email verified!" })
    expect(typeof res.body.data).toBe("string")
    const cookies = res.headers["set-cookie"] as unknown as string[]
    expect(cookies.join(";")).toContain("refreshToken=")

    const account = await Account.findOne({ email: "reg@test.com" })
    expect(account?.emailVerified).toBe(true)
  })
})

describe("POST /auth/resend-otp + POST /auth/google", () => {
  it("400 resend unknown email", async () => {
    const res = await request(app)
      .post("/auth/resend-otp")
      .send({ email: "nobody@test.com" })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ success: false, message: "Account not found!" })
  })

  it("200 resend-otp success", async () => {
    await request(app).post("/auth/register").send(validBody)

    const res = await request(app)
      .post("/auth/resend-otp")
      .send({ email: "reg@test.com", type: "v" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("400 google short idToken", async () => {
    const res = await request(app)
      .post("/auth/google")
      .send({ idToken: "short" })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it("200 google login success + cookie", async () => {
    const res = await request(app)
      .post("/auth/google")
      .send({ idToken: "valid-google-token-12345" })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, message: "Google login successful" })
    expect(typeof res.body.data).toBe("string")
    const cookies = res.headers["set-cookie"] as unknown as string[]
    expect(cookies.join(";")).toContain("refreshToken=")

    const account = await Account.findOne({ email: "g@test.com" })
    expect(account?.provider).toBe("google")
    expect(account?.emailVerified).toBe(true)
  })
})

describe("POST /auth/refresh + logout", () => {
  const getCookie = (res: any) =>
    ((res.headers["set-cookie"] as unknown as string[]).find((c) => c.startsWith("refreshToken="))?.split(";")[0] ?? "")

  async function loginHelper(email = "sess@test.com", password = "password123") {
    const passwordHash = await bcrypt.hash(password, 4)
    await Account.create({ firstName: "Sess", email, emailVerified: true, passwordHash, provider: "local", role: "member" })
    const login = await request(app).post("/auth/login").send({ email, password })
    return { accessToken: login.body.data as string, cookie: getCookie(login) }
  }

  it("403 refresh with no cookie", async () => {
    const res = await request(app).post("/auth/refresh")

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it("200 refresh rotates cookie + token", async () => {
    const { cookie } = await loginHelper()

    const res = await request(app).post("/auth/refresh").set("Cookie", cookie)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, message: "Token refreshed" })
    expect(typeof res.body.data).toBe("string")
    expect(getCookie(res)).toContain("refreshToken=")
  })

  it("403 logout with no token", async () => {
    const res = await request(app).post("/auth/logout")

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it("200 logout success", async () => {
    const { accessToken, cookie } = await loginHelper()

    const res = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", cookie)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe("Logout successful")
  })

  it("200 logout-all invalidates old accessToken", async () => {
    const { accessToken, cookie } = await loginHelper()

    const out = await request(app)
      .post("/auth/logout-all")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", cookie)

    expect(out.status).toBe(200)
    expect(out.body.message).toBe("Logged out from all devices successfully")

    const stale = await request(app)
      .post("/auth/logout-all")
      .set("Authorization", `Bearer ${accessToken}`)

    expect(stale.status).toBe(403)
    expect(stale.body.message).toBe("Access token expired")
  })
})

describe("POST /auth/password/forgot + reset", () => {
  async function seedVerified(email = "reset@test.com", password = "password123") {
    const passwordHash = await bcrypt.hash(password, 4)
    return Account.create({ firstName: "Re", email, emailVerified: true, passwordHash, provider: "local", role: "member" })
  }

  it("200 forgot unknown email (enumeration-safe)", async () => {
    const res = await request(app)
      .post("/auth/password/forgot")
      .send({ email: "nobody@test.com" })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, message: "If account exists, OTP sent" })
  })

  it("200 forgot sends OTP type p", async () => {
    await seedVerified()

    const res = await request(app)
      .post("/auth/password/forgot")
      .send({ email: "reset@test.com" })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, message: "OTP sent" })
  })

  it("400 reset short otp", async () => {
    const res = await request(app)
      .post("/auth/password/reset")
      .send({ email: "reset@test.com", otp: "12", password: "newpassword123" })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it("401 reset wrong OTP", async () => {
    await seedVerified()
    await request(app).post("/auth/password/forgot").send({ email: "reset@test.com" })

    const res = await request(app)
      .post("/auth/password/reset")
      .send({ email: "reset@test.com", otp: "000000", password: "newpassword123" })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe("Invalid OTP")
  })

  it("200 reset success + login with new password", async () => {
    await seedVerified()
    await request(app).post("/auth/password/forgot").send({ email: "reset@test.com" })

    const reset = await request(app)
      .post("/auth/password/reset")
      .send({ email: "reset@test.com", otp: "123456", password: "newpassword123" })

    expect(reset.status).toBe(200)
    expect(reset.body.message).toBe("Password Updated")

    const login = await request(app)
      .post("/auth/login")
      .send({ email: "reset@test.com", password: "newpassword123" })

    expect(login.status).toBe(200)
    expect(login.body.message).toBe("Login successful")
  })
})