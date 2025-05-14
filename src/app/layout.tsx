import { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { Roboto } from 'next/font/google';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '@/theme';
import styles from './root.module.css';

interface RootLayoutProps {
    children: ReactNode;
}

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-roboto',
});

function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" className={`${roboto.variable} ${styles.root}`}>
            <head>
                <title>AIA Tournament</title>
            </head>
            <body className={styles.root}>
                <AppRouterCacheProvider>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        {children}
                    </ThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}

export default RootLayout;
