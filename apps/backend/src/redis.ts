import Redis from 'ioredis';

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => {
        // Retry for a bit then give up or just keep retrying slowly
        return Math.min(times * 50, 2000);
    }
};

const connection = new Redis(redisConfig);

connection.on('error', (err: any) => {
    console.warn('Redis Connection Error (Is Docker running?):', err.message);
});

export default connection;
