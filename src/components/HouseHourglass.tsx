import React from 'react';
import { HouseId } from '../types';
import { HOUSES } from '../data/houseData';

interface HouseHourglassProps {
  houseId: HouseId;
  points: number;
  maxPoints?: number;
  compact?: boolean;
}

export const HouseHourglass: React.FC<HouseHourglassProps> = ({
  houseId,
  points,
  maxPoints = 500,
  compact = false,
}) => {
  const house = HOUSES[houseId];
  // Calculate percentage fill capped between 5% and 100%
  const percentage = Math.min(100, Math.max(8, Math.round((Math.max(0, points) / maxPoints) * 100)));

  // Gem colors
  const gemConfig = {
    gryffindor: {
      fillBg: 'bg-gradient-to-t from-red-700 via-rose-600 to-amber-500',
      gemItem: 'bg-red-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
      glow: 'shadow-[0_0_25px_rgba(225,29,72,0.4)]',
    },
    slytherin: {
      fillBg: 'bg-gradient-to-t from-emerald-800 via-emerald-600 to-teal-400',
      gemItem: 'bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.4)]',
    },
    ravenclaw: {
      fillBg: 'bg-gradient-to-t from-blue-900 via-sky-600 to-cyan-300',
      gemItem: 'bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
      glow: 'shadow-[0_0_25px_rgba(14,165,233,0.4)]',
    },
    hufflepuff: {
      fillBg: 'bg-gradient-to-t from-amber-700 via-yellow-500 to-amber-200',
      gemItem: 'bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.4)]',
    },
  }[houseId];

  if (compact) {
    return (
      <div className="w-full bg-neutral-900/80 rounded-full h-3 border border-neutral-700 overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${gemConfig.fillBg} ${gemConfig.glow}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Antique Brass Hourglass Frame */}
      <div className="relative w-20 h-44 sm:w-24 sm:h-52 flex flex-col items-center">
        {/* Top Ornate Brass Cap */}
        <div className="w-full h-4 bg-gradient-to-r from-amber-800 via-yellow-600 to-amber-900 rounded-t-sm border-t border-x border-yellow-500/50 shadow-md flex items-center justify-center">
          <div className="w-8 h-1 bg-yellow-400/40 rounded-full" />
        </div>

        {/* Hourglass Glass Body */}
        <div className="relative w-16 sm:w-20 flex-1 bg-gradient-to-b from-neutral-900/60 via-neutral-950/40 to-neutral-900/80 border-x-2 border-neutral-700/60 backdrop-blur-xs flex flex-col justify-end p-1 overflow-hidden shadow-inner">
          {/* Subtle Glass Highlights */}
          <div className="absolute top-0 left-1 w-1 h-full bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute top-2 right-1.5 w-0.5 h-16 bg-white/15 rounded-full pointer-events-none" />

          {/* Falling gems effect in upper air */}
          <div className="absolute inset-x-0 top-2 h-20 pointer-events-none flex justify-center gap-1 opacity-70">
            <span className={`w-1.5 h-1.5 rounded-xs animate-bounce ${gemConfig.gemItem}`} style={{ animationDuration: '2.4s' }} />
            <span className={`w-1 h-1 rounded-xs animate-bounce ${gemConfig.gemItem}`} style={{ animationDuration: '3.1s', animationDelay: '0.4s' }} />
            <span className={`w-1.5 h-1.5 rounded-xs animate-bounce ${gemConfig.gemItem}`} style={{ animationDuration: '1.8s', animationDelay: '0.9s' }} />
          </div>

          {/* Rising Gemstones Accumulation in Bottom Bulb */}
          <div
            className={`w-full transition-all duration-1000 ease-out rounded-b-sm relative overflow-hidden ${gemConfig.fillBg} ${gemConfig.glow}`}
            style={{ height: `${percentage}%` }}
          >
            {/* Gem facet specular highlights */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8)_0%,transparent_60%)]" />
            
            {/* Top liquid/gem surface shimmer */}
            <div className="w-full h-1.5 bg-white/40 shadow-xs" />

            {/* Sparkle specks inside gems */}
            <div className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-white/80 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-4 right-2 w-1 h-1 rounded-full bg-white/90 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
          </div>

          {/* Graduation Marks on Glass */}
          <div className="absolute inset-y-2 right-0.5 w-1.5 flex flex-col justify-between py-1 pointer-events-none opacity-40">
            <div className="w-1.5 h-px bg-yellow-200" />
            <div className="w-1 h-px bg-yellow-200" />
            <div className="w-1.5 h-px bg-yellow-200" />
            <div className="w-1 h-px bg-yellow-200" />
            <div className="w-1.5 h-px bg-yellow-200" />
          </div>
        </div>

        {/* Bottom Ornate Brass Stand */}
        <div className="w-full h-4 bg-gradient-to-r from-amber-900 via-yellow-600 to-amber-800 rounded-b-sm border-b border-x border-yellow-500/50 shadow-lg flex items-center justify-center">
          <div className="w-12 h-1 bg-yellow-300/30 rounded-full" />
        </div>
      </div>

      {/* Gem description caption */}
      <span className="mt-2 text-[11px] text-neutral-400 font-medium tracking-tight">
        {house.gemName.split(' ')[0]}
      </span>
    </div>
  );
};
