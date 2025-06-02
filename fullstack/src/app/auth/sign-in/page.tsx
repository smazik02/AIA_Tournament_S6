import { Metadata } from 'next';
import SignInForm from '@/components/auth/SignInForm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Sign in',
};

interface SignInPageParams {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function SignIn({ searchParams }: SignInPageParams) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (session) {
        const callbackUrl = (await searchParams).callback ?? '';
        redirect(`/${callbackUrl}`);
    }

    return <SignInForm />;
}

export default SignIn;
