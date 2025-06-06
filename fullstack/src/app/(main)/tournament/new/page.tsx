'use client';

import { Alert, Box, Button, FormControl, Stack, TextField } from '@mui/material';
import Form from 'next/form';
import { useActionState, useEffect, useState } from 'react';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createTournamentAction, TournamentState } from '@/server-actions/tournaments';
import FormContainer from '@/components/form/FormContainer';
import FormCard from '@/components/form/FormCard';

const initialState: TournamentState = {
    success: false,
    message: '',
};

function NewTournamentPage() {
    const [state, formAction, isPending] = useActionState(createTournamentAction, initialState);
    const [tournamentTimeError, setTournamentTimeError] = useState<string | null>('');
    const [applicationDeadlineError, setApplicationDeadlineError] = useState<string | null>('');

    useEffect(() => {
        document.title = 'Create tournament';
    }, []);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <FormContainer sx={{ direction: 'column', justifyContent: 'space-between', height: 'auto' }}>
                <FormCard variant="outlined">
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
                                    <DateTimePicker
                                        name="time"
                                        label="Time"
                                        disablePast
                                        format="L HH:mm"
                                        ampm={false}
                                        slotProps={{
                                            textField: {
                                                helperText: tournamentTimeError,
                                            },
                                        }}
                                        defaultValue={dayjs(
                                            state?.inputs?.time ??
                                                new Date().setHours(new Date().getHours() + 1, 0, 0, 0),
                                        )}
                                        onError={(err) => setTournamentTimeError(err)}
                                    />
                                    <TextField
                                        name="location"
                                        label="Location"
                                        fullWidth
                                        required
                                        id="location"
                                        type="text"
                                        defaultValue={state?.inputs?.location}
                                        error={state?.errors?.location !== undefined}
                                        helperText={state?.errors?.location?.[0]}
                                        color={state?.errors?.location ? 'error' : 'primary'}
                                    />
                                    <TextField
                                        name="maxParticipants"
                                        label="Max Participants"
                                        fullWidth
                                        required
                                        id="max_participants"
                                        type="number"
                                        defaultValue={state?.inputs?.maxParticipants}
                                        error={state?.errors?.maxParticipants !== undefined}
                                        helperText={state?.errors?.maxParticipants?.[0]}
                                    />
                                    <DateTimePicker
                                        name="applicationDeadline"
                                        label="Application deadline"
                                        disablePast
                                        format="L HH:mm"
                                        ampm={false}
                                        slotProps={{
                                            textField: {
                                                helperText: applicationDeadlineError,
                                            },
                                        }}
                                        defaultValue={dayjs(
                                            state?.inputs?.applicationDeadline ??
                                                new Date().setHours(new Date().getHours() + 1, 0, 0, 0),
                                        )}
                                        onError={(err) => setApplicationDeadlineError(err)}
                                    />

                                    <Button variant="contained" type="submit" disabled={isPending}>
                                        {isPending ? 'Creating...' : 'Create'}
                                    </Button>

                                    {state.message && !state.success && <Alert severity="error">{state.message}</Alert>}
                                </Stack>
                            </FormControl>
                        </Form>
                    </Box>
                </FormCard>
            </FormContainer>
        </LocalizationProvider>
    );
}

export default NewTournamentPage;
