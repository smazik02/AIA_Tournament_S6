import { ReactNode } from 'react';
import { Card, Container, Stack, SxProps } from '@mui/material';

export interface AuthLayoutProps {
    children: ReactNode;
}

const mainStackStyles: SxProps = { justifyContent: 'center' };

const containerStyles: SxProps = {
    display: 'flex',
    justifyContent: 'center',
    padding: 2,
};

const cardStyles: SxProps = {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    padding: 2,
    gap: 1,
};

function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <Stack sx={mainStackStyles}>
            <Container sx={containerStyles}>
                <Card variant="outlined" sx={cardStyles}>
                    {children}
                </Card>
            </Container>
        </Stack>
    );
}

export default AuthLayout;
