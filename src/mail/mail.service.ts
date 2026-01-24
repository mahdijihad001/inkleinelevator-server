import * as nodemailer from "nodemailer"
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {

    private transporter

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    };



    async sendMail(to: string, subject: string, code: string) {
        return await this.transporter.sendMail({
            from: `"Inkleinelevator" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html: `
            <div style="font-family: Arial">
                <h2>Your Verification Code</h2>
                <h1 style="color: #4CAF50">${code}</h1>
            </div>
        `,
        });
    }
    async sendMessage(to: string, subject: string, html: any) {
        return await this.transporter.sendMail({
            from: `"Inkleinelevator" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
    }

}
