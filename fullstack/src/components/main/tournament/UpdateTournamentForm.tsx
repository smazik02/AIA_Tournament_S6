'use client';

import { TournamentFull } from '@/data-access/tournaments';
import { use, useActionState, useState } from 'react';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Alert, Box, Button, FormControl, Stack, TextField } from '@mui/material';
import Form from 'next/form';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { TournamentState, updateTournamentAction } from '@/server-actions/tournaments';

interface UpdateTournamentFormProps {
    tournament: Promise<TournamentFull | null>;
}

const initialState: TournamentState = {
    success: false,
    message: '',
};

function UpdateTournamentForm({ tournament }: UpdateTournamentFormProps) {
    const [state, formAction, isPending] = useActionState(updateTournamentAction, initialState);
    const [tournamentTimeError, setTournamentTimeError] = useState<string | null>('');
    const [applicationDeadlineError, setApplicationDeadlineError] = useState<string | null>('');

    const router = useRouter();

    const tournamentToEdit = use(tournament);

    if (tournamentToEdit === null) {
        router.push('/');
        return;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Form action={formAction}>
                    <FormControl>
                        <Stack sx={{ justifyContent: 'center', gap: 2 }}>
                            <input hidden name="id" defaultValue={tournamentToEdit.id} type="hidden" />
                            <TextField
                                name="name"
                                label="Name"
                                fullWidth
                                required
                                id="name"
                                type="text"
                                defaultValue={state?.inputs?.name ?? tournamentToEdit.name}
                                error={state?.errors?.name !== undefined}
                                helperText={state?.errors?.name?.[0]}
                                color={state?.errors?.name ? 'error' : 'primary'}
                            />
                            <DateTimePicker
                                name="time"
                                label="Time"
                                format="L HH:mm"
                                ampm={false}
                                slotProps={{
                                    textField: {
                                        helperText: tournamentTimeError,
                                    },
                                }}
                                minDateTime={dayjs(tournamentToEdit.time).set('second', 0)}
                                defaultValue={dayjs(state?.inputs?.time ?? tournamentToEdit.time)}
                                onError={(err) => setTournamentTimeError(err)}
                            />
                            <TextField
                                name="location"
                                label="Location"
                                fullWidth
                                required
                                id="location"
                                type="text"
                                defaultValue={state?.inputs?.location ?? tournamentToEdit.location}
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
                                defaultValue={state?.inputs?.maxParticipants ?? tournamentToEdit.maxParticipants}
                                error={state?.errors?.maxParticipants !== undefined}
                                helperText={state?.errors?.maxParticipants?.[0]}
                            />
                            <DateTimePicker
                                name="applicationDeadline"
                                label="Application deadline"
                                format="L HH:mm"
                                ampm={false}
                                slotProps={{
                                    textField: {
                                        helperText: applicationDeadlineError,
                                    },
                                }}
                                minDateTime={dayjs(tournamentToEdit.applicationDeadline).set('second', 0)}
                                maxDateTime={dayjs(tournamentToEdit.time)}
                                defaultValue={dayjs(
                                    state?.inputs?.applicationDeadline ?? tournamentToEdit.applicationDeadline,
                                )}
                                onError={(err) => setApplicationDeadlineError(err)}
                            />

                            <Button variant="contained" type="submit" disabled={isPending}>
                                {isPending ? 'Updating...' : 'Update'}
                            </Button>

                            {state.message && !state.success && <Alert severity="error">{state.message}</Alert>}
                        </Stack>
                    </FormControl>
                </Form>
            </Box>
        </LocalizationProvider>
    );
}

export default UpdateTournamentForm;
