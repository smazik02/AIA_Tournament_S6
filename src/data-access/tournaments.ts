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
    return prisma.tournament.create({ data: { ...tournament, organizerId } });
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

        return tx.tournament.update({ where: { id }, data: updatedFields });
    });
}

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
