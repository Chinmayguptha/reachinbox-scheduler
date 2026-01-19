import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

// Add auth token if available (mock for now or from localStorage)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// MOCK ADAPTER FOR DEMO (Vercel/Netlify Deployment Support)
// This allows the app to work 100% in the browser without a real backend for the demo.
api.interceptors.response.use(
    response => response,
    async error => {
        // If Backend is unreachable (Network Error), use Local Mock Logic
        if (!error.response || error.code === 'ERR_NETWORK') {
            const { url, method, data } = error.config;
            console.warn(`Backend unreachable. Using MOCK for: ${method} ${url}`);

            // Mock Data Store in LocalStorage
            const getMockJobs = () => JSON.parse(localStorage.getItem('mock_jobs') || '[]');
            const setMockJobs = (jobs: any[]) => localStorage.setItem('mock_jobs', JSON.stringify(jobs));

            // SIMULATE: GET /jobs
            if (url === '/jobs' && method === 'get') {
                const jobs = getMockJobs();
                // Auto-update status based on time
                const now = new Date();
                const updatedJobs = jobs.map((j: any) => {
                    if (j.status === 'PENDING' && new Date(j.scheduledAt) < now) {
                        return { ...j, status: 'COMPLETED', sentAt: now.toISOString() };
                    }
                    return j;
                });
                setMockJobs(updatedJobs);
                return { data: updatedJobs };
            }

            // SIMULATE: POST /schedule
            if (url === '/schedule' && method === 'post') {
                const payload = JSON.parse(data);
                const newJob = {
                    id: Math.random().toString(36),
                    ...payload,
                    status: 'PENDING',
                    createdAt: new Date().toISOString()
                };
                const jobs = getMockJobs();
                jobs.push(newJob);
                setMockJobs(jobs);
                return { data: newJob };
            }
        }
        return Promise.reject(error);
    }
);

export default api;
