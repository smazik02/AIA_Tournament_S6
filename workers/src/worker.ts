import { Job, Worker } from 'bullmq';
import { QueuePayload } from './types';
import { BULLMQ_QUEUE_NAME } from './config/constants';
import { connection } from './queue';

async function processTournamentLadder(job: Job<QueuePayload>) {
    const { tournamentId, applicationDeadline } = job.data;
    console.log(
        `[WORKER] Processing tournament ID: ${tournamentId} (Job ID: ${job.id}) whose deadline was ${applicationDeadline}.`,
    );
    console.log(`[WORKER] Simulating ladder generation for tournament ${tournamentId}...`);

    // try {
    //     await fetch(`http://localhost:3000/api/tournament/generate`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ tournamentId }),
    //     });
    // } catch (error: unknown) {
    //     console.error(`[WORKER] Error notifying Next.js app for tournament ${tournamentId}:`, error);
    // }

    console.log(`[WORKER] Finished processing tournament ID: ${tournamentId}`);
}

export function initializeBullMqWorker() {
    console.log('[WORKER] Initializing BullMQ Worker for queue:', BULLMQ_QUEUE_NAME);
    const worker = new Worker<QueuePayload>(BULLMQ_QUEUE_NAME, processTournamentLadder, {
        connection,
        concurrency: 50,
    });

    worker.on('completed', (job: Job) => {
        console.log(
            `[WORKER] Job ID: ${job.id} (Name: ${job.name}) for tournament ${job.data.tournamentId} has completed.`,
        );
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
        const tournamentId = job?.data?.tournamentId || 'unknown';
        console.error(
            `[WORKER] Job for tournament ${tournamentId} (ID: ${job?.id}, Name: ${job?.name}) has failed: ${err.message}`,
            err.stack,
        );
    });

    worker.on('error', (err: Error) => {
        console.error('[WORKER] BullMQ worker error:', err);
    });

    console.log('[WORKER] BullMQ Worker started.');
    return worker;
}
