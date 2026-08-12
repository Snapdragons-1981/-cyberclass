'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-500 tracking-wider">
              {format(currentTime, 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="text-sm font-semibold text-cyan-400" style={{ textShadow: '0 0 8px rgba(0,255,242,0.3)' }}>
              {getGreeting()}, {user?.email?.split('@')[0]?.toUpperCase() || 'USER'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search tasks, courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all"
              />
            </div>
          </form>

          <button
            onClick={() => router.push('/notifications')}
            className="relative p-2 rounded-lg hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-cyan-500/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <User className="w-4 h-4 text-black" />
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showProfile && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 py-2 rounded-xl bg-[#0f0f1a] border border-cyan-500/20 shadow-2xl z-50">
                  <div className="px-4 py-2 border-b border-cyan-500/10">
                    <p className="text-sm font-medium text-gray-200">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowProfile(false); router.push('/settings'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile & Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
