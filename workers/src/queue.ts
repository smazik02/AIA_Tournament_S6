import Redis from 'ioredis';
import { BULLMQ_QUEUE_NAME, REDIS_QUEUE_HOST, REDIS_QUEUE_PORT } from './config/constants';
import { Queue } from 'bullmq';
import { QueuePayload } from './types';

export const connection = new Redis({
    host: REDIS_QUEUE_HOST,
    port: REDIS_QUEUE_PORT,
    maxRetriesPerRequest: null,
});

export const tournamentQueue = new Queue<QueuePayload>(BULLMQ_QUEUE_NAME, { connection });

export async function addOrUpdateTournamentJob(payload: QueuePayload) {
    const { tournamentId, applicationDeadline, processingData } = payload;
    const jobId = `tournament-${tournamentId}`;

    const now = Date.now();
    const deadlineTime = new Date(applicationDeadline).getTime();
    let delay = deadlineTime - now;

    if (delay < 0) {
        console.warn(
            `[QUEUE] Application deadline for tournament ${tournamentId} is in the past. Job will be processed almost immediately.`,
        );
        delay = 0; // Process ASAP if deadline passed
    }

    const jobData: QueuePayload = { tournamentId, applicationDeadline, processingData };

    // Remove existing job to ensure deadline update
    const TRIES_TO_REMOVE = 3; // BullMQ best practice, sometimes jobs are locked for a bit
    for (let i = 0; i < TRIES_TO_REMOVE; i++) {
        try {
            const jobsToRemove = await tournamentQueue.getJobs(['waiting', 'delayed', 'active', 'paused']);
            const jobToRemove = jobsToRemove.find((job) => job.opts.jobId === jobId);
            if (jobToRemove) {
                await jobToRemove.remove();
                console.log(`[QUEUE] Removed existing job ID ${jobId} to reschedule.`);
                break;
            }
            if (!jobToRemove && i === 0) break; // if not found on first try, it's likely not there
        } catch (err: any) {
            console.error(`[QUEUE] Error removing job ${jobId} (attempt ${i + 1}):`, err.message);
            if (i < TRIES_TO_REMOVE - 1)
                await new Promise((resolve) => setTimeout(resolve, 200)); // wait a bit
            else throw err; // re-throw if all attempts fail
        }
    }

    await tournamentQueue.add('processTournamentApplicationDeadline', jobData, {
        jobId,
        delay,
        removeOnComplete: true,
        removeOnFail: { count: 5 },
    });
}
