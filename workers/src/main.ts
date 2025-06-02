import express, { NextFunction, Request, Response, Router } from 'express';
import bodyParser from 'body-parser';
import { addJobToQueue } from './queue';

const PORT = 3001;

const app = express();

const router = Router();
router.get('/', async (req: Request, res: Response) => {
    const data = { message: 'This is a sample job' };
    // await sampleQueue.add('sampleQueue', data);
    // res.status(200).json({ status: 'Message added to queue' });
    const job = await addJobToQueue(data);
    res.status(200).json({ status: 'Message added to queue', jobId: job.id });
});

app.use(bodyParser.json());
app.use(router);

app.use((error: Error, req: Request, res: Response, _: NextFunction) => {
    console.error(error.message);
    res.status(500).send(error.message);
    return;
});

app.listen(PORT, (err) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log(`App listening on http://localhost:${PORT}`);
});
