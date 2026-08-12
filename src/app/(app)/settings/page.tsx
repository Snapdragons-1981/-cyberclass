'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { Settings, Palette, Bell, Clock, User, Save } from 'lucide-react';

const ACCENT_COLORS = [
  { name: 'Cyan', color: '#00fff2' },
  { name: 'Purple', color: '#a855f7' },
  { name: 'Magenta', color: '#ff00ff' },
  { name: 'Electric Blue', color: '#00aaff' },
  { name: 'Neon Green', color: '#00ff88' },
];

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (authLoading) {
    return <div className="h-96 bg-cyan-500/5 rounded-xl animate-pulse" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500">Customize your experience</p>
      </div>

      <div className="rounded-xl bg-[#0f0f1a]/70 border border-cyan-500/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-gray-300 tracking-wider">ACCOUNT</h2>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-black/20 border border-cyan-500/5">
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-sm text-gray-200">{user?.email}</p>
          </div>
          <div className="p-3 rounded-lg bg-black/20 border border-cyan-500/5">
            <p className="text-xs text-gray-500 mb-1">User ID</p>
            <p className="text-sm text-gray-400 font-mono text-xs">{user?.id}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[#0f0f1a]/70 border border-cyan-500/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-gray-300 tracking-wider">THEME</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-2">ACCENT COLOR</label>
            <div className="flex gap-3">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => theme.setAccentColor(c.color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    theme.accentColor === c.color ? 'scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: c.color,
                    borderColor: theme.accentColor === c.color ? 'white' : 'transparent',
                    boxShadow: theme.accentColor === c.color ? `0 0 15px ${c.color}` : 'none'
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">GLOW INTENSITY: {theme.glowIntensity}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={theme.glowIntensity}
              onChange={(e) => theme.setGlowIntensity(parseInt(e.target.value))}
              className="w-full h-2 rounded-full bg-gray-800 appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">ANIMATION INTENSITY: {theme.animationIntensity}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={theme.animationIntensity}
              onChange={(e) => theme.setAnimationIntensity(parseInt(e.target.value))}
              className="w-full h-2 rounded-full bg-gray-800 appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">CARD TRANSPARENCY: {theme.cardTransparency}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={theme.cardTransparency}
              onChange={(e) => theme.setCardTransparency(parseInt(e.target.value))}
              className="w-full h-2 rounded-full bg-gray-800 appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-cyan-500/5">
            <div>
              <p className="text-sm text-gray-200">Background Grid</p>
              <p className="text-xs text-gray-500">Show grid pattern in background</p>
            </div>
            <button
              onClick={() => theme.setBackgroundGrid(!theme.backgroundGrid)}
              className={`w-12 h-6 rounded-full transition-colors ${theme.backgroundGrid ? 'bg-cyan-500' : 'bg-gray-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${theme.backgroundGrid ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-cyan-500/5">
            <div>
              <p className="text-sm text-gray-200">Reduced Motion</p>
              <p className="text-xs text-gray-500">Minimize animations for accessibility</p>
            </div>
            <button
              onClick={() => theme.setReducedMotion(!theme.reducedMotion)}
              className={`w-12 h-6 rounded-full transition-colors ${theme.reducedMotion ? 'bg-cyan-500' : 'bg-gray-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${theme.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[#0f0f1a]/70 border border-cyan-500/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-gray-300 tracking-wider">NOTIFICATIONS</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-cyan-500/5">
            <div>
              <p className="text-sm text-gray-200">Browser Notifications</p>
              <p className="text-xs text-gray-500">Receive task reminders in your browser</p>
            </div>
            <button
              onClick={() => {
                if ('Notification' in window) {
                  Notification.requestPermission();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors"
            >
              Enable
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
      >
        {saved ? (
          <>Saved Successfully!</>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Settings
          </>
        )}
      </button>
    </div>
  );
}
