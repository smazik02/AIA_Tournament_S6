'use client';

import { AppBar, Box, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import NextLink from 'next/link';
import { authClient } from '@/lib/auth-client';
import { AccountCircle, AccountCircleOutlined } from '@mui/icons-material';
import { MouseEvent, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

function AppNavBar() {
    const { data: session } = authClient.useSession();
    const router = useRouter();
    const currentPath = usePathname();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogin = () => {
        const callbackUrl = currentPath === '/' ? '' : currentPath.substring(1);
        const signInUrl = `/auth/sign-in${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`;
        router.push(signInUrl);
    };

    const handleLogout = async () => {
        handleClose();
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => router.push('/'),
            },
        });
    };

    const handleProfileInfo = () => {
        handleClose();
        router.push('/account');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography
                        variant="h5"
                        component={NextLink}
                        href="/"
                        sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
                    >
                        AIA TOURNAMENT
                    </Typography>
                    <div>
                        <IconButton size="large" color="inherit" onClick={handleMenu}>
                            {session ? <AccountCircle /> : <AccountCircleOutlined />}
                        </IconButton>
                        <Menu
                            id="account-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            {session && [
                                <MenuItem key={1} onClick={handleProfileInfo}>
                                    Profile info
                                </MenuItem>,
                                <MenuItem key={2} onClick={handleLogout}>
                                    Logout
                                </MenuItem>,
                            ]}
                            {!session && <MenuItem onClick={handleLogin}>Login</MenuItem>}
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default AppNavBar;
