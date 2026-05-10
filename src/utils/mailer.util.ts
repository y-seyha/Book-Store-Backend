import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MailerService {
  private readonly endpoint =
    process.env.BREVO_EMAIL_ENDPOINT || 'https://api.brevo.com/v3/smtp/email';

  private readonly sender = {
    name: 'YS Bookstore',
    email: process.env.BREVO_SENDER!,
  };

  private readonly headers = {
    accept: 'application/json',
    'api-key': process.env.BREVO_API_KEY!,
    'content-type': 'application/json',
  };

  constructor() {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is missing');
    }

    if (!process.env.BREVO_SENDER) {
      throw new Error('BREVO_SENDER is missing');
    }

    if (!process.env.BACKEND_URL) {
      throw new Error('BACKEND_URL is missing');
    }

    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL is missing');
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const backendUrl = new URL(process.env.BACKEND_URL!);

    const verificationUrl = new URL('/api/auth/verify-email', backendUrl);

    verificationUrl.searchParams.set('token', token);

    const html = this.buildVerificationTemplate(verificationUrl.toString());

    const text = `Verify your email: ${verificationUrl.toString()}`;

    const res = await axios.post(
      this.endpoint,
      {
        sender: this.sender,
        to: [{ email: to }],
        subject: 'Verify your email - YS Bookstore',
        htmlContent: html,
        textContent: text,
      },
      { headers: this.headers, timeout: 10000 },
    );

    console.log('📧 Brevo verify email response:', res.data);
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = new URL(process.env.FRONTEND_URL!);

    const resetUrl = new URL('/auth/reset-password', frontendUrl);

    resetUrl.searchParams.set('token', token);

    const html = this.buildResetTemplate(resetUrl.toString());

    const text = `Reset your password: ${resetUrl.toString()}`;

    const res = await axios.post(
      this.endpoint,
      {
        sender: this.sender,
        to: [{ email: to }],
        subject: 'Reset your password - YS Bookstore',
        htmlContent: html,
        textContent: text,
      },
      { headers: this.headers, timeout: 10000 },
    );

    console.log('📧 Brevo reset email response:', res.data);
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

  <div style="display:none;max-height:0;overflow:hidden;">
    YS Bookstore notification email
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:30px 0;">
    <tr>
      <td align="center">

        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:10px;overflow:hidden;">

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
