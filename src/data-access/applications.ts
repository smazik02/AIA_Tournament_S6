'use server';

import { ConflictError, NotFoundError, UnauthorizedError } from '@/errors/errors';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';

export async function applyToTournament(id: string): Promise<void> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new UnauthorizedError('User is not logged in.');
    }

    return prisma.$transaction(async (tx) => {
        const tournament = await tx.tournament.findUnique({ where: { id }, include: { participants: true } });
        if (tournament === null) {
            throw new NotFoundError(`Tournament doesn't exist.`);
        }

        if (tournament.participants.length + 1 > tournament.maxParticipants) {
            throw new ConflictError(`Tournament is full.`);
        }

        const userId = session.user.id;
        const existingRegistration = tournament.participants.find((p) => p.userId === userId);
        if (existingRegistration !== undefined) {
            throw new ConflictError(`User already applied for the tournament.`);
        }

        const newParticipation: Prisma.TournamentParticipantsUncheckedCreateInput = {
            licenseNumber: 1,
            ranking: 1,
            userId,
            tournamentId: id,
        };

        await tx.tournamentParticipants.create({ data: newParticipation });
    });
}

export async function declineTournamentApplication(id: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new UnauthorizedError('User is not logged in.');
    }

    return prisma.$transaction(async (tx) => {
        const tournament = await tx.tournament.findUnique({ where: { id } });
        if (tournament === null) {
            throw new NotFoundError(`Tournament doesn't exist.`);
        }

        const userId = session.user.id;
        const existingRegistration = await tx.tournamentParticipants.findFirst({ where: { userId, tournamentId: id } });
        if (existingRegistration === null) {
            throw new ConflictError(`User is not participating in the tournament.`);
        }

        await tx.tournamentParticipants.delete({ where: { id: existingRegistration.id } });
    });
}
