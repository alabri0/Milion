import React from 'react';
import { PRIZE_LEVELS, GUARANTEED_LEVELS } from '../constants';

interface PrizeLadderProps {
  currentQuestionIndex: number;
}

const PrizeLadder: React.FC<PrizeLadderProps> = ({ currentQuestionIndex }) => {
    
  const formatPrize = (prize: number): string => {
    if (prize >= 1000000) {
      return `${prize / 1000000}M`;
    }
    if (prize >= 1000) {
      return `${prize / 1000}K`;
    }
    return prize.toString();
  };

  return (
    <div className="bg-slate-800/50 p-3 rounded-lg w-full">
      <ul className="flex flex-row-reverse flex-wrap-reverse justify-center items-center gap-2">
        {PRIZE_LEVELS.map((prize, index) => {
          const isCurrent = index === currentQuestionIndex;
          const isGuaranteed = GUARANTEED_LEVELS.includes(index);
          const isPast = index < currentQuestionIndex;

          let levelClass = 'bg-slate-700/60 text-slate-300';
          if (isCurrent) {
            levelClass = 'bg-amber-500 text-white font-bold scale-110 shadow-lg z-10';
          } else if (isGuaranteed) {
            levelClass = 'bg-slate-700/60 text-emerald-400 border border-emerald-500/50';
          }
          if (isPast) {
            levelClass = 'bg-transparent text-slate-500 line-through opacity-60';
          }

          return (
            <li
              key={prize}
              className={`px-3 py-1 rounded-full transition-all duration-300 text-center text-sm font-medium ${levelClass}`}
            >
              <span className="whitespace-nowrap">${formatPrize(prize)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PrizeLadder;
