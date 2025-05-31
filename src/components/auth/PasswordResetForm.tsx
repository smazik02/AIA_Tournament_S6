'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, FormControl, TextField } from '@mui/material';
import { authClient } from '@/lib/auth-client';

function PasswordResetForm() {
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    const router = useRouter();

    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const validateInputs = (formData: FormData) => {
        const newPassword = formData.get('new-password')?.toString();
        const repeatPassword = formData.get('repeat-password')?.toString();

        let isValid = true;

        if (newPassword == undefined || newPassword.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 6 characters long.');
            isValid = false;
        } else if (repeatPassword == undefined || newPassword !== repeatPassword) {
            setPasswordError(true);
            setPasswordErrorMessage('Passwords do not match.');
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

        const newPassword = formData.get('new-password')?.toString();
        if (newPassword === undefined || token === null) {
            return;
        }

        const { error } = await authClient.resetPassword({ newPassword, token });
        if (error !== null) {
            setPasswordError(true);
            setPasswordErrorMessage(error.message ?? '');
            return;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        router.push('/auth/sign-in');
    };

    if (!token) {
        return (
            <>
                Incorrect reset password link or another error has occurred! Try again or contact the AIA Tournament
                team.
            </>
        );
    }

    return (
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} onSubmit={handleSubmit}>
            <FormControl>
                <TextField
                    autoComplete="new-password"
                    name="new-password"
                    label="New Password"
                    fullWidth
                    id="new-password"
                    type="password"
                    error={passwordError}
                    helperText={passwordErrorMessage}
                    color={passwordError ? 'error' : 'primary'}
                />
            </FormControl>
            <FormControl>
                <TextField
                    autoComplete="repeat-password"
                    name="repeat-password"
                    label="Repeat New Password"
                    fullWidth
                    id="repeat-password"
                    type="password"
                    error={passwordError}
                    helperText={passwordErrorMessage}
                    color={passwordError ? 'error' : 'primary'}
                />
            </FormControl>
            <Button type="submit" fullWidth variant="contained">
                Reset password
            </Button>
        </Box>
    );
}

export default PasswordResetForm;
