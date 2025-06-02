import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { initializeBullMqWorker } from './worker';
import router from './routes';

const app = express();
app.use(bodyParser.json());
initializeBullMqWorker();

app.get('/health', (_req, res) => {
    res.status(200).send('Worker app is healthy.');
});

app.use('/api', router);

app.use((err: Error, _req: Request, res: Response, _: NextFunction) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).send('Something broke!');
});

export default app;
