import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@mui/material';
import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth-client';

export interface ForgotPasswordDialogProps {
    isOpen: boolean;
    handleClose: () => void;
}

function ForgotPasswordDialog({ isOpen, handleClose }: ForgotPasswordDialogProps) {
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email')?.toString();
        if (email == undefined || !/\S+@\S+\.\S+/.test(email)) {
            setSuccess(false);
            setError(true);
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        const { error } = await authClient.forgetPassword({
            email: email,
            redirectTo: '/auth/password-reset',
        });

        if (error !== null) {
            setSuccess(false);
            setError(true);
            setErrorMessage(error.message ?? '');
            return;
        }

        setSuccess(true);
        setError(false);
        setErrorMessage('');
    };

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            slotProps={{
                paper: {
                    component: 'form',
                    sx: { backgroundImage: 'none' },
                    onSubmit: handleSubmit,
                },
            }}
        >
            <DialogTitle>Reset password</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DialogContentText>
                    Enter your account&apos;s email address, and we&apos;ll send you a reset password link.
                </DialogContentText>
                <TextField
                    autoFocus
                    variant="outlined"
                    name="email"
                    label="Email"
                    id="email"
                    type="email"
                    error={error}
                    helperText={errorMessage}
                    color={error ? 'error' : 'primary'}
                />
                {success && <Alert severity="success">Password reset email has been sent!</Alert>}
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="contained" type="submit">
                    Continue
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ForgotPasswordDialog;
