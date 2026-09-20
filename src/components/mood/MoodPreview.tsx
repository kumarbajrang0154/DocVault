'use client';

import React from 'react';
import { Heart, CloudRain, Flame, HeartHandshake } from 'lucide-react';

interface MoodCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  badgeColor: string;
}

const MOODS: MoodCardProps[] = [
  {
    title: 'Romantic',
    description: 'Soulful melodies and heartfelt soundscapes for intimate moments.',
    icon: <Heart className="h-6 w-6 text-rose-400" />,
    gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
    borderColor: 'group-hover:border-rose-500/40',
    badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  },
  {
    title: 'Sad',
    description: 'Gentle acoustics and deep emotional vocals for thoughtful reflection.',
    icon: <CloudRain className="h-6 w-6 text-indigo-400" />,
    gradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    borderColor: 'group-hover:border-indigo-500/40',
    badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  },
  {
    title: 'Banger',
    description: 'High-energy beats and intense rhythms designed to elevate your mood.',
    icon: <Flame className="h-6 w-6 text-emerald-400" />,
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    borderColor: 'group-hover:border-emerald-500/40',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
  {
    title: 'One Side Love',
    description: 'Expressive tunes capturing longing, memories, and quiet devotion.',
    icon: <HeartHandshake className="h-6 w-6 text-purple-400" />,
    gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    borderColor: 'group-hover:border-purple-500/40',
    badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  },
];

export function MoodPreview() {
  return (
    <section id="concept" className="relative py-20 sm:py-28 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
            Concept Preview
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Discover by Mood
          </p>
          <p className="mt-4 text-base text-zinc-400">
            Music matches how you feel. Select a mood to experience curated soundscapes.
          </p>
        </div>

        {/* Mood Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MOODS.map((mood) => (
            <div
              key={mood.title}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-900/90 ${mood.borderColor}`}
            >
              {/* Card Radial Background */}
              <div 
                aria-hidden="true" 
                className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} 
              />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                      {mood.icon}
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${mood.badgeColor}`}>
                      Mood
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">
                    {mood.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2.5 text-sm text-zinc-400 leading-relaxed">
                    {mood.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
