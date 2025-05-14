import { ReactNode } from 'react';
import AppNavBar from '@/components/main/AppNavBar';

interface MainPageLayoutProps {
    children: ReactNode;
}

function MainPageLayout({ children }: MainPageLayoutProps) {
    return (
        <>
            <AppNavBar />
            {children}
        </>
    );
}

export default MainPageLayout;
