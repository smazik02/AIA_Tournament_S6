import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    OutlinedInput,
} from '@mui/material';
import { FormEvent } from 'react';

export interface ForgotPasswordDialogProps {
    isOpen: boolean;
    handleClose: () => void;
}

function ForgotPasswordDialog({
    isOpen,
    handleClose,
}: ForgotPasswordDialogProps) {
    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            slotProps={{
                paper: {
                    component: 'form',
                    sx: { backgroundImage: 'none' },
                    onSubmit: (event: FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        handleClose();
                    },
                },
            }}
        >
            <DialogTitle>Reset password</DialogTitle>
            <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                <DialogContentText>
                    Enter your account&apos;s email address, and we&apos;ll send
                    you a reset password link.
                </DialogContentText>
                <OutlinedInput
                    autoFocus
                    required
                    margin="dense"
                    id="email"
                    name="email"
                    placeholder="Email"
                    type="email"
                ></OutlinedInput>
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
