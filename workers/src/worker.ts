import { Job, Worker } from 'bullmq';
import { connection } from './queue';
import path from 'node:path/posix';

let worker: Worker;

const processorPath = path.join(__dirname, 'job.processor.js');

export function setUpWorker(): void {
    worker = new Worker('queue', processorPath, { connection, autorun: true });

    worker.on('completed', (job: Job, returnvalue: 'DONE') => {
        console.debug(`Completed job with id ${job.id}`, returnvalue);
    });

    worker.on('active', (job: Job<unknown>) => {
        console.debug(`Completed job with id ${job.id}`);
    });

    worker.on('error', (failedReason: Error) => {
        console.error(`Job encountered an error`, failedReason);
    });
}
