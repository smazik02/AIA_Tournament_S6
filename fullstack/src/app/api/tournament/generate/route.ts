import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateTournamentLadder } from '@/data-access/matches';
import { CustomError } from '@/errors/errors';

const validator = z.object({
    tournamentId: z.string({ required_error: 'tournamentId is required' }).min(1, 'tournamentId is required'),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
    const body = await req.json();
    const parsed = validator.safeParse(body);
    if (!parsed.success) {
        console.error(`[QUEUE] Request from queue is invalid: ${JSON.stringify(body)}`);
        return NextResponse.json({ message: parsed.error.message }, { status: 400 });
    }

    console.debug(`[QUEUE] ${parsed.data}`);

    try {
        await generateTournamentLadder(parsed.data.tournamentId);
        return NextResponse.json({ message: 'OK' }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof CustomError) {
            return NextResponse.json({ message: error.message }, { status: error.code });
        }

        console.error(error);
        return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
    }
}
