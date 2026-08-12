'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Zap className="w-12 h-12 text-cyan-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg scanline flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold text-cyan-400" style={{ textShadow: '0 0 10px rgba(0,255,242,0.5)' }}>
            CYBERCLASS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-cyan-400 transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-cyan-500/20">
            <Zap className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-4">
            <span className="text-cyan-400" style={{ textShadow: '0 0 30px rgba(0,255,242,0.5)' }}>CYBER</span>
            <span className="text-purple-400" style={{ textShadow: '0 0 30px rgba(168,85,247,0.5)' }}>CLASS</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Your Academic Command Center
          </p>
          <p className="text-gray-500 mb-10 max-w-lg mx-auto">
            Manage assignments, track deadlines, and stay organized with a cyberpunk-themed 
            student productivity platform designed for the modern academic.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup" className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
              Start Now
            </Link>
            <Link href="/login" className="px-8 py-3 rounded-xl border border-cyan-500/30 text-cyan-400 font-bold hover:bg-cyan-500/10 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-cyan-500/10 text-center text-xs text-gray-600">
        CyberClass &mdash; Academic Task Management System
      </footer>
    </div>
  );
}
