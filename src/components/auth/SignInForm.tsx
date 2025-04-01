'use client';

import {
    Alert,
    AlertTitle,
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
import { FormEvent, useState } from 'react';
import ForgotPasswordDialog from '@/components/auth/ForgotPasswordDialog';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

function SignInForm() {
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');

    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    const [authError, setAuthError] = useState(false);
    const [authErrorMessage, setAuthErrorMessage] = useState('');

    const [rememberMe, setRememberMe] = useState(false);

    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

    const router = useRouter();

    const validateInputs = (formData: FormData) => {
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();

        let isValid = true;

        if (email == undefined || !/\S+@\S+\.\S+/.test(email)) {
            setEmailError(true);
            setEmailErrorMessage('Please enter a valid email address.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (password == undefined || password.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage(
                'Password must be at least 6 characters long.',
            );
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        if (!validateInputs(formData)) {
            return;
        }

        const email = formData.get('email')?.toString() ?? '';
        const password = formData.get('password')?.toString() ?? '';

        const { error } = await authClient.signIn.email({
            email,
            password,
            rememberMe,
        });

        if (error !== null) {
            setAuthError(true);
            setAuthErrorMessage(error.message ?? '');
            return;
        } else {
            setAuthError(false);
            setAuthErrorMessage('');
        }

        router.push('/');
    };

    return (
        <>
            <ForgotPasswordDialog
                isOpen={isResetPasswordOpen}
                handleClose={() => setIsResetPasswordOpen(false)}
            />
            <Box
                component="form"
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                onSubmit={handleSubmit}
            >
                <FormControl>
                    <TextField
                        autoComplete="email"
                        name="email"
                        label="Email"
                        fullWidth
                        id="email"
                        type="email"
                        error={emailError}
                        helperText={emailErrorMessage}
                        color={emailError ? 'error' : 'primary'}
                    />
                </FormControl>
                <FormControl>
                    <TextField
                        autoComplete="new-password"
                        name="password"
                        label="Password"
                        fullWidth
                        id="password"
                        type="password"
                        error={passwordError}
                        helperText={passwordErrorMessage}
                        color={passwordError ? 'error' : 'primary'}
                    />
                </FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            value="remember"
                            color="primary"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                    }
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
                    onClick={() => setIsResetPasswordOpen(true)}
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
                {authError && (
                    <Alert severity="error">
                        <AlertTitle>Error occurred during sign in!</AlertTitle>
                        {authErrorMessage}
                    </Alert>
                )}
            </Box>
        </>
    );
}

export default SignInForm;
