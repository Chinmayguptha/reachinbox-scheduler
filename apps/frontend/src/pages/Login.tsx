import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleSuccess = (credentialResponse: any) => {
        console.log(credentialResponse);
        // In real app, verify with backend:
        // api.post('/auth/google', { token: credentialResponse.credential })...

        // Simulating login:
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify({ name: 'Demo User', email: 'user@example.com', picture: 'https://via.placeholder.com/40' }));

        navigate('/dashboard');
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">ReachInbox Scheduler</h2>
                    <p className="mt-2 text-sm text-gray-600">Sign in to manage your email campaigns</p>
                </div>
                <div className="flex justify-center mt-8">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                    />
                </div>

                <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">Or for demo</span>
                    </div>
                </div>

                <button
                    onClick={() => handleSuccess({ credential: 'mock-token' })}
                    className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Demo Login (Bypass Google)
                </button>
            </div>
        </div>
    );
};

export default Login;
