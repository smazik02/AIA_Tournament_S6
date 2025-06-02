export interface QueuePayload {
    tournamentId: string;
    applicationDeadline: string; // ISO string
    // Add any other data the worker needs to process the job,
    // e.g., player rankings, tournament settings.
    // For now, we'll keep it simple.
    processingData?: Record<string, any>;
}
