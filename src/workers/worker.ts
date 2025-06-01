import { initializeWorker } from '@/lib/queue';

if (!process.env.REDIS_URL) {
    console.warn(
        '[WORKER] REDIS_URL environment variable is not set. Defaulting to redis://localhost:6379. Ensure Redis is running and accessible.',
    );
}

const workerInstance = initializeWorker();

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
signals.forEach((signal) => {
    process.on(signal, async () => {
        console.log(`[WORKER] Received ${signal}, shutting down BullMQ worker...`);
        if (workerInstance) {
            // Check if workerInstance was successfully initialized
            await workerInstance.close();
            console.log('[WORKER] BullMQ worker shut down gracefully.');
        } else {
            console.log('[WORKER] Worker instance not available for shutdown.');
        }
        process.exit(0);
    });
});

console.log('[WORKER] Worker process started. Waiting for jobs... (PID:', process.pid, ')');
// Keep the worker process alive. In production, use a process manager like PM2.
// This simple interval is just to prevent immediate exit in some environments.
setInterval(() => {}, 1 << 30);
