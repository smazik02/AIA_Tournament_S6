'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const createTournamentSchema = z
    .object({
        name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
        discipline: z.string({ required_error: 'Discipline is required' }).min(1, 'Discipline cannot be empty'),
        time: z.coerce
            .date({
                required_error: 'Tournament date is required',
                invalid_type_error: 'Invalid date format for tournament time',
            })
            .min(new Date(), 'You cannot set deadlines in the past'),
        location: z.string({ required_error: 'Location is required' }).min(1, 'Location cannot be empty'),
        maxParticipants: z.coerce
            .number({ required_error: 'Maximum participants is required' })
            .int('Maximum participants must be an integer')
            .min(2, 'Participant limit cannot be below 2'),
        applicationDeadline: z.coerce
            .date({
                required_error: 'Application deadline is required',
                invalid_type_error: 'Invalid date format for application deadline',
            })
            .min(new Date(), 'You cannot set deadlines in the past'),
    })
    .refine(
        (data) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return data.applicationDeadline >= today;
        },
        {
            message: 'Application deadline cannot be in the past',
            path: ['applicationDeadline'],
        },
    )
    .refine(
        (data) => {
            return data.time > data.applicationDeadline;
        },
        {
            message: 'Tournament time must be after the application deadline',
            path: ['time'],
        },
    );

interface TournamentFormInputs {
    name?: string;
    discipline?: string;
    time?: string;
    location?: string;
    maxParticipants?: string;
    applicationDeadline?: string;
}

export interface CreateTournamentState {
    success: boolean;
    message: string;
    inputs?: TournamentFormInputs;
    errors?: {
        name?: string[];
        discipline?: string[];
        time?: string[];
        location?: string[];
        maxParticipants?: string[];
        applicationDeadline?: string[];
        _form?: string[];
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

    const rawInputs: TournamentFormInputs = {
        name: (formData.get('name') as string | null) ?? undefined,
        discipline: (formData.get('discipline') as string | null) ?? undefined,
        time: (formData.get('time') as string | null) ?? undefined,
        location: (formData.get('location') as string | null) ?? undefined,
        maxParticipants: (formData.get('maxParticipants') as string | null) ?? undefined,
        applicationDeadline: (formData.get('applicationDeadline') as string | null) ?? undefined,
    };

    const validationResult = createTournamentSchema.safeParse(rawInputs);
    if (!validationResult.success) {
        const flattenedErrors = validationResult.error.flatten();
        console.log('Validation failed:', flattenedErrors.fieldErrors);
        return {
            success: false,
            message: 'Form validation failed. Please check your inputs.',
            inputs: rawInputs,
            errors: flattenedErrors.fieldErrors,
        };
    }

    const organizerId = session.user.id;
    await prisma.tournament.create({ data: { ...validationResult.data, organizerId } });

    redirect('/');
}
