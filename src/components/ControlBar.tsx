// FILE: src/components/ControlBar.tsx
import React from 'react';
import { Season, Category } from '../domain/types';

interface ControlBarProps {
  selectedSeason: Season | 'ALL';
  setSelectedSeason: (season: Season | 'ALL') => void;
  selectedCategory: Category | 'ALL';
  setSelectedCategory: (category: Category | 'ALL') => void;
  selectedTeam: string | 'ALL';
  setSelectedTeam: (team: string | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  selectedSeason,
  setSelectedSeason,
  selectedCategory,
  setSelectedCategory,
  selectedTeam,
  setSelectedTeam,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search Input */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Search Projects</label>
          <input
            type="text"
            placeholder="e.g. Gigi, Loewe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 transition-all"
          />
        </div>

        {/* Season Filter */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Season</label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value as any)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Seasons</option>
            <option value="SS26">SS26</option>
            <option value="FW26">FW26</option>
            <option value="SS27">SS27</option>
            <option value="FW27">FW27</option>
            <option value="SS28">SS28</option>
            <option value="FW28">FW28</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Apparel">Apparel</option>
            <option value="Footwear">Footwear</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        {/* Team / Functional Lens Filter */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Team Function</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Functions</option>
            <option value="Design">Design</option>
            <option value="Development">Development</option>
            <option value="Materials">Materials</option>
            <option value="Testing">Testing</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
      </div>

      <div className="text-right">
        <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Operational Status</span>
        <div className="flex gap-3 mt-1.5">
          <span className="flex items-center text-xs text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-1.5 block" /> On Track</span>
          <span className="flex items-center text-xs text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5 block" /> Delayed</span>
          <span className="flex items-center text-xs text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-red-600 mr-1.5 block animate-pulse" /> Deficit / At Risk</span>
        </div>
      </div>
    </div>
  );
};
