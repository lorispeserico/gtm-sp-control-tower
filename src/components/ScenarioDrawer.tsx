// FILE: src/components/ScenarioDrawer.tsx
import React from 'react';
import { ScenarioState, MilestoneType } from '../domain/types';

interface ScenarioDrawerProps {
  scenario: ScenarioState;
  setScenario: React.Dispatch<React.SetStateAction<ScenarioState>>;
  onClose: () => void;
  resetScenario: () => void;
}

export const ScenarioDrawer: React.FC<ScenarioDrawerProps> = ({
  scenario,
  setScenario,
  onClose,
  resetScenario,
}) => {
  const handleLagChange = (milestoneType: MilestoneType, value: number) => {
    setScenario(prev => ({
      ...prev,
      lagOverrides: {
        ...prev.lagOverrides,
        [milestoneType]: value
      }
    }));
  };

  const handleToggleExtraRound = () => {
    setScenario(prev => ({
      ...prev,
      extraSampleRound: !prev.extraSampleRound
    }));
  };

  return (
    <div className="fixed top-0 right-0 h-screen w-80 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col p-6 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-1.5">
            <span>🧪</span> Scenario Sandbox
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Model custom timeline adjustments</p>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-100 rounded-lg transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Control Levers Body */}
      <div className="flex-grow space-y-6 overflow-y-auto pr-1">
        {/* Lever 1: Extra Sample Round */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <label className="flex items-center justify-between cursor-pointer select-none">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase block tracking-wider">Extra Sample Round</span>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Adds 15 working days before LR1</span>
            </div>
            <input
              type="checkbox"
              checked={scenario.extraSampleRound}
              onChange={handleToggleExtraRound}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 border-slate-300 focus:outline-none"
            />
          </label>
        </div>

        {/* Lever 2: Dynamic Milestone Lags */}
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-3.5">
            Milestone Lag Adjustments
          </span>
          <div className="space-y-5">
            {/* Proto Lead Time adjustment */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Proto Sample Lag</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">
                  {scenario.lagOverrides['Proto'] ?? 30}d
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={scenario.lagOverrides['Proto'] ?? 30}
                onChange={(e) => handleLagChange('Proto', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />
              <span className="text-[9px] text-slate-400 font-medium block mt-1">Normal: 30 days</span>
            </div>

            {/* LR1 Lead Time adjustment */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>LR1 Review Window</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">
                  {scenario.lagOverrides['LR1'] ?? 20}d
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                value={scenario.lagOverrides['LR1'] ?? 20}
                onChange={(e) => handleLagChange('LR1', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />
              <span className="text-[9px] text-slate-400 font-medium block mt-1">Normal: 20 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="border-t border-slate-100 pt-4 mt-4 flex gap-3">
        <button 
          onClick={resetScenario}
          className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-all"
        >
          Reset
        </button>
        <button 
          onClick={onClose}
          className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md shadow-slate-950/10 transition-all"
        >
          Apply Sandbox
        </button>
      </div>
    </div>
  );
};
