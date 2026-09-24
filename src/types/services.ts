import { JwtPayload } from "jsonwebtoken"

export interface SendOtpMailParams {
  name: string;
  email: string;
  type: "v" | "p"
  // type: "verification_email" | "password_rest";
}

export interface SendMail {
  email: string,
  subject: string,
  name: string
}

export interface SendMailOtp extends SendMail {
  otp: string
}

export interface AccessTokenPayload extends JwtPayload {
  accountId: string,
  version: number
}