import React, { useState } from 'react';
import api from '../api';
import { X, Upload } from 'lucide-react';

interface ComposeEmailProps {
    onClose: () => void;
    onSuccess: () => void;
}

const ComposeEmail: React.FC<ComposeEmailProps> = ({ onClose, onSuccess }) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [recipients, setRecipients] = useState<string[]>([]);
    const [scheduledAt, setScheduledAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [csvError, setCsvError] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            // Simple CSV Parse: split by newline, look for emails
            const emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
            if (emails) {
                setRecipients(prev => [...prev, ...emails]);
                setCsvError('');
            } else {
                setCsvError('No valid emails found in file.');
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (recipients.length === 0) {
            alert("Please add at least one recipient");
            return;
        }
        setLoading(true);
        try {
            await api.post('/schedule', {
                subject,
                body,
                recipients,
                scheduledAt: new Date(scheduledAt).toISOString(),
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to schedule', error);
            alert('Failed to schedule email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Compose New Email</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Recipients (Upload CSV/Text)</label>
                        <div className="flex items-center space-x-4 mt-1">
                            <label className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                <Upload size={16} />
                                <span>Upload File</span>
                                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                            </label>
                            <div className="text-sm text-gray-500">
                                {recipients.length} emails detected
                            </div>
                        </div>
                        {csvError && <p className="text-red-500 text-xs mt-1">{csvError}</p>}
                        <div className="mt-2 text-xs text-gray-400">
                            Current recipients: {recipients.slice(0, 5).join(', ')} {recipients.length > 5 ? `+ ${recipients.length - 5} more` : ''}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Body</label>
                        <textarea
                            required
                            rows={4}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Schedule Send Time</label>
                            <input
                                type="datetime-local"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                            />
                        </div>
                        {/* Additional logic like hourly limit could go here, passed to backend */}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Scheduling...' : 'Schedule Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComposeEmail;
