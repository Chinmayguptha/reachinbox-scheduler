import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ComposeEmail from '../components/ComposeEmail';
import api from '../api';
import { Plus, Mail } from 'lucide-react';
import clsx from 'clsx';

interface Job {
    id: string;
    subject: string;
    recipients: string[];
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    scheduledAt: string;
    sentAt?: string;
    createdAt: string;
}

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
    const [showCompose, setShowCompose] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/jobs');
            setJobs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const scheduledJobs = jobs.filter(j => j.status === 'PENDING' || j.status === 'PROCESSING');
    const sentJobs = jobs.filter(j => j.status === 'COMPLETED' || j.status === 'FAILED');

    const currentList = activeTab === 'scheduled' ? scheduledJobs : sentJobs;

    return (
        <Layout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <button
                    onClick={() => setShowCompose(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    <span>Compose New Email</span>
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('scheduled')}
                            className={clsx(
                                'w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm',
                                activeTab === 'scheduled'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            )}
                        >
                            Scheduled Emails
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={clsx(
                                'w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm',
                                activeTab === 'sent'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            )}
                        >
                            Sent / History
                        </button>
                    </nav>
                </div>

                <div className="p-4">
                    {loading && jobs.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">Loading...</div>
                    ) : currentList.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <Mail className="mx-auto h-12 w-12 text-gray-300" />
                            <p className="mt-2">No emails found in this category.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {activeTab === 'scheduled' ? 'Scheduled For' : 'Sent At'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentList.map((job) => (
                                        <tr key={job.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.subject}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {job.recipients.length} recipients ({job.recipients[0]}...)
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(activeTab === 'scheduled' ? job.scheduledAt : (job.sentAt || job.scheduledAt)).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={clsx(
                                                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                    job.status === 'COMPLETED' && "bg-green-100 text-green-800",
                                                    job.status === 'PENDING' && "bg-yellow-100 text-yellow-800",
                                                    job.status === 'PROCESSING' && "bg-blue-100 text-blue-800",
                                                    job.status === 'FAILED' && "bg-red-100 text-red-800"
                                                )}>
                                                    {job.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showCompose && (
                <ComposeEmail
                    onClose={() => setShowCompose(false)}
                    onSuccess={() => {
                        fetchJobs();
                    }}
                />
            )}
        </Layout>
    );
};

export default Dashboard;
