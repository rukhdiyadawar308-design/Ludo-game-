import React, { useEffect } from 'react';
import { Player } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoConstants';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Share2, PartyPopper } from 'lucide-react';

interface VictoryModalProps {
  winner: Player | null;
  onNewGame: () => void;
  stats: {
    turnsPlayed: number;
    totalSixes: number;
    totalCaptures: number;
  };
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  onNewGame,
  stats,
}) => {
  useEffect(() => {
    if (winner) {
      // Fire confetti bursts
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [winner]);

  if (!winner) return null;

  const config = COLOR_CONFIG[winner.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 text-center select-none"
        style={{ borderColor: config.hex }}>
        {/* Trophy icon */}
        <div
          className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg mb-4 text-white animate-bounce"
          style={{ backgroundColor: config.hex }}
        >
          <Trophy className="w-10 h-10" />
        </div>

        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center justify-center gap-1">
          <PartyPopper className="w-4 h-4 text-amber-500" />
          <span>लूडो चैम्पियन! (LUDO CHAMPION)</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          {winner.name} जीत गए! 🏆
        </h2>

        <p className="text-sm text-slate-600 mb-6">
          बधाई हो! {config.hindiName} के सभी 4 टोकन सफलतापूर्वक होम पहुंच गए हैं।
        </p>

        {/* Game stats summary */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-6 text-center">
          <div>
            <div className="text-xs text-slate-400">कुल चालें</div>
            <div className="text-base font-bold text-slate-800">
              {stats.turnsPlayed}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">छक्के (6s)</div>
            <div className="text-base font-bold text-amber-600">
              {stats.totalSixes}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">गोटियां काटी</div>
            <div className="text-base font-bold text-red-600">
              {stats.totalCaptures}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onNewGame}
            className="flex-1 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: config.hex }}
          >
            <RotateCcw className="w-4 h-4" />
            <span>फिर से खेलें (Play Again)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
