'use server';

import { applyToTournament } from '@/data-access/tournaments';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ConflictError, NotFoundError } from '@/errors/errors';

export interface ApplyToTournamentState {
    success: boolean;
    message: string;
}

export async function applyToTournamentAction(
    _: ApplyToTournamentState,
    formData: FormData,
): Promise<ApplyToTournamentState> {
    const tournamentId = formData.get('tournamentId') as string | null;
    if (tournamentId === null) {
        return { success: false, message: 'Tournament id was not provided' };
    }

    try {
        await applyToTournament(tournamentId);
    } catch (error: unknown) {
        console.error(error);

        if (error instanceof NotFoundError || error instanceof ConflictError) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'Something went wrong. Try again later.' };
    }
    revalidatePath('/');
    revalidatePath(`/tournament/${tournamentId}`);
    redirect(`/tournament/${tournamentId}`);
}
