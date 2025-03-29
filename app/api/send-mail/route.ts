import type { NextApiRequest } from "next";
import nodemailer from "nodemailer";

export async function POST(req: NextApiRequest) {
    try {
        const { to, subject, text } = await req.body;

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send mail
        const info = await transporter.sendMail({
            from: `"Next.js Mailer" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });

        return Response.json({ message: "Email sent!", messageId: info.messageId });
    } catch {
        return Response.json({ error: "Failed to send email" }, { status: 500 });
    }
}

// Sample usage
/*
    const response = await fetch("/api/send-mail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ to: email, subject, text: message })
    });
*/
