/* eslint-disable */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
      },
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, '');

    const verificationUrl = `${backendUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

    const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toLocaleString();

    // console.log('Backend URL:', backendUrl);
    // console.log('Verification URL:', verificationUrl);

    await this.transporter.sendMail({
      from: `"ysbookstore" <${process.env.BREVO_SENDER}>`,
      to,
      subject: 'Verify your email address',
      html: `
      <div style="background:#f4f6f8;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">

        <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">

          <div style="padding:22px 24px;border-bottom:1px solid #e5e7eb;">
            <h1 style="margin:0;font-size:18px;color:#111827;font-weight:600;">
              Email Verification
            </h1>
          </div>

          <div style="padding:24px;color:#111827;font-size:14px;line-height:1.6;">

            <p style="margin:0 0 14px 0;">
              Please verify your email address to continue using your account.
            </p>

            <p style="margin:0 0 18px 0;color:#374151;">
              This verification link will expire in
              <strong style="color:#b91c1c;">3 minutes</strong>.
            </p>

            <div style="margin:18px 0;padding:12px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;">
              <p style="margin:0;font-size:12px;color:#6b7280;">
                Expires at: <strong style="color:#111827;">${expiresAt}</strong>
              </p>
            </div>

                        <div style="text-align:center;margin:28px 0;">
              <a href="${verificationUrl}"
                 style="
                   display:inline-block;
                   padding:12px 26px;
                   background:#2563eb;
                   color:#ffffff;
                   text-decoration:none;
                   border-radius:8px;
                   font-size:14px;
                   font-weight:600;
                 ">
                Verify Email
              </a>
            </div>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

            <p style="font-size:12px;color:#6b7280;margin:0;">
              This is a demo project system. All data is used only for development and testing purposes.
            </p>

          </div>

          <div style="padding:14px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
            © ${new Date().getFullYear()} ysbookstore
          </div>

        </div>
      </div>
    `,
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    try {
      const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');

      const resetUrl = `${frontendUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toLocaleString();

      const info = await this.transporter.sendMail({
        from: `"ysbookstore" <${process.env.BREVO_SENDER}>`,
        to,
        subject: 'Reset your password',

        html: `
      <div style="background:#f4f6f8;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">

        <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">

          <div style="padding:22px 24px;border-bottom:1px solid #e5e7eb;">
            <h1 style="margin:0;font-size:18px;color:#111827;font-weight:600;">
              Password Reset Request
            </h1>
          </div>

          <div style="padding:24px;color:#111827;font-size:14px;line-height:1.6;">

            <p style="margin:0 0 14px 0;">
              We received a request to reset your password.
            </p>

            <p style="margin:0 0 18px 0;color:#374151;">
              This reset link will expire in
              <strong style="color:#b91c1c;">1 hour</strong>.
            </p>

            <div style="margin:18px 0;padding:12px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;">
              <p style="margin:0;font-size:12px;color:#6b7280;">
                Expires at: <strong style="color:#111827;">${expiresAt}</strong>
              </p>
            </div>

            <div style="text-align:center;margin:28px 0;">
              <a href="${resetUrl}"
                 style="
                   display:inline-block;
                   padding:12px 26px;
                   background:#2563eb;
                   color:#ffffff;
                   text-decoration:none;
                   border-radius:8px;
                   font-size:14px;
                   font-weight:600;
                 ">
                Reset Password
              </a>
            </div>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

            <p style="font-size:12px;color:#6b7280;margin:0;">
              This is a demo project system. All data is used only for development and testing purposes.
            </p>

          </div>

          <div style="padding:14px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
            © ${new Date().getFullYear()} ysbookstore
          </div>

        </div>
      </div>
    `,
      });

      // console.log(' Reset password email sent:', info.messageId);
    } catch (error) {
      console.error('Failed to send reset password email:', error);

      throw new Error('Email sending failed');
    }
  }
}
