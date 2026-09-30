import React, { useState } from 'react';
import { PlayerColor } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoConstants';
import { soundManager } from '../utils/audio';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  canRoll: boolean;
  activeColor: PlayerColor;
  onRoll: () => void;
  disabled?: boolean;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  canRoll,
  activeColor,
  onRoll,
  disabled,
}) => {
  const [internalRolling, setInternalRolling] = useState(false);
  const colorConf = COLOR_CONFIG[activeColor];

  const handleRollClick = () => {
    if (!canRoll || disabled || isRolling || internalRolling) return;
    setInternalRolling(true);
    soundManager.playDiceRoll();
    onRoll();
    setTimeout(() => {
      setInternalRolling(false);
    }, 650);
  };

  const rolling = isRolling || internalRolling;

  // Render dots for the dice face
  const renderDots = (num: number) => {
    const dots: React.ReactNode[] = [];
    const positions: Record<number, string[]> = {
      1: ['col-start-2 row-start-2'],
      2: ['col-start-1 row-start-1', 'col-start-3 row-start-3'],
      3: ['col-start-1 row-start-1', 'col-start-2 row-start-2', 'col-start-3 row-start-3'],
      4: [
        'col-start-1 row-start-1',
        'col-start-3 row-start-1',
        'col-start-1 row-start-3',
        'col-start-3 row-start-3',
      ],
      5: [
        'col-start-1 row-start-1',
        'col-start-3 row-start-1',
        'col-start-2 row-start-2',
        'col-start-1 row-start-3',
        'col-start-3 row-start-3',
      ],
      6: [
        'col-start-1 row-start-1',
        'col-start-3 row-start-1',
        'col-start-1 row-start-2',
        'col-start-3 row-start-2',
        'col-start-1 row-start-3',
        'col-start-3 row-start-3',
      ],
    };

    const dotClasses = positions[num] || positions[1];

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-10 h-10 sm:w-12 sm:h-12 p-1.5 gap-1 place-items-center">
        {dotClasses.map((pos, idx) => (
          <span
            key={idx}
            className={`w-2.5 h-2.5 rounded-full ${
              num === 6 ? 'bg-red-600' : 'bg-slate-900'
            } shadow-inner ${pos}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleRollClick}
        disabled={!canRoll || disabled || rolling}
        aria-label={`Roll dice for ${colorConf.name}`}
        className={`relative group rounded-2xl p-2.5 transition-all duration-200 select-none ${
          canRoll && !disabled
            ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-lg'
            : 'cursor-not-allowed opacity-80'
        }`}
        style={{
          boxShadow: canRoll && !disabled ? `0 0 20px ${colorConf.glowHex}` : 'none',
          backgroundColor: canRoll ? colorConf.lightHex : '#f1f5f9',
          border: `3px solid ${colorConf.hex}`,
        }}
      >
        {/* Animated 3D-ish Dice Face */}
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center transition-transform ${
            rolling
              ? 'animate-spin scale-110 rotate-180 duration-500'
              : 'scale-100 hover:rotate-3'
          }`}
          style={{
            perspective: '400px',
            transform: rolling ? 'rotate(360deg)' : undefined,
          }}
        >
          {renderDots(value || 1)}
        </div>

        {/* Pulse beacon when ready to roll */}
        {canRoll && !disabled && !rolling && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: colorConf.hex }}
            />
            <span
              className="relative inline-flex rounded-full h-4 w-4"
              style={{ backgroundColor: colorConf.hex }}
            />
          </span>
        )}
      </button>

      {/* Label */}
      <span
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: colorConf.hex }}
      >
        {canRoll && !disabled ? 'पासा फेंकें (Roll)' : `नंबर: ${value || '-'}`}
      </span>
    </div>
  );
};
