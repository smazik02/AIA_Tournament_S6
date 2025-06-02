import Redis from 'ioredis';
import { REDIS_QUEUE_HOST, REDIS_QUEUE_PORT } from './config/constants';
import { Job, JobsOptions, Queue } from 'bullmq';
import { setUpWorker } from './worker';

export const connection = new Redis({
    host: REDIS_QUEUE_HOST,
    port: REDIS_QUEUE_PORT,
    maxRetriesPerRequest: null,
});

const DEFAULT_REMOVE_CONFIG: JobsOptions = {
    removeOnComplete: {
        age: 3600,
    },
    removeOnFail: {
        age: 24 * 3600,
    },
};

export const queue = new Queue('queue', { connection });

export async function addJobToQueue<T>(data: T): Promise<Job<T>> {
    return queue.add('job', data, DEFAULT_REMOVE_CONFIG);
}

setUpWorker();
