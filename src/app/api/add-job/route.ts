import { NextResponse } from 'next/server';
import { sampleQueue } from '@/workers/worker';

export async function GET() {
    const data = {
        // any serializable data you want to provide for the job
        // for this example, we'll provide a message
        message: 'This is a sample job',
    };
    await sampleQueue.add('someJob', data);
    return NextResponse.json({ status: 'Message added to the queue' });
}
