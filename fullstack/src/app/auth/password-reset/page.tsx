import { Metadata } from 'next';
import PasswordResetForm from '@/components/auth/PasswordResetForm';

export const metadata: Metadata = {
    title: 'Reset password',
};

function ResetPassword() {
    return <PasswordResetForm />;
}

export default ResetPassword;
