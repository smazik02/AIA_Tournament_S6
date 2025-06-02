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
    const { tournamentId, applicationDeadline } = payload;
    const jobId = `tournament-${tournamentId}`;

    const now = Date.now();
    const deadlineTime = new Date(applicationDeadline).getTime();
    let delay = deadlineTime - now;

    if (delay < 0) {
        console.warn(
            `[QUEUE] Application deadline for tournament ${tournamentId} is in the past. Job will be processed almost immediately.`,
        );
        delay = 0;
    }

    console.log(`[QUEUE] Application deadline for tournament ${tournamentId}, processing in ${delay / 1000}s`);

    const jobData: QueuePayload = { tournamentId, applicationDeadline };

    const TRIES_TO_REMOVE = 3;
    for (let i = 0; i < TRIES_TO_REMOVE; i++) {
        try {
            const jobsToRemove = await tournamentQueue.getJobs(['waiting', 'delayed', 'active', 'paused']);
            const jobToRemove = jobsToRemove.find((job) => job.opts.jobId === jobId);
            if (jobToRemove) {
                await jobToRemove.remove();
                console.log(`[QUEUE] Removed existing job ID ${jobId} to reschedule.`);
                break;
            }
            if (!jobToRemove && i === 0) break;
        } catch (err: unknown) {
            console.error(
                `[QUEUE] Error removing job ${jobId} (attempt ${i + 1}):`,
                err instanceof Error ? err.message : err,
            );
            if (i < TRIES_TO_REMOVE - 1) {
                await new Promise((resolve) => setTimeout(resolve, 200)); // wait a bit
            } else throw err;
        }
    }

    await tournamentQueue.add('processTournamentApplicationDeadline', jobData, {
        jobId,
        delay,
        removeOnComplete: true,
        removeOnFail: { count: 5 },
    });
}
