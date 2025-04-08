'use client';

import {
    Alert,
    AlertTitle,
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
import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth-client';

function SignUpForm() {
    const [nameError, setNameError] = useState(false);
    const [nameErrorMessage, setNameErrorMessage] = useState('');

    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');

    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    const [authError, setAuthError] = useState(false);
    const [authErrorMessage, setAuthErrorMessage] = useState('');

    const [afterSignUp, setAfterSignUp] = useState(false);

    const validateInputs = (formData: FormData) => {
        const name = formData.get('name')?.toString();
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();

        let isValid = true;

        if (name == undefined || name.length < 1) {
            setNameError(true);
            setNameErrorMessage('Name is required.');
            isValid = false;
        } else {
            setNameError(false);
            setNameErrorMessage('');
        }

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

        const name = formData.get('name')?.toString() ?? '';
        const email = formData.get('email')?.toString() ?? '';
        const password = formData.get('password')?.toString() ?? '';

        const { error } = await authClient.signUp.email({
            name,
            email,
            password,
        });

        if (error !== null) {
            setAuthError(true);
            setAuthErrorMessage(error.message ?? '');
            return;
        } else {
            setAuthError(false);
            setAuthErrorMessage('');
        }

        setAfterSignUp(true);
    };

    if (afterSignUp) {
        return (
            <>
                A verification mail has been sent. Please verify your email
                before signing in.
            </>
        );
    }

    return (
        <Box
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            onSubmit={handleSubmit}
        >
            <FormControl>
                <TextField
                    autoComplete="name"
                    name="name"
                    label="Name"
                    fullWidth
                    id="name"
                    type="text"
                    error={nameError}
                    helperText={nameErrorMessage}
                    color={nameError ? 'error' : 'primary'}
                />
            </FormControl>
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
            {authError && (
                <Alert severity="error">
                    <AlertTitle>Error occurred during sign up!</AlertTitle>
                    {authErrorMessage}
                </Alert>
            )}
        </Box>
    );
}

export default SignUpForm;
