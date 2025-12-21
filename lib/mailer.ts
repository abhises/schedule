// lib/mailer.ts
import nodemailer from "nodemailer";

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
  });

  return transporter.sendMail({
    from: `"Schedule App" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
