import nodemailer from 'nodemailer';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
        }
    });

    const options = {
        to: body.email,
        subject: body.subject,
        html: body.template,
    };

    const info = await transporter.sendMail(options);

    return { messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) as string };
});
