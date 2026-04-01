import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendVerificationEmail(to: string, token: string) {
        const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");
        const verificationUrl = `${backendUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

        await this.transporter.sendMail({
            from: `"MyApp" <${process.env.SMTP_USER}>`,
            to,
            subject: "Verify your email",
            html: `<h2>Welcome to MyApp!</h2>
             <p>Please verify your email:</p>
             <a href="${verificationUrl}">Verify Email</a>
             <p>This link will expire in 1 hour.</p>`,
        });
    }

    async sendPasswordResetEmail(to: string, token: string) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await this.transporter.sendMail({
            from: `"MyApp" <${process.env.SMTP_USER}>`,
            to,
            subject: "Reset your password",
            html: `<p>Click here to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
        });
    }
}