export const REDIS_QUEUE_HOST = process.env.REDIS_QUEUE_HOST || 'localhost';
export const REDIS_QUEUE_PORT = process.env.REDIS_QUEUE_PORT ? parseInt(process.env.REDIS_QUEUE_PORT) : 6379;

export const BULLMQ_QUEUE_NAME = 'tournamentProcessingWorkerQueue';

export const PORT = 3001;
