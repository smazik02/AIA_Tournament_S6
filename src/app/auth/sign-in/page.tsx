import { Metadata } from 'next';
import { Typography } from '@mui/material';
import SignInForm from '@/components/auth/SignInForm';

export const metadata: Metadata = {
    title: 'Sign in',
};

function SignIn() {
    return (
        <>
            <Typography component="h1" variant="h4" sx={{ width: '100%' }}>
                Sign in
            </Typography>
            <SignInForm />
        </>
    );
}

export default SignIn;
