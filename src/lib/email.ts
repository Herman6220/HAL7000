import nodemailer from "nodemailer";

interface SendMailProps{
    to: string,
    subject: string,
    text: string,
}

export const sendMail = async ({to, subject, text}: SendMailProps) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 2525,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: '"Herman"',
        to,
        subject,
        text,
    })

    console.log("Message sent: ", info.messageId);
}