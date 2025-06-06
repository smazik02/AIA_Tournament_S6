'use client';

import { ApplicationState, tournamentApplicationAction } from '@/server-actions/applications';
import { HowToReg, PersonRemove } from '@mui/icons-material';
import { Alert, Box, Button, FormControl, Modal, Stack, TextField } from '@mui/material';
import Form from 'next/form';
import { useActionState, useState } from 'react';

interface ApplyToTournamentButtonProps {
    tournamentId: string;
    participates: boolean;
    pastDate: boolean;
}

const initialState: ApplicationState = {
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

function ApplyToTournamentForm({ tournamentId, participates, pastDate }: ApplyToTournamentButtonProps) {
    const [state, formAction, isPending] = useActionState(tournamentApplicationAction, initialState);

    const buttonText = (() => {
        if (isPending) {
            return 'Loading...';
        }
        if (participates) {
            return 'Decline application';
        }
        if (pastDate) {
            return 'Applications closed';
        }
        return 'Apply';
    })();

    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
                <Button
                    variant={participates ? 'outlined' : 'contained'}
                    startIcon={participates ? <PersonRemove /> : <HowToReg />}
                    onClick={() => setIsOpen(true)}
                >
                    {participates ? 'Decline application' : 'Apply to participate'}
                </Button>
            </Box>
            <Modal open={isOpen} onClose={handleClose}>
                <Box sx={boxStyle}>
                    <Form action={formAction}>
                        <FormControl>
                            <Stack sx={{ justifyContent: 'center', gap: 2 }}>
                                <input type="hidden" hidden name="tournamentId" value={tournamentId} />
                                <input
                                    type="hidden"
                                    hidden
                                    name="participates"
                                    value={participates ? 'true' : 'false'}
                                />
                                <TextField
                                    name="licenseNumber"
                                    label="License number"
                                    fullWidth
                                    required={!participates}
                                    disabled={participates}
                                    id="licenseNumber"
                                    type="number"
                                    defaultValue={state?.inputs?.licenseNumber}
                                    error={state?.errors?.licenseNumber !== undefined}
                                    helperText={state?.errors?.licenseNumber?.[0]}
                                    color={state?.errors?.licenseNumber ? 'error' : 'primary'}
                                />
                                <TextField
                                    name="ranking"
                                    label="Ranking"
                                    fullWidth
                                    required={!participates}
                                    disabled={participates}
                                    id="ranking"
                                    type="number"
                                    defaultValue={state?.inputs?.ranking}
                                    error={state?.errors?.ranking !== undefined}
                                    helperText={state?.errors?.ranking?.[0]}
                                    color={state?.errors?.ranking ? 'error' : 'primary'}
                                />

                                <Button
                                    type="submit"
                                    variant={participates ? 'outlined' : 'contained'}
                                    disabled={isPending || pastDate}
                                    startIcon={participates ? <PersonRemove /> : <HowToReg />}
                                    color={state.message === '' ? 'primary' : 'error'}
                                >
                                    {buttonText}
                                </Button>

                                {state.message !== '' && (
                                    <Alert severity="error" sx={{ m: 1 }}>
                                        {state.message}
                                    </Alert>
                                )}
                            </Stack>
                        </FormControl>
                    </Form>
                </Box>
            </Modal>
        </>
    );
}

export default ApplyToTournamentForm;
