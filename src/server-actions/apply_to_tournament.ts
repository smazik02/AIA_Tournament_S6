'use server';

import { applyToTournament, declineTournamentApplication } from '@/data-access/tournaments';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ConflictError, NotFoundError, UnauthorizedError } from '@/errors/errors';

export interface ApplyToTournamentState {
    success: boolean;
    message: string;
}

export async function applyToTournamentAction(
    _: ApplyToTournamentState,
    formData: FormData,
): Promise<ApplyToTournamentState> {
    const tournamentId = formData.get('tournamentId') as string | null;
    const participates = formData.get('participates') as string | null;
    if (tournamentId === null || participates === null) {
        return { success: false, message: 'Insufficient provided data' };
    }

    try {
        if (participates === 'true') {
            await declineTournamentApplication(tournamentId);
        } else {
            await applyToTournament(tournamentId);
        }
    } catch (error: unknown) {
        console.error(error);

        if (error instanceof UnauthorizedError) {
            redirect(`/auth/sign-in?callback=${encodeURI(`/tournaments/${tournamentId}`)}`);
        }
        if (error instanceof NotFoundError) {
            redirect('/');
        }
        if (error instanceof ConflictError) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'Something went wrong. Try again later.' };
    }
    revalidatePath('/');
    revalidatePath(`/tournament/${tournamentId}`);
    redirect(`/tournament/${tournamentId}`);
}
