import type { Types } from "mongoose"

export interface IUser {
    name: string
    phone: string
    status: "new" | "good" | "warning" | "blocked"
    noShowCount: number
    totalBookings: number
    totalNoShow: number
    lastSeenAt?: Date
}

export interface IWorkTime {
    start?: string
    end?: string
    weekOff: number[]
}

export interface IAccount {
    firstName: string
    lastName?: string
    email?: string
    emailVerified?: boolean
    phone?: string
    passwordHash?: string
    tokenVersion: number
    provider?: "local" | "google"
    providerId?: string
    avatarUrl?: string
    role: "owner" | "staff" | "superadmin" | "member"
    businessId?: Types.ObjectId | string | null
    bookable?: boolean
    loginDisabled?: boolean
    workTime?: IWorkTime
    salary?: number
    absentDates?: string[]
    canEditServices?: boolean
    active: boolean
}

export interface IOtpModel {
    email: string
    purpose: "v" | "p"
    hashOtp: string
    expiresAt: Date
    attempt: number
}

export interface ISession {
    accountId: Types.ObjectId | string
    location?: string
    lastTime?: Date
    refreshTokenHash: string
    previousRefreshTokenHash?: string | null
    previousTokenExpiresAt?: Date | null
    userAgent?: string
    ipAddres?: string
    expiresAt: Date
    revoked?: boolean
}