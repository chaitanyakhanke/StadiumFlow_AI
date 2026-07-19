'use client';

import React from 'react';
import { useStadium, UserRole, Language } from '@/context/StadiumContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navbar: React.FC = () => {
  const {
    userRole,
    setRole,
    language,
    setLanguage,
    aiEnabled,
    setAiEnabled,
    theme,
    setTheme
  } = useStadium();
  
  const pathname = usePathname();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  // Define navigation links based on user role
  const getNavLinks = () => {
    switch (userRole) {
      case 'operator':
        return [
          { name: 'Operations Console', path: '/operations' },
          { name: 'Incidents Log', path: '/operations/incidents' },
          { name: 'Sustainability', path: '/sustainability' }
        ];
      case 'volunteer':
        return [
          { name: 'Volunteer Copilot', path: '/assistant' },
          { name: 'Quick Evac Guide', path: '/sustainability' }
        ];
      default: // fan
        return [
          { name: 'Stadium Map', path: '/' },
          { name: 'Navigate POIs', path: '/navigate' },
          { name: 'Fan Assistant', path: '/assistant' }
        ];
    }
  };

  const links = getNavLinks();

  return (
    <header className="bg-brand-elevated border-b border-brand-border px-4 py-3 shadow-lg select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand and AI Status */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl">🏟️</span>
            <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-brand-cyan to-brand-teal bg-clip-text text-transparent group-hover:brightness-110 transition-all">
              STADIUMFLOW AI
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20 uppercase tracking-widest">
              WC26
            </span>
          </Link>
          
          {/* AI Status Badge (Accessible indicator) */}
          <button
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`md:hidden flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
              aiEnabled
                ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 hover:bg-brand-cyan/20'
                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
            }`}
            aria-label={`Toggle AI connection. Currently ${aiEnabled ? 'Connected' : 'Disconnected (Resilient Mode)'}`}
          >
            <span className={`w-2 h-2 rounded-full ${aiEnabled ? 'bg-brand-cyan animate-pulse' : 'bg-yellow-500'}`} />
            <span>{aiEnabled ? 'AI Active' : 'Resilient Mode'}</span>
          </button>
        </div>

        {/* Middle Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1" aria-label="Main Navigation">
          {links.map(link => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`text-xs md:text-sm font-semibold px-3 py-1.5 rounded-md transition-all ${
                  isActive
                    ? 'bg-brand-cyan text-slate-50 dark:text-slate-950 font-bold shadow-md shadow-brand-cyan/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Settings Selectors */}
        <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
          
          {/* AI State Badge for Desktop */}
          <button
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-all ${
              aiEnabled
                ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 hover:bg-brand-cyan/20'
                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
            }`}
            aria-label={`Toggle AI connection. Currently ${aiEnabled ? 'Connected' : 'Disconnected (Resilient Mode)'}`}
          >
            <span className={`w-2 h-2 rounded-full ${aiEnabled ? 'bg-brand-cyan animate-pulse' : 'bg-brand-cyan'}`} />
            <span>{aiEnabled ? 'AI Active' : 'Resilient Mode'}</span>
          </button>
 
          {/* Role selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="role-select" className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Role:
            </label>
            <select
              id="role-select"
              value={userRole}
              onChange={handleRoleChange}
              className="bg-brand-dark text-slate-800 dark:text-slate-300 text-xs px-2 py-1.5 rounded border border-brand-border focus:border-brand-cyan focus:outline-none cursor-pointer"
            >
              <option value="fan">Fan View</option>
              <option value="operator">Operator (HQ)</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          {/* Language selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="lang-select" className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Lang:
            </label>
            <select
              id="lang-select"
              value={language}
              onChange={handleLanguageChange}
              className="bg-brand-dark text-slate-800 dark:text-slate-300 text-xs px-2 py-1.5 rounded border border-brand-border focus:border-brand-cyan focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="hinglish">Hinglish</option>
              <option value="es">Español</option>
            </select>
          </div>

          {/* Theme Selector Button */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-brand-border bg-brand-dark hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
        </div>

      </div>
    </header>
  );
};
