'use client';

import { AlertTriangle, Clock, Calendar, CheckCircle, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  completed: number;
}

export function SummaryCards({ overdue, dueToday, dueThisWeek, completed }: SummaryCardsProps) {
  const cards = [
    {
      label: 'OVERDUE',
      value: overdue,
      icon: AlertTriangle,
      color: 'from-red-500/20 to-red-600/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      glow: 'shadow-red-500/10',
    },
    {
      label: 'TODAY',
      value: dueToday,
      icon: Clock,
      color: 'from-orange-500/20 to-orange-600/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      glow: 'shadow-orange-500/10',
    },
    {
      label: 'THIS WEEK',
      value: dueThisWeek,
      icon: Calendar,
      color: 'from-cyan-500/20 to-cyan-600/10',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-400',
      glow: 'shadow-cyan-500/10',
    },
    {
      label: 'COMPLETED',
      value: completed,
      icon: CheckCircle,
      color: 'from-emerald-500/20 to-emerald-600/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      glow: 'shadow-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${card.color} border ${card.borderColor} p-4 lg:p-5`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium tracking-wider text-gray-400 mb-1">{card.label}</p>
              <p className={`text-3xl lg:text-4xl font-bold ${card.textColor}`} style={{ textShadow: `0 0 20px currentColor` }}>
                {card.value}
              </p>
            </div>
            <card.icon className={`w-8 h-8 ${card.textColor} opacity-60`} />
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-gradient-to-tl from-white/[0.03] to-transparent -mr-8 -mb-8" />
        </div>
      ))}
    </div>
  );
}
