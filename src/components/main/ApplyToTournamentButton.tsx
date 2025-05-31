'use client';

import { HowToReg } from '@mui/icons-material';
import { Alert, Box, Button } from '@mui/material';
import { useActionState } from 'react';
import { applyToTournamentAction, ApplyToTournamentState } from '@/server-actions/apply_to_tournament';
import Form from 'next/form';

interface ApplyToTournamentButtonProps {
    tournamentId: string;
    canParticipate: boolean;
}

const initialState: ApplyToTournamentState = {
    success: false,
    message: '',
};

function ApplyToTournamentButton({ tournamentId, canParticipate }: ApplyToTournamentButtonProps) {
    const [state, formAction, isPending] = useActionState(applyToTournamentAction, initialState);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
            <Form action={formAction}>
                <input type="hidden" hidden name="tournamentId" value={tournamentId} />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isPending || !canParticipate}
                    startIcon={<HowToReg />}
                    color={state.message === '' ? 'primary' : 'error'}
                >
                    {isPending ? 'Loading...' : 'Apply to participate'}
                </Button>
            </Form>
            {state.message !== '' && (
                <Alert severity="error" sx={{ m: 1 }}>
                    {state.message}
                </Alert>
            )}
        </Box>
    );
}

export default ApplyToTournamentButton;
