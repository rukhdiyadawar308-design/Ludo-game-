import React from 'react';
import { Player, PlayerColor, PlayerType } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoConstants';
import { X, Users, Bot, User, Volume2, VolumeX, Shield, Play } from 'lucide-react';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerCount: number;
  setPlayerCount: (count: number) => void;
  players: Player[];
  onUpdatePlayer: (color: PlayerColor, updates: Partial<Player>) => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onStartNewGame: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  playerCount,
  setPlayerCount,
  players,
  onUpdatePlayer,
  isMuted,
  onToggleSound,
  onStartNewGame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">खेल सेटिंग्स (Game Settings)</h2>
              <p className="text-xs text-slate-500">खिलाड़ी और गेम मोड चुनें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Player Count Selector */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            खिलाड़ियों की संख्या (Number of Players)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => setPlayerCount(count)}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
                  playerCount === count
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {count} खिलाड़ी ({count}P)
              </button>
            ))}
          </div>
        </div>

        {/* 2. Player Roster (Names & Human/Bot) */}
        <div className="mb-5 space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            खिलाड़ी विवरण (Players & AI Bots)
          </label>
          {players.map((player) => {
            const config = COLOR_CONFIG[player.id];
            if (!player.active) return null;

            return (
              <div
                key={player.id}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: config.hex }}
                >
                  {config.name[0]}
                </div>

                <input
                  type="text"
                  value={player.name}
                  onChange={(e) =>
                    onUpdatePlayer(player.id, { name: e.target.value })
                  }
                  maxLength={15}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Player Name"
                />

                {/* Type Toggle: Human / Bot */}
                <div className="flex bg-slate-200/80 p-0.5 rounded-lg shrink-0">
                  <button
                    onClick={() => onUpdatePlayer(player.id, { type: 'HUMAN' })}
                    title="इंसान (Human)"
                    className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      player.type === 'HUMAN'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">User</span>
                  </button>
                  <button
                    onClick={() => onUpdatePlayer(player.id, { type: 'BOT' })}
                    title="रोबोट (AI Bot)"
                    className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      player.type === 'BOT'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Bot</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Audio & Quick Rules */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 mb-6">
          <div className="flex items-center gap-2">
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            )}
            <span className="text-xs font-semibold text-slate-700">ध्वनि प्रभाव (Sound Effects)</span>
          </div>
          <button
            onClick={onToggleSound}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              isMuted
                ? 'bg-slate-200 text-slate-600'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isMuted ? 'म्यूट है' : 'चालू है'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              onStartNewGame();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>नया मैच शुरू करें (Apply & Start)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
