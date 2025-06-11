import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from './prisma';
import { nextCookies } from 'better-auth/next-js';

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const PASSWORD_TOKEN_EXPIRES_IN = 60 * 60 * 24;

console.log(`BETTER_AUTH_SECRET=${process.env.BETTER_AUTH_SECRET}`);

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        maxPasswordLength: MAX_PASSWORD_LENGTH,
        minPasswordLength: MIN_PASSWORD_LENGTH,
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
        resetPasswordTokenExpiresIn: PASSWORD_TOKEN_EXPIRES_IN,
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
    socialProviders: {
        google: {
            prompt: 'select_account',
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        },
    },
    plugins: [nextCookies()],
});
