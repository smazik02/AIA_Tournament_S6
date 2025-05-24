'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createSchema = z.object({
    name: z.string({ required_error: 'Name missing' }),
    discipline: z.string({ required_error: 'Discipline missing' }),
    time: z.date({ required_error: 'Date missing', invalid_type_error: 'Invalid date' }),
    location: z.string({ required_error: 'Location missing' }),
    maxParticipants: z
        .number({ required_error: 'Max participants missing' })
        .min(2, 'Participant limit cannot be below 2'),
    applicationDeadline: z
        .date({ required_error: 'Date missing', invalid_type_error: 'Invalid date' })
        .min(new Date(), 'You cannot set deadlines in the past'),
});

interface TournamentFormData {
    name?: string;
    discipline?: string;
    time?: Date | string;
    location?: string;
    maxParticipants?: number;
    applicationDeadline?: Date | string;
}

export interface CreateTournamentState {
    success: boolean;
    message: string;
    inputs?: TournamentFormData;
    errors?: {
        [K in keyof TournamentFormData]?: string[];
    };
}

export async function createTournament(
    _: CreateTournamentState | null,
    formData: FormData,
): Promise<CreateTournamentState> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect('/auth/sign-in');
    }

    try {
        const receivedForm = {
            name: formData.get('name'),
            discipline: formData.get('discipline'),
            time: formData.get('time'),
            location: formData.get('location'),
            maxParticipants: formData.get('maxParticipants'),
            applicationDeadline: formData.get('applicationDeadline'),
        };
        console.log(`Date: ${receivedForm.time}`);
        const validateFields = createSchema.safeParse(receivedForm);
        if (!validateFields.success) {
            console.log('Validation failed ' + validateFields.error.flatten().fieldErrors.time?.[0]);
            return {
                success: false,
                message: 'There were errors during form validation!',
                inputs: {
                    name: (receivedForm.name ?? '') as string,
                    discipline: (receivedForm.discipline ?? '') as string,
                    time: (receivedForm.time ?? '') as string,
                    location: (receivedForm.location ?? '') as string,
                    maxParticipants: (receivedForm.maxParticipants ?? 0) as number,
                },
                errors: validateFields.error.flatten().fieldErrors,
            };
        }

        // const organizerId = session.user.id;
        return {
            success: true,
            message: '',
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_: unknown) {
        return {
            success: false,
            message: 'Unknown error occured!',
        };
    }
}
