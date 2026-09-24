
const otpHtml = (name: string, otp: string): string => {
   return `
   <!DOCTYPE html>
   <html>
   <body style="margin:0; padding:0; background-color:#f4f4f7; font-family: Arial, Helvetica, sans-serif;">
   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding:30px 0;">
   <tr>
   <td align="center">
   <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden;">
   <tr>
   <td style="background-color:#4f46e5; padding:28px 40px; text-align:center;">
   <h1 style="margin:0; color:#ffffff; font-size:22px;">YourAppName</h1>
   </td>
   </tr>
   tr>
   <td style="padding:36px 40px 24px 40px;">
   <h2 style="margin:0 0 12px 0; color:#111827;">Hi ${name},</h2>
   <p style="color:#4b5563; font-size:15px;">Use the OTP below to verify your email. It expires in 10 minutes.</p>
   <div style="text-align:center; padding:20px 0;">
   <span style="font-size:32px; font-weight:700; letter-spacing:8px; color:#4f46e5; background:#f3f4f6; padding:16px 32px; border-radius:8px; border:1px dashed #4f46e5;">${otp}</span>
   </div>
   </td>
   </tr>
   </table>
   </td>
   </tr>
   </table>
  </body>
  </html>`
}

export default otpHtml