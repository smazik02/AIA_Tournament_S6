import { Typography } from '@mui/material';
import SignUpForm from '@/components/auth/SignUpForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign up',
};

function SignUp() {
    return (
        <>
            <Typography component="h1" variant="h4" sx={{ width: '100%' }}>
                Sign up
            </Typography>
            <SignUpForm />
        </>
    );
}

export default SignUp;
