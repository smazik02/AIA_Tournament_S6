import { Router } from 'express';
import { QueuePayload } from './types';
import { addOrUpdateTournamentJob } from './queue';

const router = Router();

router.post('/tournament', async (req, res) => {
    try {
        const payload = req.body as QueuePayload;

        if (!payload.tournamentId || !payload.applicationDeadline) {
            res.status(400).json({ message: 'tournamentId and applicationDeadline are required.' });
            return;
        }

        const deadlineDate = new Date(payload.applicationDeadline);
        if (isNaN(deadlineDate.getTime())) {
            res.status(400).json({ message: 'Invalid applicationDeadline date format.' });
            return;
        }

        await addOrUpdateTournamentJob(payload);

        res.status(202).json({
            message: 'Tournament processing scheduled successfully.',
            tournamentId: payload.tournamentId,
        });
    } catch (error: any) {
        console.error('[API /schedule/tournament] Error:', error);
        res.status(500).json({ message: 'Failed to schedule tournament processing.', error: error.message });
    }
});

export default router;
