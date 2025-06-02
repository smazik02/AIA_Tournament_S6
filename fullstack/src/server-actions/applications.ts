'use server';

import { applyToTournament, declineTournamentApplication } from '@/data-access/applications';
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '@/errors/errors';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { tournamentApplicationSchema } from './schemas';

interface ApplicationFormInputs {
    tournamentId?: string;
    participates?: string;
    licenseNumber?: string;
    ranking?: string;
}

export interface ApplicationState {
    success: boolean;
    message: string;
    inputs?: ApplicationFormInputs;
    errors?: Partial<Record<keyof ApplicationFormInputs | '_form', string[]>>;
}

export async function tournamentApplicationAction(_: ApplicationState, formData: FormData): Promise<ApplicationState> {
    const rawInputs: ApplicationFormInputs = {
        tournamentId: formData.get('tournamentId') !== null ? `${formData.get('tournamentId')}` : undefined,
        participates: formData.get('participates') !== null ? `${formData.get('participates')}` : undefined,
        licenseNumber: formData.get('licenseNumber') !== null ? `${formData.get('licenseNumber')}` : undefined,
        ranking: formData.get('ranking') !== null ? `${formData.get('ranking')}` : undefined,
    };

    const validationResult = tournamentApplicationSchema.safeParse(rawInputs);
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

    const { tournamentId, participates, licenseNumber, ranking } = validationResult.data;
    try {
        if (participates) {
            await declineTournamentApplication(tournamentId);
        } else {
            await applyToTournament(tournamentId, licenseNumber, ranking);
        }
    } catch (error: unknown) {
        if (error instanceof UnauthorizedError) {
            redirect(`/auth/sign-in?callback=${encodeURI(`/tournaments/${tournamentId}`)}`);
        }
        if (error instanceof NotFoundError) {
            redirect('/');
        }
        if (error instanceof ConflictError || error instanceof ValidationError) {
            return { success: false, message: error.message };
        }
        console.error(error);
        return { success: false, message: 'Something went wrong. Try again later.' };
    }
    revalidatePath('/');
    revalidatePath(`/tournament/${tournamentId}`);
    redirect(`/tournament/${tournamentId}`);
}
