'use server';

import { ForbiddenError, NotFoundError, UnauthorizedError } from '@/errors/errors';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';

export async function addTournamentSponsor(tournamentId: string, newSponsor: Prisma.SponsorUncheckedCreateInput) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new UnauthorizedError('User is not logged in.');
    }

    return prisma.$transaction(async (tx) => {
        const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } });
        if (tournament === null) {
            throw new NotFoundError(`Tournament doesn't exist.`);
        }

        const userId = session.user.id;
        if (tournament.organizerId !== userId) {
            throw new ForbiddenError('User cannot update this tournament');
        }

        await tx.sponsor.create({ data: { ...newSponsor, tournamentId } });
    });
}

export async function deleteTournamentSponsor(tournamentId: string, sponsorId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new UnauthorizedError('User is not logged in.');
    }

    return prisma.$transaction(async (tx) => {
        const userId = session.user.id;
        const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } });
        if (tournament === null) {
            throw new NotFoundError(`Tournament doesn't exist.`);
        }
        if (tournament.organizerId !== userId) {
            throw new ForbiddenError('User cannot update this tournament');
        }

        const sponsor = await tx.sponsor.findUnique({ where: { id: sponsorId } });
        if (!sponsor) {
            throw new NotFoundError(`Sponsor doesn't exist.`);
        }

        await tx.sponsor.delete({ where: { id: sponsorId } });
    });
}
