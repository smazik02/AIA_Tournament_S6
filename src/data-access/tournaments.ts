'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
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

    const tournament = await prisma.tournament.findUnique({ where: { id }, include: { participants: true } });
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

    return prisma.tournament.update({ where: { id }, data: updatedFields });
}

export async function applyToTournament(id: string): Promise<void> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect(`/auth/sign-in?callback=${encodeURI(`/tournaments/${id}`)}`);
    }

    const tournament = await prisma.tournament.findUnique({ where: { id }, include: { participants: true } });
    if (tournament === null) {
        throw new NotFoundError(`Tournament doesn't exist.`);
    }

    if (tournament.participants.length + 1 > tournament.maxParticipants) {
        throw new ConflictError(`Tournament is full.`);
    }

    const userId = session.user.id;

    const existingRegistration = await prisma.tournamentParticipants.findFirst({ where: { userId, tournamentId: id } });
    if (existingRegistration !== null) {
        throw new ConflictError(`User already applied for the tournament.`);
    }

    const newParticipation: Prisma.TournamentParticipantsUncheckedCreateInput = {
        licenseNumber: 1,
        ranking: 1,
        userId,
        tournamentId: id,
    };

    await prisma.tournamentParticipants.create({ data: newParticipation });
}

export async function addTournamentSponsor(tournamentId: string, newSponsor: Prisma.SponsorUncheckedCreateInput) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect(`/auth/sign-in?callback=${encodeURI(`/tournaments/${tournamentId}`)}`);
    }

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (tournament === null) {
        throw new NotFoundError(`Tournament doesn't exist.`);
    }

    const userId = session.user.id;
    if (tournament.organizerId !== userId) {
        throw new ForbiddenError('User cannot update this tournament');
    }

    await prisma.sponsor.create({ data: { ...newSponsor, tournamentId } });
}
