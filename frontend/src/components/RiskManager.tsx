// ── Cypher Trading Non-Custodial ──
// RiskManager Component
// Stop-loss, take-profit, position size management

import React, { useState } from 'react';
import { Shield, AlertTriangle, Target, Percent } from 'lucide-react';
import clsx from 'clsx';

export function RiskManager(): React.ReactElement {
  const [stopLoss, setStopLoss] = useState(5);
  const [takeProfit, setTakeProfit] = useState(10);
  const [maxPosition, setMaxPosition] = useState(25);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
        <Shield className="w-4 h-4 text-yellow-500" />
        Risk Management
      </div>

      {/* Stop Loss */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            Stop-Loss
          </div>
          <span className="text-sm text-red-400 font-mono">{stopLoss}%</span>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          value={stopLoss}
          onChange={(e) => setStopLoss(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-gray-700 cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:shadow-lg"
        />
      </div>

      {/* Take Profit */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Target className="w-3 h-3 text-green-400" />
            Take-Profit
          </div>
          <span className="text-sm text-green-400 font-mono">{takeProfit}%</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={takeProfit}
          onChange={(e) => setTakeProfit(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-gray-700 cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:shadow-lg"
        />
      </div>

      {/* Max Position Size */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Percent className="w-3 h-3 text-cyan-400" />
            Max Position Size
          </div>
          <span className="text-sm text-cyan-400 font-mono">{maxPosition}%</span>
        </div>
        <input
          type="range"
          min={5}
          max={100}
          value={maxPosition}
          onChange={(e) => setMaxPosition(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-gray-700 cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-lg"
        />
      </div>

      {/* Summary */}
      <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
        <p className="text-xs text-yellow-400/80 leading-relaxed">
          Risk settings are local only. Stop-loss and take-profit orders execute via smart contracts — 
          never trust a centralized server with your exit strategies.
        </p>
      </div>
    </div>
  );
}
