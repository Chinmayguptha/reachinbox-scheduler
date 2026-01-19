import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900">ReachInbox</h1>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            {user.picture ? (
                                <img src={user.picture} alt="Profile" className="h-8 w-8 rounded-full" />
                            ) : (
                                <div className="bg-gray-200 p-2 rounded-full"><User size={20} /></div>
                            )}
                            <span className="text-sm font-medium text-gray-700">{user.name || 'User'}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-gray-700"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
