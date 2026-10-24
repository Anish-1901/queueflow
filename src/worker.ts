import { Worker, Job } from 'bullmq';
import { query } from './db';

const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

const processJob = async (job: Job) => {
    const { id } = job.data;
    console.log(`[Worker] Start job ${id}`);

    // Update status to processing
    await query('UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2', ['processing', id]);

    // Simulate long running task (2-5 seconds)
    const delay = Math.floor(Math.random() * 3000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulate random failure (20%)
    if (Math.random() < 0.2) {
        throw new Error('Random failure simulation');
    }

    console.log(`[Worker] Finish job ${id}`);
};

const worker = new Worker(
    'task-queue',
    async (job) => {
        try {
            await processJob(job);
            await query('UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2', ['succeeded', job.data.id]);
        } catch (error: any) {
            console.error(`[Worker] Job ${job.data.id} failed: ${error.message}`);

            const attempts = job.attemptsMade + 1;
            await query(
                'UPDATE jobs SET status = $1, attempts = $2, last_error = $3, updated_at = NOW() WHERE id = $4',
                ['failed', attempts, error.message, job.data.id]
            );

            throw error; // Let BullMQ handle retry logic if configured
        }
    },
    {
        connection: redisConnection,
        concurrency: 5, // Support concurrent workers
        limiter: {
            max: 10,
            duration: 1000,
        },
    }
);

worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.log(`[Worker] Job ${job?.id} failed with ${err.message}`);
});

console.log('[Worker] Worker started listening for jobs...');
