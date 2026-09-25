// Runs before all tests (see vitest.config.ts -> setupFiles).
// Sets dummy env vars so src/config/env.config.ts does not throw.
// Real secrets stay in .env — never put them here.

process.env.PORT ??= "3000"
process.env.NODE_ENV ??= "test"
process.env.NAME ??= "booksathi-test"
process.env.MONGO_URI ??= "mongodb://127.0.0.1:27017/booksathi-test"
process.env.EMAIL_USER ??= "test@test.com"
process.env.EMAIL_PASS ??= "testpass"
process.env.ACCESS_TOKEN_SECRET ??= "test-access-secret-32chars-minimum"
process.env.REFRESH_TOKEN_SECRET ??= "test-refresh-secret-32chars-minimum"
process.env.HASH_SECRET ??= "test-hash-secret"
process.env.CLIENT_URL ??= "http://localhost:5173"
process.env.GOOGLE_CLIENT_ID ??= "test-google-client-id"
