'use server';

import { z } from 'zod';
import { addTournamentSponsor, deleteTournamentSponsor } from '@/data-access/tournaments';
import { revalidatePath } from 'next/cache';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@/errors/errors';
import { redirect } from 'next/navigation';

const tournamentSponsorSchema = z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
    logoUrl: z.string({ required_error: 'Logo URL is required' }).min(1, 'Logo URL cannot be empty'),
    tournamentId: z.string({ required_error: 'Tournament ID is required' }).min(1, 'Tournament ID cannot be empty'),
});

interface SponsorFormInputs {
    name?: string;
    logoUrl?: string;
    tournamentId?: string;
}

export interface TournamentSponsorState {
    success: boolean;
    message: string;
    inputs?: SponsorFormInputs;
    errors?: Partial<Record<keyof SponsorFormInputs | '_form', string[]>>;
}

export async function addTournamentSponsorAction(
    _: TournamentSponsorState | null,
    formData: FormData,
): Promise<TournamentSponsorState> {
    const rawInputs: SponsorFormInputs = {
        name: (formData.get('name') as string | null) ?? undefined,
        logoUrl: (formData.get('logoUrl') as string | null) ?? undefined,
        tournamentId: (formData.get('tournamentId') as string | null) ?? undefined,
    };

    const validationResult = tournamentSponsorSchema.safeParse(rawInputs);
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
        await addTournamentSponsor(validationResult.data.tournamentId, validationResult.data);
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof UnauthorizedError) {
            redirect(`/auth/sign-in?callback=${encodeURI(`/tournaments/${validationResult.data.tournamentId}`)}`);
        }
        if (error instanceof ForbiddenError) {
            return {
                success: false,
                message: 'You do not have permission to update this tournament.',
                inputs: rawInputs,
            };
        }
        if (error instanceof NotFoundError) {
            return {
                success: false,
                message: 'Tournament does not seem to exist.',
                inputs: rawInputs,
            };
        }
        return {
            success: false,
            message: 'Something went wrong. Please try again later.',
            inputs: rawInputs,
        };
    }

    revalidatePath(`/tournament/${validationResult.data.tournamentId}`);
    return {
        success: true,
        message: 'Sponsor added.',
    };
}

export async function deleteTournamentSponsorAction(tournamentId: string, sponsorId: string): Promise<void> {
    try {
        await deleteTournamentSponsor(tournamentId, sponsorId);
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof UnauthorizedError) {
            redirect(`/auth/sign-in?callback=${encodeURI(`/tournaments/${tournamentId}`)}`);
        }
        if (error instanceof NotFoundError) {
            redirect('/');
        }
    } finally {
        revalidatePath(`/tournament/${tournamentId}`);
    }
}
