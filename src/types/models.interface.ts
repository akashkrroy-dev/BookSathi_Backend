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

export type BusinessType = "salon" | "clinic" | "tutor" | "gym_floor" | "trainer" | "agency"

// day block, keyed by weekday so calc is direct lookup
export interface IStoreDay {
    active: boolean
    start?: string
    end?: string
    breaks?: { start: string; end: string }[]
}

export interface IStoreWorktime {
    monday?: IStoreDay
    tuesday?: IStoreDay
    wednesday?: IStoreDay
    thursday?: IStoreDay
    friday?: IStoreDay
    saturday?: IStoreDay
    sunday?: IStoreDay
}

// all styles in one place
export interface IStoreStyle {
    color?: string
    theme?: string
    logoUrl?: string
}

// fixed hero, can't be removed
export interface IStoreHero {
    title?: string
    subtitle?: string
    image?: string
    about?: string
    visible?: boolean
}

export type StoreSectionType =
    | "services" | "gallery" | "reviews" | "contact"
    | "faq" | "staff" | "offers" | "visitInfo"

export interface IStoreSection {
    key: string
    type: StoreSectionType
    visible?: boolean
    order: number
    data?: unknown
}

// removable sections + their layout order
export interface IStoreSections {
    order?: string[]
    items?: IStoreSection[]
}

export interface IStoreInvoice {
    prefix?: string
    seq?: number
}

export interface IStore {
    // root: normal data + ids (_id = businessId, staff via query)
    name: string
    phone?: string
    address?: string
    businessType: BusinessType
    slug: string
    ownerId: Types.ObjectId | string
    weekendAdvancePercent?: number
    cancelHours?: number
    plan?: "basic" | "pro"
    isActive?: boolean
    subscriptionId?: string
    // groups
    worktime?: IStoreWorktime
    style?: IStoreStyle
    hero?: IStoreHero
    sections?: IStoreSections
    invoice?: IStoreInvoice
}