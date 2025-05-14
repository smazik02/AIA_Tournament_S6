'use client';

import { AppBar, Box, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import NextLink from 'next/link';
import { authClient } from '@/lib/auth-client';
import { AccountCircle, AccountCircleOutlined } from '@mui/icons-material';
import { MouseEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

function AppNavBar() {
    const { data: session } = authClient.useSession();

    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
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
                                <MenuItem key={1} onClick={handleClose}>
                                    Profile info
                                </MenuItem>,
                                <MenuItem
                                    key={2}
                                    onClick={async () => {
                                        handleClose();
                                        await authClient.signOut({
                                            fetchOptions: {
                                                onSuccess: () => router.push('/auth/sign-in'),
                                            },
                                        });
                                    }}
                                >
                                    Logout
                                </MenuItem>,
                            ]}
                            {!session && <MenuItem onClick={() => router.push('/auth/sign-in')}>Login</MenuItem>}
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default AppNavBar;
