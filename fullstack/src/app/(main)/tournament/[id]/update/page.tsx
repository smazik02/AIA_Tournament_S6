import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTournament } from '@/data-access/tournaments';
import { Suspense } from 'react';
import UpdateTournamentForm from '@/components/main/tournament/UpdateTournamentForm';

export const metadata: Metadata = {
    title: 'Edit tournament',
};

interface UpdateTournamentPageProps {
    params: Promise<{ id: string }>;
}

async function UpdateTournamentPage({ params }: UpdateTournamentPageProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect('/auth/sign-in');
    }

    const { id } = await params;
    const tournament = getTournament(id);

    return (
        <Suspense fallback={<h1>Loading...</h1>}>
            <UpdateTournamentForm tournament={tournament} />
        </Suspense>
    );
}

export default UpdateTournamentPage;
