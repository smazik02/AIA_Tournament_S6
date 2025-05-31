'use server';

import { z } from 'zod';
import { updateTournament } from '@/data-access/tournaments';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '@/errors/errors';

const updateTournamentSchema = z
    .object({
        name: z.string().min(1, 'Name cannot be empty').optional(),
        time: z.coerce.date({ invalid_type_error: 'Invalid date format for tournament time' }).optional(),
        location: z.string().min(1, 'Location cannot be empty').optional(),
        maxParticipants: z.coerce
            .number()
            .int('Maximum participants must be an integer')
            .min(2, 'Participant limit cannot be below 2')
            .optional(),
        applicationDeadline: z.coerce
            .date({ invalid_type_error: 'Invalid date format for application deadline' })
            .optional(),
    })
    .refine(
        (data) => {
            if (data.applicationDeadline === undefined) return true;
            if (data.time === undefined) return true;
            return data.time > data.applicationDeadline;
        },
        {
            message: 'Tournament time must be after the application deadline',
            path: ['time'],
        },
    );

interface TournamentFormInputs {
    name?: string;
    time?: string;
    location?: string;
    maxParticipants?: string;
    applicationDeadline?: string;
}

export interface UpdateTournamentState {
    success: boolean;
    message: string;
    inputs?: TournamentFormInputs;
    errors?: Partial<Record<keyof TournamentFormInputs | '_form', string[]>>;
}

export async function updateTournamentAction(
    _: UpdateTournamentState | null,
    formData: FormData,
): Promise<UpdateTournamentState> {
    const tournamentId = (formData.get('id') as string | null) ?? undefined;
    if (tournamentId === undefined) {
        return {
            success: false,
            message: 'Tournament ID is missing.',
        };
    }

    const rawInputs: TournamentFormInputs = {
        name: (formData.get('name') as string | null) ?? undefined,
        time: (formData.get('time') as string | null) ?? undefined,
        location: (formData.get('location') as string | null) ?? undefined,
        maxParticipants: (formData.get('maxParticipants') as string | null) ?? undefined,
        applicationDeadline: (formData.get('applicationDeadline') as string | null) ?? undefined,
    };

    const validationResult = updateTournamentSchema.safeParse(rawInputs);
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

    try {
        await updateTournament(tournamentId, { ...validationResult.data });
    } catch (error: unknown) {
        console.error(error);
        const toReturn = { success: false, inputs: rawInputs };

        if (error instanceof UnauthorizedError) {
            redirect(`/auth/sign-in?callback=${encodeURI('/tournaments/update')}`);
        }
        if (error instanceof NotFoundError) {
            return { ...toReturn, message: 'Tournament does not seem to exist.' };
        }
        if (error instanceof ForbiddenError) {
            return { ...toReturn, message: 'You do not have permission to update this tournament.' };
        }
        if (error instanceof ValidationError) {
            return { ...toReturn, message: error.message };
        }
        return { ...toReturn, message: 'Something went wrong. Please try again later.' };
    }

    revalidatePath(`/`);
    redirect(`/tournament/${tournamentId}`);
}
