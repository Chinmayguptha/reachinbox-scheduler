import express from 'express';
// const cors = require('cors');
import { emailQueue } from './queue';
import prisma from './db';
import { initMailer } from './mailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
// app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// Initialize Mailer
initMailer();

app.get('/', (req, res) => {
    res.send('ReachInbox Scheduler API is running');
});

// GET /jobs - Fetch jobs
app.get('/jobs', async (req, res) => {
    // In real app, filter by userId
    const jobs = await prisma.emailJob.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
});

// POST /schedule - Schedule Email
app.post('/schedule', async (req, res) => {
    const { subject, body, recipients, scheduledAt } = req.body;

    // Create Job in DB
    const emailJob = await prisma.emailJob.create({
        data: {
            userId: 'demo-user-id', // Mock user for now
            subject,
            body,
            recipients,
            scheduledAt: new Date(scheduledAt),
            status: 'PENDING'
        }
    });

    // Calculate delay
    const delay = new Date(scheduledAt).getTime() - Date.now();
    const cleanDelay = delay > 0 ? delay : 0;

    // Add to BullMQ
    await emailQueue.add('send-email', { emailJobId: emailJob.id }, { delay: cleanDelay });

    res.json(emailJob);
});

// Auth Routes (Mock for now or minimal)
app.post('/auth/google', (req, res) => {
    // TODO: Verify token
    res.json({ user: { name: "Demo User", email: "demo@example.com", avatar: "https://via.placeholder.com/150" } });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
