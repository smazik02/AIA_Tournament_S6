import { Metadata } from 'next';
import { Typography } from '@mui/material';
import PasswordResetForm from '@/components/auth/PasswordResetForm';

export const metadata: Metadata = {
    title: 'Reset password',
};

function ResetPassword() {
    return (
        <>
            <Typography component="h1" variant="h4" sx={{ width: '100%' }}>
                Reset password
            </Typography>
            <PasswordResetForm />
        </>
    );
}

export default ResetPassword;
