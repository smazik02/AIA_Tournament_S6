'use server';

import prisma from '@/lib/prisma';
import { ConflictError, NotFoundError } from '@/errors/errors';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface PlayerInfo {
    userId?: string;
    description?: string;
}

export type MatchWithTournament = Prisma.MatchGetPayload<{
    include: {
        tournament: true;
        player1: { select: { id: true; name: true } };
        player2: { select: { id: true; name: true } };
    };
}>;

export async function generateTournamentLadder(tournamentId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
        const tournament = await tx.tournament.findUnique({
            where: { id: tournamentId },
            include: {
                participants: {
                    orderBy: {
                        ranking: 'asc',
                    },
                },
            },
        });
        if (tournament === null) {
            console.debug(`[LADDER_GEN] Request for nonexistent tournament: ${tournamentId}`);
            throw new NotFoundError(`Tournament with id ${tournamentId} doesn't exist`);
        }

        if (tournament.participants.length < 2) {
            throw new ConflictError('Tournament has less than 2 participants.');
        }

        const participantsSorted = tournament.participants;
        const numParticipants = participantsSorted.length;

        let currentRoundPlayerInfos: PlayerInfo[] = [];
        if (numParticipants % 2 !== 0) {
            for (let i = 0; i < numParticipants - 2; i++) {
                currentRoundPlayerInfos.push({ userId: participantsSorted[i].userId });
            }

            const weakestPlayer = participantsSorted[numParticipants - 1];
            const secondWeakestPlayer = participantsSorted[numParticipants - 2];

            const prelimMatch = await tx.match.create({
                data: {
                    tournamentId: tournament.id,
                    date: tournament.time,
                    player1Id: weakestPlayer.userId,
                    player2Id: secondWeakestPlayer.userId,
                },
            });

            currentRoundPlayerInfos.push({ description: `Winner of Match ${prelimMatch.number}` });
        } else {
            participantsSorted.forEach((p) => {
                currentRoundPlayerInfos.push({ userId: p.userId });
            });
        }

        while (currentRoundPlayerInfos.length > 1) {
            const nextRoundPlayerInfos: PlayerInfo[] = [];
            const numMatchesInThisRound = currentRoundPlayerInfos.length / 2;

            for (let i = 0; i < numMatchesInThisRound; i++) {
                const player1Info = currentRoundPlayerInfos[i];
                const player2Info = currentRoundPlayerInfos[currentRoundPlayerInfos.length - 1 - i];

                const matchCreateInput: Prisma.MatchUncheckedCreateInput = {
                    tournamentId: tournament.id,
                    date: tournament.time,
                    player1Id: null,
                    player1Description: '',
                    player2Id: null,
                    player2Description: '',
                };

                if (player1Info.userId) {
                    matchCreateInput.player1Id = player1Info.userId;
                } else {
                    matchCreateInput.player1Description = player1Info.description!;
                }

                if (player2Info.userId) {
                    matchCreateInput.player2Id = player2Info.userId;
                } else {
                    matchCreateInput.player2Description = player2Info.description!;
                }

                const newMatch = await tx.match.create({ data: matchCreateInput });

                nextRoundPlayerInfos.push({ description: `Winner of Match ${newMatch.number}` });
            }
            currentRoundPlayerInfos = nextRoundPlayerInfos;
        }
    });
}

export async function getAllPlayerMatches(): Promise<MatchWithTournament[]> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect('/auth/sign-in');
    }

    const userId = session.user.id;
    return prisma.match.findMany({
        where: { OR: [{ player1Id: userId }, { player2Id: userId }] },
        include: {
            tournament: true,
            player1: { select: { id: true, name: true } },
            player2: { select: { id: true, name: true } },
        },
    });
}
