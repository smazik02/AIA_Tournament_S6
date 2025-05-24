'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Prisma, Tournament } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '@/errors/errors';

interface PaginationInfo {
    skip: number;
    take: number;
}

export async function getAllTournamentsPaged({ skip, take }: PaginationInfo): Promise<Tournament[]> {
    return prisma.tournament.findMany({ skip, take });
}

export async function getTournamentsCount(): Promise<number> {
    return prisma.tournament.count();
}

export async function getTournament(id: string): Promise<Tournament | null> {
    return prisma.tournament.findUnique({ where: { id } });
}

export async function createTournament(tournament: Prisma.TournamentUncheckedCreateInput): Promise<Tournament> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect('/auth/sign-in');
    }

    const organizerId = session.user.id;
    return prisma.tournament.create({ data: { ...tournament, organizerId } });
}

export async function updateTournament(id: string, updatedFields: Prisma.TournamentUpdateInput): Promise<Tournament> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect('/auth/sign-in');
    }

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
        throw new NotFoundError(`Tournament with id ${id} doesn't exist`);
    }

    const userId = session.user.id;
    if (tournament.organizerId !== userId) {
        throw new ForbiddenError('User cannot edit this tournament');
    }

    return prisma.tournament.update({ where: { id }, data: updatedFields });
}
