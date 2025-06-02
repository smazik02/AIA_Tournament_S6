'use server';

import { createTournament, updateTournament } from '@/data-access/tournaments';
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '@/errors/errors';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createTournamentSchema, updateTournamentSchema } from './schemas';

interface TournamentFormInputs {
    name?: string;
    discipline?: string;
    time?: string;
    location?: string;
    maxParticipants?: string;
    applicationDeadline?: string;
}

export interface TournamentState {
    success: boolean;
    message: string;
    inputs?: TournamentFormInputs;
    errors?: Partial<Record<keyof TournamentFormInputs | '_form', string[]>>;
}

export async function createTournamentAction(_: TournamentState | null, formData: FormData): Promise<TournamentState> {
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

    let newTournament;
    try {
        newTournament = await createTournament({ ...validationResult.data, organizerId: '' });
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof UnauthorizedError) {
            redirect(`/auth/sign-in?callback=${encodeURI('/tournament/create')}`);
        }
        return {
            success: false,
            message: 'Something went wrong. Please try again later.',
        };
    }
    revalidatePath(`/`);
    redirect(`/tournament/${newTournament?.id}`);
}

export async function updateTournamentAction(_: TournamentState | null, formData: FormData): Promise<TournamentState> {
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
        if (error instanceof ForbiddenError) {
            return { ...toReturn, message: 'You do not have permission to update this tournament.' };
        }
        if (error instanceof NotFoundError) {
            return { ...toReturn, message: 'Tournament does not seem to exist.' };
        }
        if (error instanceof ValidationError) {
            return { ...toReturn, message: error.message };
        }
        return { ...toReturn, message: 'Something went wrong. Please try again later.' };
    }

    revalidatePath(`/`);
    redirect(`/tournament/${tournamentId}`);
}
