import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from './prisma';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            const emailData = {
                service_id: process.env.EMAILJS_SERVICE_ID ?? '',
                template_id: process.env.EMAILJS_PASSWORD_TEMPLATE_ID ?? '',
                user_id: process.env.EMAILJS_PUBLIC_KEY ?? '',
                template_params: { email: user.email, link: url },
            };

            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                body: JSON.stringify(emailData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            const emailData = {
                service_id: process.env.EMAILJS_SERVICE_ID ?? '',
                template_id: process.env.EMAILJS_VERIFY_TEMPLATE_ID ?? '',
                user_id: process.env.EMAILJS_PUBLIC_KEY ?? '',
                template_params: { email: user.email, link: url },
            };

            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                body: JSON.stringify(emailData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
    },
    plugins: [nextCookies()],
});
