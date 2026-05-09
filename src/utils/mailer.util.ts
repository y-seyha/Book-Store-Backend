import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MailerService {
  private readonly endpoint =
    process.env.BREVO_EMAIL_ENDPOINT || 'https://api.brevo.com/v3/smtp/email';

  private readonly sender = {
    name: 'YS Bookstore',
    email: process.env.BREVO_SENDER,
  };

  private readonly headers = {
    accept: 'application/json',
    'api-key': process.env.BREVO_API_KEY,
    'content-type': 'application/json',
  };

  async sendVerificationEmail(to: string, token: string) {
    const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, '');

    const verificationUrl = `${backendUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

    const html = this.buildVerificationTemplate(verificationUrl);

    await axios.post(
      this.endpoint,
      {
        sender: this.sender,
        to: [{ email: to }],
        subject: 'Verify your email - YS Bookstore',
        htmlContent: html,
      },
      { headers: this.headers, timeout: 10000 },
    );
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');

    const resetUrl = `${frontendUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

    const html = this.buildResetTemplate(resetUrl);

    await axios.post(
      this.endpoint,
      {
        sender: this.sender,
        to: [{ email: to }],
        subject: 'Reset your password - YS Bookstore',
        htmlContent: html,
      },
      { headers: this.headers, timeout: 10000 },
    );
  }

  // ---------------------------
  // EMAIL TEMPLATES (MODERN UI)
  // ---------------------------

  private buildVerificationTemplate(url: string) {
    return `
    <div style="font-family:Arial,sans-serif;background:#f6f7fb;padding:40px;">
      <div style="max-width:520px;margin:auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

        <div style="background:#2563eb;padding:20px;text-align:center;color:white;">
          <h2 style="margin:0;">Welcome to YS Bookstore</h2>
        </div>

        <div style="padding:30px;text-align:center;">
          <h3 style="margin-bottom:10px;">Verify your email</h3>
          <p style="color:#6b7280;font-size:14px;">
            Click the button below to activate your account.
          </p>

          <a href="${url}"
             style="
              display:inline-block;
              margin-top:20px;
              padding:12px 24px;
              background:#2563eb;
              color:white;
              text-decoration:none;
              border-radius:8px;
              font-weight:bold;
             ">
            Verify Email
          </a>

          <p style="margin-top:25px;font-size:12px;color:#9ca3af;">
            If you didn’t create an account, you can ignore this email.
          </p>
        </div>

      </div>
    </div>
    `;
  }

  private buildResetTemplate(url: string) {
    return `
    <div style="font-family:Arial,sans-serif;background:#f6f7fb;padding:40px;">
      <div style="max-width:520px;margin:auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

        <div style="background:#ef4444;padding:20px;text-align:center;color:white;">
          <h2 style="margin:0;">Password Reset</h2>
        </div>

        <div style="padding:30px;text-align:center;">
          <h3 style="margin-bottom:10px;">Reset your password</h3>
          <p style="color:#6b7280;font-size:14px;">
            We received a request to reset your password.
          </p>

          <a href="${url}"
             style="
              display:inline-block;
              margin-top:20px;
              padding:12px 24px;
              background:#ef4444;
              color:white;
              text-decoration:none;
              border-radius:8px;
              font-weight:bold;
             ">
            Reset Password
          </a>

          <p style="margin-top:25px;font-size:12px;color:#9ca3af;">
            This link will expire soon. If you didn’t request this, ignore it.
          </p>
        </div>

      </div>
    </div>
    `;
  }
}
