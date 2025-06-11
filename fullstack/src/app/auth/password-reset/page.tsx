import { Metadata } from 'next';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import { Suspense } from 'react';
import { Box } from '@mui/material';

export const metadata: Metadata = {
    title: 'Reset password',
};

function ResetPassword() {
    return (
        <Suspense fallback={<Box></Box>}>
            <PasswordResetForm />
        </Suspense>
    );
}

export default ResetPassword;
