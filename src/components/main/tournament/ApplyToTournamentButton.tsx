'use client';

import { HowToReg, PersonRemove } from '@mui/icons-material';
import { Alert, Box, Button } from '@mui/material';
import { useActionState } from 'react';
import { applyToTournamentAction, ApplyToTournamentState } from '@/server-actions/apply_to_tournament';
import Form from 'next/form';

interface ApplyToTournamentButtonProps {
    tournamentId: string;
    participates: boolean;
}

const initialState: ApplyToTournamentState = {
    success: false,
    message: '',
};

function ApplyToTournamentButton({ tournamentId, participates }: ApplyToTournamentButtonProps) {
    const [state, formAction, isPending] = useActionState(applyToTournamentAction, initialState);

    const buttonText = (() => {
        if (isPending) {
            return 'Loading...';
        }
        if (participates) {
            return 'Decline application';
        }
        return 'Apply to participate';
    })();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
            <Form action={formAction}>
                <input type="hidden" hidden name="tournamentId" value={tournamentId} />
                <input type="hidden" hidden name="participates" value={participates ? 'true' : 'false'} />
                <Button
                    type="submit"
                    variant={participates ? 'outlined' : 'contained'}
                    disabled={isPending}
                    startIcon={participates ? <PersonRemove /> : <HowToReg />}
                    color={state.message === '' ? 'primary' : 'error'}
                >
                    {buttonText}
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
