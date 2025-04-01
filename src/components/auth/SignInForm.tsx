'use client';

import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    Link as MuiLink,
    TextField,
    Typography,
} from '@mui/material';
import { GoogleIcon } from '@/components/CustomIcons';
import NextLink from 'next/link';

function SignInForm() {
    return (
        <Box
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
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
                    autoComplete="password"
                    name="password"
                    label="Password"
                    required
                    fullWidth
                    id="password"
                    type="password"
                    color="primary"
                />
            </FormControl>
            <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
            />
            <Button type="submit" fullWidth variant="contained">
                Sign in
            </Button>
            <MuiLink
                component="button"
                type="button"
                variant="body2"
                sx={{ alignSelf: 'center' }}
            >
                Forgot your password?
            </MuiLink>
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
                    Sign in with Google
                </Button>
                <Typography sx={{ textAlign: 'center' }}>
                    Don&apos;t have an account?{' '}
                    <MuiLink
                        href="/auth/sign-up"
                        component={NextLink}
                        variant="body2"
                        sx={{ alignSelf: 'center' }}
                    >
                        Sign up
                    </MuiLink>
                </Typography>
            </Box>
        </Box>
    );
}

export default SignInForm;
