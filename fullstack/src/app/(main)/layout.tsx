import { ReactNode } from 'react';
import AppNavBar from '@/components/main/AppNavBar';
import { Container, SxProps } from '@mui/material';

const containerStyles: SxProps = {
    display: 'flex',
    justifyContent: 'center',
    padding: 2,
};

interface MainPageLayoutProps {
    children: ReactNode;
}

function MainPageLayout({ children }: MainPageLayoutProps) {
    return (
        <>
            <AppNavBar />
            <Container sx={containerStyles}>{children}</Container>
        </>
    );
}

export default MainPageLayout;
