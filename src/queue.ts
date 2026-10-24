import { Queue } from 'bullmq';

const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const jobQueue = new Queue('task-queue', {
    connection: redisConnection,
});
