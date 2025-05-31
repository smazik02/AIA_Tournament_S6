'use client';

import { addTournamentSponsorAction, TournamentSponsorState } from '@/server-actions/tournament_add_sponsor';
import { useActionState, useState } from 'react';
import { Alert, Box, Button, FormControl, Modal, Stack, TextField } from '@mui/material';
import Form from 'next/form';
import { AddBusiness } from '@mui/icons-material';

interface AddSponsorModalProps {
    tournamentId: string;
}

const initialState: TournamentSponsorState = {
    success: false,
    message: '',
};

const boxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
};

function AddSponsorModal({ tournamentId }: AddSponsorModalProps) {
    const [state, formAction, isPending] = useActionState(addTournamentSponsorAction, initialState);
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} sx={{ pt: 1 }}>
                <AddBusiness sx={{ mr: 1 }} color="primary" /> Add sponsor.
            </Button>
            <Modal open={isOpen} onClose={handleClose}>
                <Box sx={boxStyle}>
                    <Form action={formAction}>
                        <FormControl>
                            <Stack sx={{ justifyContent: 'center', gap: 2 }}>
                                <input type="hidden" name="tournamentId" value={tournamentId} />
                                <TextField
                                    name="name"
                                    label="Name"
                                    fullWidth
                                    required
                                    id="name"
                                    type="text"
                                    defaultValue={state?.inputs?.name}
                                    error={state?.errors?.name !== undefined}
                                    helperText={state?.errors?.name?.[0]}
                                    color={state?.errors?.name ? 'error' : 'primary'}
                                />
                                <TextField
                                    name="logoUrl"
                                    label="Logo URL"
                                    fullWidth
                                    required
                                    id="logoUrl"
                                    type="text"
                                    defaultValue={state?.inputs?.logoUrl}
                                    error={state?.errors?.logoUrl !== undefined}
                                    helperText={state?.errors?.logoUrl?.[0]}
                                    color={state?.errors?.logoUrl ? 'error' : 'primary'}
                                />

                                <Button variant="contained" type="submit" disabled={isPending}>
                                    {isPending ? 'Creating...' : 'Create'}
                                </Button>

                                {state.message && !state.success && <Alert severity="error">{state.message}</Alert>}
                                {state.message && state.success && <Alert severity="success">{state.message}</Alert>}
                            </Stack>
                        </FormControl>
                    </Form>
                </Box>
            </Modal>
        </>
    );
}

export default AddSponsorModal;
