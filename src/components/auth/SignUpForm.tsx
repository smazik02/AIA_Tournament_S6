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
import { FormEvent, useState } from 'react';

function SignUpForm() {
    const [nameError, setNameError] = useState(false);
    const [nameErrorMessage, setNameErrorMessage] = useState('');

    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');

    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

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

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(event.currentTarget);
        if (!validateInputs(formData)) {
            event.preventDefault();
            return;
        }
    };

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
        </Box>
    );
}

export default SignUpForm;
