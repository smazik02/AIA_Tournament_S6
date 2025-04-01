'use client';

import {
    Box,
    Button,
    Divider,
    FormControl,
    Link as MuiLink,
    TextField,
    Typography,
} from '@mui/material';
import { GoogleIcon } from '@/components/CustomIcons';
import NextLink from 'next/link';

function SignUpForm() {
    return (
        <Box
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
            <FormControl>
                <TextField
                    autoComplete="name"
                    name="name"
                    label="Name"
                    required
                    fullWidth
                    id="name"
                    color="primary"
                />
            </FormControl>
            <FormControl>
                <TextField
                    autoComplete="email"
                    name="email"
                    label="Email"
                    required
                    fullWidth
                    id="email"
                    type="email"
                    color="primary"
                />
            </FormControl>
            <FormControl>
                <TextField
                    autoComplete="new-password"
                    name="password"
                    label="Password"
                    required
                    fullWidth
                    id="password"
                    type="password"
                    color="primary"
                />
            </FormControl>
            <Button type="submit" fullWidth variant="contained">
                Sign up
            </Button>
            <Divider>
                <Typography sx={{ color: 'text.secondary' }}>or</Typography>
            </Divider>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => alert('Sign up with google')}
                    startIcon={<GoogleIcon />}
                >
                    Sign up with Google
                </Button>
                <Typography sx={{ textAlign: 'center' }}>
                    Already have an account?{' '}
                    <MuiLink
                        href="/auth/sign-in"
                        component={NextLink}
                        variant="body2"
                        sx={{ alignSelf: 'center' }}
                    >
                        Sign in
                    </MuiLink>
                </Typography>
            </Box>
        </Box>
    );
}

export default SignUpForm;
