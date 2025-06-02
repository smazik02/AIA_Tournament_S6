import { Job, Worker } from 'bullmq';
import { QueuePayload } from './types';
import { BULLMQ_QUEUE_NAME } from './config/constants';
import { connection } from './queue';

async function processTournamentLadder(job: Job<QueuePayload>) {
    const { tournamentId, applicationDeadline, processingData } = job.data;
    console.log(
        `[WORKER] Processing tournament ID: ${tournamentId} (Job ID: ${job.id}) whose deadline was ${applicationDeadline}.`,
    );
    console.log(`[WORKER] Received processing data:`, processingData);

    // 1. Implement your ladder generation logic here.
    //    This logic uses 'tournamentId' and 'processingData'.
    //    It CANNOT access PostgreSQL directly.
    console.log(`[WORKER] Simulating ladder generation for tournament ${tournamentId}...`);
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate work

    // 2. After processing:
    //    If the Next.js app needs to be notified or data needs to be updated
    //    in PostgreSQL, this worker would make an API call to an endpoint
    //    on the Next.js app.
    //    Example:
    //    try {
    //      const ladderData = { ladder: "some_generated_ladder_structure" };
    //      await fetch(`http://localhost:3000/api/tournaments/${tournamentId}/processing-complete`, { // Next.js app URL
    //        method: 'POST',
    //        headers: { 'Content-Type': 'application/json', 'X-Worker-Api-Key': 'your_secret_key' },
    //        body: JSON.stringify({ status: 'completed', data: ladderData }),
    //      });
    //      console.log(`[WORKER] Notified Next.js app about completion for tournament ${tournamentId}`);
    //    } catch (error) {
    //      console.error(`[WORKER] Error notifying Next.js app for tournament ${tournamentId}:`, error);
    //    }

    console.log(`[WORKER] Finished processing tournament ID: ${tournamentId}`);
}

export function initializeBullMqWorker() {
    console.log('[WORKER] Initializing BullMQ Worker for queue:', BULLMQ_QUEUE_NAME);
    const worker = new Worker<QueuePayload>(BULLMQ_QUEUE_NAME, processTournamentLadder, {
        connection,
        concurrency: 5, // Process up to 5 jobs concurrently
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
