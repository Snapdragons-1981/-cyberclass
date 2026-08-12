'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Zap, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error: resetError } = await resetPassword(email);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess('Check your email for password reset instructions.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f] grid-bg scanline">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
            <Zap className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-cyan-400" style={{ textShadow: '0 0 20px rgba(0,255,242,0.5)' }}>
            CYBERCLASS
          </h1>
        </div>

        <div className="rounded-2xl bg-[#0f0f1a]/80 border border-cyan-500/15 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-gray-100 mb-2">Reset Password</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your email to receive reset instructions.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
