import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(8).max(64),
}).strict()


export const registerSchema = z.object({
    firstName: z.string().trim().min(2).max(25),
    lastName: z.string().trim().max(25).optional().default(""),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Invalid phone number").optional(),
    password: z.string().min(8).max(64),
}).strict()


export const verifyOtpSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    otp: z.string().length(6)
}).strict()

export const rendOtpSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
}).strict()

export const resendOtpSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    type: z.enum(["v", "p"]).optional().default("v"),
}).strict()

export const resetPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    otp: z.string().length(6),
    password: z.string().min(8).max(64),
}).strict()

export const googleAuthSchema = z.object({
    idToken: z.string().min(10)
}).strict()


export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type VerifiyOtpInput = z.infer<typeof verifyOtpSchema>
export type ResendOtpInput = z.infer<typeof rendOtpSchema>
export type ResendOtpBody = z.infer<typeof resendOtpSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>