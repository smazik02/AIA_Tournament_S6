'use server';

import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '@/errors/errors';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';

export async function applyToTournament(
    id: string,
    licenseNumber: number | undefined,
    ranking: number | undefined,
): Promise<void> {
    if (licenseNumber === undefined) {
        throw new ValidationError('License number is required');
    }
    if (ranking === undefined) {
        throw new ValidationError('Ranking is required');
    }

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

        if (new Date() > new Date(tournament.applicationDeadline)) {
            throw new ConflictError(`Application deadline has passed.`);
        }

        const userId = session.user.id;
        const existingRegistration = tournament.participants.find((p) => p.userId === userId);
        if (existingRegistration !== undefined) {
            throw new ConflictError(`User already applied for the tournament.`);
        }

        const newParticipation: Prisma.TournamentParticipantUncheckedCreateInput = {
            licenseNumber,
            ranking,
            userId,
            tournamentId: id,
        };

        try {
            await tx.tournamentParticipant.create({ data: newParticipation });
        } catch (error: unknown) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictError('Ranking or license number are not unique.');
            }

            throw error;
        }
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

        if (new Date() > new Date(tournament.applicationDeadline)) {
            throw new ConflictError(`Application deadline has passed.`);
        }

        const userId = session.user.id;
        const existingRegistration = await tx.tournamentParticipant.findFirst({ where: { userId, tournamentId: id } });
        if (existingRegistration === null) {
            throw new ConflictError(`User is not participating in the tournament.`);
        }

        await tx.tournamentParticipant.delete({ where: { id: existingRegistration.id } });
    });
}
