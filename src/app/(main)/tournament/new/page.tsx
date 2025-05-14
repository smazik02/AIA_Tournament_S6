'use client';

import { Alert, Box, Button, FormControl, Stack, TextField } from '@mui/material';
import Form from 'next/form';
import { createTournament, CreateTournamentState } from '@/server-actions/tournaments';
import { useActionState } from 'react';

const initialState: CreateTournamentState = {
    success: false,
    message: '',
};

function NewTournamentPage() {
    const [state, formAction, isPending] = useActionState(createTournament, initialState);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Form action={formAction}>
                <FormControl>
                    <Stack sx={{ justifyContent: 'center', gap: 2 }}>
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
                            name="discipline"
                            label="Discipline"
                            fullWidth
                            required
                            id="discipline"
                            type="text"
                            defaultValue={state?.inputs?.discipline}
                            error={state?.errors?.discipline !== undefined}
                            helperText={state?.errors?.discipline?.[0]}
                            color={state?.errors?.discipline ? 'error' : 'primary'}
                        />

                        <Button variant="contained" type="submit" disabled={isPending}>
                            {isPending ? 'Creating...' : 'Create'}
                        </Button>

                        {state.message && <Alert severity="error">{state.message}</Alert>}
                    </Stack>
                </FormControl>
            </Form>
        </Box>
    );
}

export default NewTournamentPage;
