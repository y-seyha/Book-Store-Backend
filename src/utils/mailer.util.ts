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

  private wrapEmail(title: string, content: string) {
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>

  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:30px 0;">
      <tr>
        <td align="center">

          <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">

            <!-- HEADER -->
            <tr>
              <td style="background:#2563eb;padding:20px;text-align:center;color:#ffffff;">
                <h2 style="margin:0;font-size:20px;">YS Bookstore</h2>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:30px;text-align:center;">
                ${content}
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:20px;text-align:center;font-size:12px;color:#9ca3af;background:#f9fafb;">
                © ${new Date().getFullYear()} YS Bookstore. All rights reserved.
                <br />
                If you didn’t request this email, you can ignore it.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
</html>
`;
  }

  private buildVerificationTemplate(url: string) {
    return this.wrapEmail(
      'Verify Email',
      `
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
            color:#ffffff;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          ">
          Verify Email
        </a>

        <p style="margin-top:25px;font-size:12px;color:#9ca3af;">
          This link will expire soon for security reasons.
        </p>
      `,
    );
  }

  private buildResetTemplate(url: string) {
    return this.wrapEmail(
      'Reset Password',
      `
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
            color:#ffffff;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          ">
          Reset Password
        </a>

        <p style="margin-top:25px;font-size:12px;color:#9ca3af;">
          If you didn’t request this, please ignore this email.
        </p>
      `,
    );
  }
}
