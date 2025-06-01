import { NextResponse } from 'next/server';
import { scheduleTournamentProcessing } from '@/lib/queue';

interface CreateTournamentRequestBody {
    tournamentId: string;
    applicationDeadline: string;
}

interface UpdateTournamentRequestBody {
    tournamentId: string;
    applicationDeadline: string;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as CreateTournamentRequestBody;
        const { tournamentId, applicationDeadline } = body;

        if (!tournamentId || !applicationDeadline) {
            return NextResponse.json(
                { message: 'tournamentId, name, and applicationDeadline are required.' },
                { status: 400 },
            );
        }

        const deadlineDate = new Date(applicationDeadline);
        if (isNaN(deadlineDate.getTime())) {
            return NextResponse.json({ message: 'Invalid applicationDeadline date format.' }, { status: 400 });
        }

        // TODO: Save tournament to your actual database here
        console.log(
            `[API_APP_ROUTER] Received request to CREATE tournament ID: ${tournamentId}, Deadline: ${deadlineDate.toISOString()}`,
        );

        await scheduleTournamentProcessing(tournamentId, deadlineDate);

        return NextResponse.json(
            { message: 'Tournament created and processing scheduled.', tournamentId },
            { status: 201 },
        );
    } catch (error: unknown) {
        console.error('[API_APP_ROUTER] Error creating tournament:', error);
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error creating tournament.', error: error }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = (await request.json()) as UpdateTournamentRequestBody;
        const { tournamentId, applicationDeadline } = body;

        if (!tournamentId || !applicationDeadline) {
            return NextResponse.json(
                { message: 'tournamentId and applicationDeadline are required for update.' },
                { status: 400 },
            );
        }

        const deadlineDate = new Date(applicationDeadline);
        if (isNaN(deadlineDate.getTime())) {
            return NextResponse.json({ message: 'Invalid applicationDeadline date format.' }, { status: 400 });
        }

        // TODO: Update tournament in your actual database here
        console.log(
            `[API_APP_ROUTER] Received request to UPDATE tournament ID: ${tournamentId}, New Deadline: ${deadlineDate.toISOString()}`,
        );

        await scheduleTournamentProcessing(tournamentId, deadlineDate);

        return NextResponse.json(
            { message: 'Tournament updated and processing rescheduled.', tournamentId },
            { status: 200 },
        );
    } catch (error: unknown) {
        console.error('[API_APP_ROUTER] Error updating tournament:', error);
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error updating tournament.', error: error }, { status: 500 });
    }
}
