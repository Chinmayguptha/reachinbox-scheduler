import nodemailer from 'nodemailer';

// Create a reusable transporter object using the default SMTP transport
let transporter: nodemailer.Transporter | null = null;

export const initMailer = async () => {
    if (process.env.ETHEREAL_EMAIL && process.env.ETHEREAL_PASS) {
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.ETHEREAL_EMAIL,
                pass: process.env.ETHEREAL_PASS
            }
        });
    } else {
        // Create a test account if not provided
        const testAccount = await nodemailer.createTestAccount();
        console.log('Ethereal Test Account created:', testAccount.user);
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }
};

export const sendEmail = async ({ to, subject, text }: { to: string[], subject: string, text: string }) => {
    if (!transporter) await initMailer();

    const info = await transporter!.sendMail({
        from: '"ReachInbox Scheduler" <scheduler@reachinbox.com>',
        to: to.join(', '),
        subject: subject,
        text: text,
        html: `<b>${text}</b>`,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
};
