import React, { useState } from 'react';
import { Lock, FileText, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.token);
      } else {
        setError(data.error || 'Incorrect password. Please try again.');
      }
    } catch (err) {
      setError('Connection failure. Ensure the server is active.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-6 border border-indigo-100">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          Proposal Generator
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Secure portal for Karan's 3-person agency
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit} id="admin-login-form">
            <div>
              <label htmlFor="password-input" className="block text-sm font-semibold text-slate-700">
                Agency Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  required
                  placeholder="Enter administrator password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 bg-slate-50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4" id="login-error-container">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {error}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Tip: Use <code className="bg-red-100 text-red-800 px-1 py-0.5 rounded font-mono text-xs">karan3</code> unless a custom password was specified.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                id="login-submit-button"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-slate-200 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Verifying password...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1">
                    <span>Unlock Generator</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Designed for Speed & High-Response Execution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
