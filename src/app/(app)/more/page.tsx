'use client';

import Link from 'next/link';
import { BookOpen, Users, BarChart3, Settings, Bell, LogOut, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function MorePage() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const items = [
    { href: '/courses', label: 'Courses', icon: BookOpen, description: 'Manage your courses' },
    { href: '/board', label: 'Kanban Board', icon: Zap, description: 'Drag and drop tasks' },
    { href: '/statistics', label: 'Statistics', icon: BarChart3, description: 'View your progress' },
    { href: '/notifications', label: 'Notifications', icon: Bell, description: 'Check notifications' },
    { href: '/settings', label: 'Settings', icon: Settings, description: 'Customize theme' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">More</h1>
        <p className="text-sm text-gray-500">Additional options</p>
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 p-4 rounded-xl bg-[#0f0f1a]/70 border border-cyan-500/10 hover:border-cyan-500/30 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">{item.label}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-all text-red-400"
      >
        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
          <LogOut className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-medium">Sign Out</p>
          <p className="text-xs text-red-400/60">Log out of your account</p>
        </div>
      </button>
    </div>
  );
}
