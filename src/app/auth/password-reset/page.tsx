import { Metadata } from 'next';
import { Box, Typography } from '@mui/material';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Reset password',
};

function ResetPassword() {
    return (
        <>
            <Typography component="h1" variant="h4" sx={{ width: '100%' }}>
                Reset password
            </Typography>
            <Suspense fallback={<Box></Box>}>
                <PasswordResetForm />
            </Suspense>
        </>
    );
}

export default ResetPassword;
