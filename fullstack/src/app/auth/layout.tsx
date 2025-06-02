import { ReactNode } from 'react';
import AppNavBar from '@/components/main/AppNavBar';
import { Stack, SxProps } from '@mui/material';

export interface AuthLayoutProps {
    children: ReactNode;
}

const mainStackStyles: SxProps = { justifyContent: 'center' };

function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <>
            <AppNavBar />
            <Stack sx={mainStackStyles}>{children}</Stack>
        </>
    );
}

export default AuthLayout;
