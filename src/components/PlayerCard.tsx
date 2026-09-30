import React from 'react';
import { Player, PlayerColor } from '../types/ludo';
import { COLOR_CONFIG, TOTAL_STEPS_TO_HOME } from '../utils/ludoConstants';
import { Bot, User, Trophy, ShieldCheck } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isCurrentTurn: boolean;
  canRoll: boolean;
  onQuickRoll?: () => void;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isCurrentTurn,
  canRoll,
  onQuickRoll,
}) => {
  const config = COLOR_CONFIG[player.id];

  // Token counters
  const inYard = player.tokens.filter((t) => t.stepCount === -1).length;
  const inHome = player.tokens.filter((t) => t.stepCount === TOTAL_STEPS_TO_HOME).length;
  const onBoard = 4 - inYard - inHome;

  return (
    <div
      className={`relative rounded-xl p-2.5 sm:p-3 transition-all duration-300 border select-none ${
        isCurrentTurn
          ? 'scale-102 bg-white shadow-xl ring-2'
          : 'bg-slate-50/90 hover:bg-white/80 opacity-90 border-slate-200'
      }`}
      style={{
        borderColor: isCurrentTurn ? config.hex : '#e2e8f0',
        boxShadow: isCurrentTurn ? `0 4px 20px ${config.glowHex}` : undefined,
      }}
    >
      {/* Active turn badge */}
      {isCurrentTurn && (
        <div
          className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm flex items-center gap-1"
          style={{ backgroundColor: config.hex }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          चाल (Turn)
        </div>
      )}

      {/* Winner crown */}
      {player.hasWon && (
        <div className="absolute -top-2.5 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <Trophy className="w-3 h-3" />
          <span>#{player.rank || 1} जीत!</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar with player color ring */}
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: config.hex }}
          >
            {player.type === 'BOT' ? (
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>

          <div className="truncate">
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate flex items-center gap-1">
              <span>{player.name}</span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: config.hex }}
              />
              <span>{config.name}</span>
              <span className="text-slate-400">·</span>
              <span>{player.type === 'BOT' ? 'रोबोट (AI)' : 'खिलाड़ी'}</span>
            </div>
          </div>
        </div>

        {/* Quick roll button when it is this player's turn */}
        {isCurrentTurn && canRoll && onQuickRoll && player.type === 'HUMAN' && (
          <button
            onClick={onQuickRoll}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg text-white shadow transition-transform active:scale-95 cursor-pointer shrink-0"
            style={{ backgroundColor: config.hex }}
          >
            फेंकें
          </button>
        )}
      </div>

      {/* Token status indicators */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-1" title="यार्ड में गोटी">
          <span className="text-slate-400">यार्ड:</span>
          <span className="font-semibold">{inYard}</span>
        </div>
        <div className="flex items-center gap-1" title="मैदान में गोटी">
          <span className="text-slate-400">मैदान:</span>
          <span className="font-semibold text-slate-700">{onBoard}</span>
        </div>
        <div className="flex items-center gap-1" title="होम में पहुंची गोटी">
          <span className="text-slate-400">होम:</span>
          <span className="font-bold" style={{ color: config.hex }}>
            {inHome}/4
          </span>
        </div>
      </div>
    </div>
  );
};
