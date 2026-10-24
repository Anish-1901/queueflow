import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { jobQueue } from './queue';
import { query } from './db';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/jobs', async (req: Request, res: Response) => {
    try {
        const jobId = uuidv4();

        // Add to Redis queue
        await jobQueue.add('task', { id: jobId }, {
            jobId: jobId, // Use same ID for BullMQ
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });

        // Add to Postgres
        await query('INSERT INTO jobs (id, status, attempts, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())', [jobId, 'queued', 0]);

        res.status(201).json({ id: jobId });
    } catch (error: any) {
        console.error('Error enqueuing job:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/jobs/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM jobs WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        console.error('Error fetching job:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
