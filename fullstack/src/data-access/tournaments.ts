'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Prisma, Tournament } from '@prisma/client';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '@/errors/errors';

interface PaginationInfo {
    skip: number;
    take: number;
}

export type TournamentFull = Prisma.TournamentGetPayload<{
    include: { participants: true; organizer: true; sponsors: true };
}>;

export async function getAllTournamentsPaged({ skip, take }: PaginationInfo): Promise<Tournament[]> {
    return prisma.tournament.findMany({ skip, take });
}

export async function getTournamentsCount(): Promise<number> {
    return prisma.tournament.count();
}

export async function getTournament(id: string): Promise<TournamentFull | null> {
    return prisma.tournament.findUnique({
        where: { id },
        include: { participants: true, organizer: true, sponsors: true },
    });
}

export async function createTournament(tournament: Prisma.TournamentUncheckedCreateInput): Promise<Tournament> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new UnauthorizedError('User is not logged in.');
    }

    const organizerId = session.user.id;
    const newTournament = await prisma.tournament.create({ data: { ...tournament, organizerId } });

    const res = await fetch(`http://localhost:3001/api/tournament`, {
        method: 'POST',
        body: JSON.stringify({
            tournamentId: newTournament.id,
            applicationDeadline: newTournament.applicationDeadline.toISOString(),
        }),
        headers: { 'Content-Type': 'application/json' },
    });
    if (res.status !== 202) {
        const body = await res.json();
        throw new ConflictError(body.message ?? 'Something went wrong. Please try again later.');
    }

    return newTournament;
}

export async function updateTournament(id: string, updatedFields: Prisma.TournamentUpdateInput): Promise<Tournament> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new UnauthorizedError('User is not logged in.');
    }

    return prisma.$transaction(async (tx) => {
        const tournament = await tx.tournament.findUnique({ where: { id }, include: { participants: true } });
        if (tournament === null) {
            throw new NotFoundError(`Tournament with id ${id} doesn't exist`);
        }

        const userId = session.user.id;
        if (tournament.organizerId !== userId) {
            throw new ForbiddenError('User cannot update this tournament');
        }

        if (tournament.participants.length > ((updatedFields.maxParticipants as number | undefined) ?? 0)) {
            throw new ValidationError('Tournament has more participants than new max limit.');
        }

        if (updatedFields.time !== undefined && updatedFields.applicationDeadline !== undefined) {
            const newTournamentTime = new Date(updatedFields.time.toString());
            const newApplicationDeadline = new Date(updatedFields.applicationDeadline.toString());
            if (newTournamentTime < newApplicationDeadline) {
                throw new ValidationError("Application deadline has to be before tournament's time.");
            }
        }

        if (updatedFields.time !== undefined) {
            const newTournamentTime = new Date(updatedFields.time.toString());
            if (newTournamentTime < tournament.applicationDeadline) {
                throw new ValidationError("Application deadline has to be before tournament's time.");
            }
        }

        if (updatedFields.applicationDeadline !== undefined) {
            const newApplicationDeadline = new Date(updatedFields.applicationDeadline.toString());
            if (newApplicationDeadline > tournament.time) {
                throw new ValidationError("Application deadline has to be before tournament's time.");
            }
        }

        const updatedTournament = tx.tournament.update({ where: { id }, data: updatedFields });

        if (updatedFields.applicationDeadline !== undefined) {
            const res = await fetch(`http://localhost:3001/api/tournament`, {
                method: 'POST',
                body: JSON.stringify({
                    tournamentId: tournament.id,
                    applicationDeadline: updatedFields.applicationDeadline,
                }),
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.status !== 202) {
                const body = await res.json();
                throw new ConflictError(body.message ?? 'Something went wrong. Please try again later.');
            }
        }

        return updatedTournament;
    });
}
