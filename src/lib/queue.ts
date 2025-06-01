import { Job, Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

// Configure your Redis connection details.
// It's best to use environment variables for these in a real application.
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null, // Important for BullMQ
});

// Define the queue name
const TOURNAMENT_PROCESSING_QUEUE_NAME = 'tournamentProcessing';

// Create the BullMQ queue instance
// This instance is used to ADD jobs to the queue.
export const tournamentProcessingQueue = new Queue(TOURNAMENT_PROCESSING_QUEUE_NAME, {
    connection,
});

// --- Mock Database ---
// In a real app, this would be your actual database (e.g., Prisma, MongoDB)
interface Tournament {
    id: string;
    name: string;
    applicationDeadline: Date;
    isProcessed?: boolean;
}
const mockTournamentsDB: Map<string, Tournament> = new Map();

// Function to simulate processing the tournament ladder.
// In a real application, this would contain your complex business logic.
async function processTournamentLadder(tournamentId: string) {
    console.log(`[WORKER] Processing tournament ladder for ID: ${tournamentId} at ${new Date().toISOString()}`);
    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // --- Mock DB Update ---
    const tournament = mockTournamentsDB.get(tournamentId);
    if (tournament) {
        tournament.isProcessed = true;
        mockTournamentsDB.set(tournamentId, tournament);
        console.log(`[WORKER] Tournament ID: ${tournamentId} marked as processed.`);
    } else {
        console.warn(`[WORKER] Tournament ID: ${tournamentId} not found in mock DB for processing.`);
    }
    // --- End Mock DB Update ---

    // TODO: Implement actual logic:
    // 1. Fetch tournament details from your database.
    // 2. Select the tournament ladder.
    // 3. Seed players according to their ranking.
    // 4. Update the tournament status in the database.
    console.log(`[WORKER] Finished processing tournament ID: ${tournamentId}`);
}

// This function initializes and starts the WORKER.
// It should be called ONLY in your dedicated worker process (e.g., worker.ts),
// NOT in your Next.js API routes or server-side code that runs on Vercel.
export function initializeWorker() {
    console.log('[WORKER] Initializing BullMQ Worker...');
    const worker = new Worker(
        TOURNAMENT_PROCESSING_QUEUE_NAME,
        async (job: Job) => {
            console.log(`[WORKER] Received job ID: ${job.id}, Data:`, job.data);
            if (job.name === 'processTournament') {
                const { tournamentId } = job.data;
                if (!tournamentId) {
                    console.error('[WORKER] Error: tournamentId missing in job data.', job.data);
                    throw new Error('tournamentId is required');
                }
                await processTournamentLadder(tournamentId as string);
            } else {
                console.warn(`[WORKER] Unknown job name: ${job.name}`);
            }
        },
        { connection },
    );

    worker.on('completed', (job: Job) => {
        console.log(`[WORKER] Job ID: ${job.id} (Name: ${job.name}) has completed.`);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
        if (job) {
            console.error(
                `[WORKER] Job ID: ${job.id} (Name: ${job.name}) has failed with error: ${err.message}`,
                err.stack,
            );
        } else {
            console.error(`[WORKER] A job has failed with error: ${err.message}`, err.stack);
        }
    });

    worker.on('error', (err: Error) => {
        console.error('[WORKER] BullMQ worker error:', err);
    });

    console.log('[WORKER] BullMQ Worker started and listening for jobs...');
    return worker;
}

// Helper function to add or update a tournament processing job
export async function scheduleTournamentProcessing(tournamentId: string, applicationDeadline: Date) {
    const jobId = `tournament-${tournamentId}`; // Use a consistent Job ID based on tournamentId

    // Calculate delay in milliseconds until the applicationDeadline
    const now = Date.now();
    const deadlineTime = new Date(applicationDeadline).getTime();
    const delay = deadlineTime - now;

    if (delay < 0) {
        console.warn(
            `[QUEUE] Application deadline for tournament ${tournamentId} is in the past. Job will not be scheduled with a delay, or might be processed immediately if delay is 0 or negative.`,
        );
    }

    const jobData = { tournamentId };
    const jobOptions = {
        jobId,
        delay: delay > 0 ? delay : 0,
        removeOnComplete: true,
        removeOnFail: { count: 5 },
    };

    const removedCount = await tournamentProcessingQueue.remove(jobId);
    if (removedCount > 0) {
        console.log(`[QUEUE] Removed existing job with ID ${jobId} to reschedule.`);
    }

    await tournamentProcessingQueue.add('processTournament', jobData, jobOptions);
    console.log(
        `[QUEUE] Scheduled/Updated job for tournament ${tournamentId} (Job ID: ${jobId}) to run at ${applicationDeadline.toISOString()} (delay: ${delay / 1000}s)`,
    );

    if (!mockTournamentsDB.has(tournamentId)) {
        mockTournamentsDB.set(tournamentId, {
            id: tournamentId,
            name: `Tournament ${tournamentId}`,
            applicationDeadline,
            isProcessed: false,
        });
        console.log(`[MOCK_DB] Added tournament ${tournamentId} to mock DB.`);
    } else {
        const existingTournament = mockTournamentsDB.get(tournamentId);
        if (existingTournament) {
            existingTournament.applicationDeadline = applicationDeadline;
            existingTournament.isProcessed = false;
            mockTournamentsDB.set(tournamentId, existingTournament);
            console.log(`[MOCK_DB] Updated tournament ${tournamentId} deadline in mock DB.`);
        }
    }
}
