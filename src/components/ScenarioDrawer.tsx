// FILE: src/components/ScenarioDrawer.tsx
import React from 'react';
import { ScenarioState } from '@/domain/types';

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

  const handleLagChange = (milestoneKey: string, value: number) => {
    setScenario(prev => ({
      ...prev,
      lagOverrides: {
        ...prev.lagOverrides,
        [milestoneKey]: value
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

      <div className="flex-grow space-y-6 overflow-y-auto pr-1">
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
        {/* Add more scenario controls here later */}
      </div>

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
