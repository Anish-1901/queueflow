import { v4 as uuidv4 } from 'uuid';
import { jobQueue } from '../queue'; // Adjust path if needed
import { query } from '../db'; // Adjust path if needed

const seedJobs = async () => {
    console.log('Seeding 1000 jobs...');

    const jobs = [];

    for (let i = 0; i < 1000; i++) {
        const jobId = uuidv4();

        // Prepare promises for parallel execution
        jobs.push((async () => {
            await jobQueue.add('task', { id: jobId }, {
                jobId: jobId,
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
            });

            await query('INSERT INTO jobs (id, status, attempts, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())', [jobId, 'queued', 0]);
        })());
    }

    await Promise.all(jobs);

    console.log('Successfully seeded 1000 jobs');
    process.exit(0);
};

seedJobs().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
