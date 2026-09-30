import React, { useMemo } from 'react';
import { Player, PlayerColor, Token, MoveOption, CaptureEffect } from '../types/ludo';
import {
  COLOR_CONFIG,
  SAFE_TRACK_INDEXES,
  TRACK_CELLS,
  getTokenCoordinate,
} from '../utils/ludoConstants';

interface LudoBoardProps {
  players: Player[];
  activePlayerColor: PlayerColor;
  validMoves: MoveOption[];
  onSelectToken: (tokenId: number) => void;
  hoveredMove: MoveOption | null;
  onHoverMove?: (move: MoveOption | null) => void;
  animatingToken?: { color: PlayerColor; tokenId: number; stepCount: number } | null;
  captureEffects?: CaptureEffect[];
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  players,
  activePlayerColor,
  validMoves,
  onSelectToken,
  hoveredMove,
  onHoverMove,
  animatingToken,
  captureEffects = [],
}) => {
  // Map of movable token IDs for the active player
  const movableTokenIds = useMemo(() => {
    return new Set(validMoves.map((m) => m.tokenId));
  }, [validMoves]);

  // Compute token positions, considering ongoing animation
  const tokenPlacements = useMemo(() => {
    const map = new Map<
      string,
      { token: Token; player: Player; isHopping: boolean }[]
    >();

    players.forEach((player) => {
      if (!player.active) return;
      player.tokens.forEach((token) => {
        // If this token is currently in the middle of a step-by-step hop animation:
        const isCurrentAnimated =
          animatingToken &&
          animatingToken.color === player.id &&
          animatingToken.tokenId === token.id;

        const effectiveStep = isCurrentAnimated
          ? animatingToken.stepCount
          : token.stepCount;

        const coord = getTokenCoordinate(player.id, token.id, effectiveStep);
        const key = `${coord.row.toFixed(1)}_${coord.col.toFixed(1)}`;
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push({
          token: { ...token, stepCount: effectiveStep },
          player,
          isHopping: !!isCurrentAnimated,
        });
      });
    });

    return map;
  }, [players, animatingToken]);

  // Destination preview coordinate when hovering a token
  const destinationCoord = useMemo(() => {
    if (!hoveredMove) return null;
    return getTokenCoordinate(
      activePlayerColor,
      hoveredMove.tokenId,
      hoveredMove.toStep
    );
  }, [hoveredMove, activePlayerColor]);

  // Render authentic 3D Pawn (मोहरा)
  const render3DPawn = (
    cx: number,
    cy: number,
    scale: number,
    colorHex: string,
    lightHex: string,
    isMovable: boolean,
    isHopping: boolean
  ) => {
    return (
      <g
        transform={`translate(${cx}, ${cy}) scale(${scale}) ${
          isHopping ? 'translate(0, -0.22) scale(1.18)' : ''
        }`}
        style={{
          transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Contact Shadow */}
        <ellipse
          cx="0"
          cy="0.22"
          rx="0.32"
          ry="0.12"
          fill="rgba(0, 0, 0, 0.35)"
          filter="blur(1px)"
        />

        {/* Pulsing ring indicator if token can be moved */}
        {isMovable && (
          <g>
            <circle
              cx="0"
              cy="0.05"
              r="0.46"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="0.07"
              strokeDasharray="0.16 0.08"
              className="animate-spin"
            />
            <circle
              cx="0"
              cy="0.05"
              r="0.54"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="0.03"
              opacity="0.7"
              className="animate-pulse"
            />
          </g>
        )}

        {/* 1. Pawn Base Rim */}
        <ellipse
          cx="0"
          cy="0.18"
          rx="0.28"
          ry="0.11"
          fill={colorHex}
          stroke="#FFFFFF"
          strokeWidth="0.03"
        />

        {/* 2. Pawn Body Pedestal / Waist */}
        <path
          d="M -0.24 0.16 C -0.18 0.02 -0.1 -0.06 -0.12 -0.15 L 0.12 -0.15 C 0.1 -0.06 0.18 0.02 0.24 0.16 Z"
          fill={colorHex}
          stroke="#FFFFFF"
          strokeWidth="0.03"
        />

        {/* Body highlight gradient */}
        <path
          d="M -0.1 0.12 C -0.06 0.02 -0.03 -0.04 -0.04 -0.12 L 0.04 -0.12 C 0.03 -0.04 0.06 0.02 0.1 0.12 Z"
          fill={lightHex}
          opacity="0.45"
        />

        {/* 3. Collar Ring */}
        <ellipse
          cx="0"
          cy="-0.15"
          rx="0.16"
          ry="0.06"
          fill="#FFFFFF"
          stroke={colorHex}
          strokeWidth="0.02"
        />

        {/* 4. Head Sphere (मस्तक) */}
        <circle
          cx="0"
          cy="-0.26"
          r="0.17"
          fill={colorHex}
          stroke="#FFFFFF"
          strokeWidth="0.03"
        />

        {/* 5. 3D Gloss Sheen on Head */}
        <circle
          cx="-0.05"
          cy="-0.31"
          r="0.055"
          fill="#FFFFFF"
          opacity="0.8"
        />
      </g>
    );
  };

  return (
    <div className="relative w-full max-w-[560px] aspect-square mx-auto bg-gradient-to-b from-amber-100 to-amber-200 rounded-3xl p-2.5 sm:p-4 shadow-2xl border-4 border-amber-950/30 select-none">
      {/* 15x15 SVG Grid Board */}
      <svg
        viewBox="0 0 15 15"
        className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-300"
        style={{ touchAction: 'manipulation' }}
      >
        <defs>
          <filter id="pawnShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0.1" stdDeviation="0.09" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* 1. Large Corner Yards */}
        {/* Green Yard (Top-Left: 6x6) */}
        <rect x="0" y="0" width="6" height="6" fill="#059669" />
        <rect x="0.8" y="0.8" width="4.4" height="4.4" rx="0.6" fill="#FFFFFF" />

        {/* Yellow Yard (Top-Right: 6x6) */}
        <rect x="9" y="0" width="6" height="6" fill="#D97706" />
        <rect x="9.8" y="0.8" width="4.4" height="4.4" rx="0.6" fill="#FFFFFF" />

        {/* Red Yard (Bottom-Left: 6x6) */}
        <rect x="0" y="9" width="6" height="6" fill="#DC2626" />
        <rect x="0.8" y="9.8" width="4.4" height="4.4" rx="0.6" fill="#FFFFFF" />

        {/* Blue Yard (Bottom-Right: 6x6) */}
        <rect x="9" y="9" width="6" height="6" fill="#2563EB" />
        <rect x="9.8" y="9.8" width="4.4" height="4.4" rx="0.6" fill="#FFFFFF" />

        {/* Yard Inner Circles for holding pawns */}
        {/* Green */}
        <circle cx="2" cy="2" r="0.75" fill="#D1FAE5" stroke="#059669" strokeWidth="0.08" />
        <circle cx="4" cy="2" r="0.75" fill="#D1FAE5" stroke="#059669" strokeWidth="0.08" />
        <circle cx="2" cy="4" r="0.75" fill="#D1FAE5" stroke="#059669" strokeWidth="0.08" />
        <circle cx="4" cy="4" r="0.75" fill="#D1FAE5" stroke="#059669" strokeWidth="0.08" />

        {/* Yellow */}
        <circle cx="11" cy="2" r="0.75" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.08" />
        <circle cx="13" cy="2" r="0.75" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.08" />
        <circle cx="11" cy="4" r="0.75" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.08" />
        <circle cx="13" cy="4" r="0.75" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.08" />

        {/* Red */}
        <circle cx="2" cy="11" r="0.75" fill="#FEE2E2" stroke="#DC2626" strokeWidth="0.08" />
        <circle cx="4" cy="11" r="0.75" fill="#FEE2E2" stroke="#DC2626" strokeWidth="0.08" />
        <circle cx="2" cy="13" r="0.75" fill="#FEE2E2" stroke="#DC2626" strokeWidth="0.08" />
        <circle cx="4" cy="13" r="0.75" fill="#FEE2E2" stroke="#DC2626" strokeWidth="0.08" />

        {/* Blue */}
        <circle cx="11" cy="11" r="0.75" fill="#DBEAFE" stroke="#2563EB" strokeWidth="0.08" />
        <circle cx="13" cy="11" r="0.75" fill="#DBEAFE" stroke="#2563EB" strokeWidth="0.08" />
        <circle cx="11" cy="13" r="0.75" fill="#DBEAFE" stroke="#2563EB" strokeWidth="0.08" />
        <circle cx="13" cy="13" r="0.75" fill="#DBEAFE" stroke="#2563EB" strokeWidth="0.08" />

        {/* 2. Common Track Grid Cells */}
        {TRACK_CELLS.map((cell, idx) => (
          <rect
            key={`track-${idx}`}
            x={cell.col}
            y={cell.row}
            width="1"
            height="1"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="0.04"
          />
        ))}

        {/* 3. Starting Cells with Colored Fill */}
        {/* Green Start: (6, 1) */}
        <rect x="1" y="6" width="1" height="1" fill="#059669" stroke="#CBD5E1" strokeWidth="0.04" />
        {/* Yellow Start: (1, 8) */}
        <rect x="8" y="1" width="1" height="1" fill="#D97706" stroke="#CBD5E1" strokeWidth="0.04" />
        {/* Blue Start: (8, 13) */}
        <rect x="13" y="8" width="1" height="1" fill="#2563EB" stroke="#CBD5E1" strokeWidth="0.04" />
        {/* Red Start: (13, 6) */}
        <rect x="6" y="13" width="1" height="1" fill="#DC2626" stroke="#CBD5E1" strokeWidth="0.04" />

        {/* 4. Colored Home Corridors */}
        {/* Green corridor: row 7, col 1..5 */}
        {[1, 2, 3, 4, 5].map((c) => (
          <rect
            key={`ghome-${c}`}
            x={c}
            y="7"
            width="1"
            height="1"
            fill="#10B981"
            stroke="#059669"
            strokeWidth="0.04"
          />
        ))}
        {/* Yellow corridor: col 7, row 1..5 */}
        {[1, 2, 3, 4, 5].map((r) => (
          <rect
            key={`yhome-${r}`}
            x="7"
            y={r}
            width="1"
            height="1"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth="0.04"
          />
        ))}
        {/* Blue corridor: row 7, col 9..13 */}
        {[9, 10, 11, 12, 13].map((c) => (
          <rect
            key={`bhome-${c}`}
            x={c}
            y="7"
            width="1"
            height="1"
            fill="#3B82F6"
            stroke="#2563EB"
            strokeWidth="0.04"
          />
        ))}
        {/* Red corridor: col 7, row 9..13 */}
        {[9, 10, 11, 12, 13].map((r) => (
          <rect
            key={`rhome-${r}`}
            x="7"
            y={r}
            width="1"
            height="1"
            fill="#EF4444"
            stroke="#DC2626"
            strokeWidth="0.04"
          />
        ))}

        {/* Corridor directional arrows pointing inwards */}
        <path d="M 1.2 7.5 L 1.8 7.2 L 1.8 7.8 Z" fill="#FFFFFF" opacity="0.8" />
        <path d="M 7.5 1.2 L 7.2 1.8 L 7.8 1.8 Z" fill="#FFFFFF" opacity="0.8" />
        <path d="M 13.8 7.5 L 13.2 7.2 L 13.2 7.8 Z" fill="#FFFFFF" opacity="0.8" />
        <path d="M 7.5 13.8 L 7.2 13.2 L 7.8 13.2 Z" fill="#FFFFFF" opacity="0.8" />

        {/* 5. Safe Spots / Stars on Track */}
        {Array.from(SAFE_TRACK_INDEXES).map((trackIdx) => {
          const coord = TRACK_CELLS[trackIdx];
          const isStartCell = [0, 13, 26, 39].includes(trackIdx);
          const starColor = isStartCell ? '#FFFFFF' : '#475569';
          return (
            <g
              key={`safe-star-${trackIdx}`}
              transform={`translate(${coord.col + 0.5}, ${coord.row + 0.5}) scale(0.038)`}
            >
              <path
                d="M 0 -10 L 2.6 -2.8 L 10 -2.8 L 4 1.8 L 6.2 9.5 L 0 5 L -6.2 9.5 L -4 1.8 L -10 -2.8 L -2.6 -2.8 Z"
                fill={starColor}
              />
            </g>
          );
        })}

        {/* 6. Central Home Triangles */}
        {/* Green Triangle (Left) */}
        <polygon points="6,6 7.5,7.5 6,9" fill="#059669" stroke="#047857" strokeWidth="0.04" />
        {/* Yellow Triangle (Top) */}
        <polygon points="6,6 7.5,7.5 9,6" fill="#D97706" stroke="#B45309" strokeWidth="0.04" />
        {/* Blue Triangle (Right) */}
        <polygon points="9,6 7.5,7.5 9,9" fill="#2563EB" stroke="#1D4ED8" strokeWidth="0.04" />
        {/* Red Triangle (Bottom) */}
        <polygon points="6,9 7.5,7.5 9,9" fill="#DC2626" stroke="#B91C1C" strokeWidth="0.04" />

        {/* Central Home Centerpiece */}
        <g transform="translate(7.5, 7.5) scale(0.04)">
          <circle cx="0" cy="0" r="13" fill="#FFFFFF" opacity="0.95" />
          <path
            d="M -5 -6 L 5 -6 L 4 0 C 4 3 2 5 0 5 C -2 5 -4 3 -4 0 Z M -2 5 L 2 5 L 3 8 L -3 8 Z M -5 -4 C -7 -4 -8 -2 -7 0 C -6 2 -5 1 -4 0 M 5 -4 C 7 -4 8 -2 7 0 C 6 2 5 1 4 0"
            fill="#D97706"
            stroke="#B45309"
            strokeWidth="0.8"
          />
        </g>

        {/* 7. Hover Destination Highlight */}
        {destinationCoord && (
          <g>
            <rect
              x={destinationCoord.col}
              y={destinationCoord.row}
              width="1"
              height="1"
              fill="rgba(16, 185, 129, 0.25)"
              stroke="#10B981"
              strokeWidth="0.09"
              strokeDasharray="0.16 0.08"
              className="animate-pulse"
            />
            <circle
              cx={destinationCoord.col + 0.5}
              cy={destinationCoord.row + 0.5}
              r="0.25"
              fill="#10B981"
              opacity="0.4"
              className="animate-ping"
            />
          </g>
        )}

        {/* 8. Render Pawns (गोटियाँ / मोहरे) */}
        {Array.from(tokenPlacements.entries()).map(([cellKey, items]) => {
          const count = items.length;

          return items.map(({ token, player, isHopping }, idx) => {
            const coord = getTokenCoordinate(player.id, token.id, token.stepCount);
            const isMovable =
              player.id === activePlayerColor && movableTokenIds.has(token.id);

            // Compute offset when multiple pawns occupy same cell
            let offsetX = 0;
            let offsetY = 0;
            if (count > 1) {
              const angle = (idx / count) * 2 * Math.PI;
              const radius = 0.22;
              offsetX = Math.cos(angle) * radius;
              offsetY = Math.sin(angle) * radius;
            }

            const cx = coord.col + 0.5 + offsetX;
            const cy = coord.row + 0.5 + offsetY;
            const scale = count > 1 ? 0.78 : 1.0;

            const config = COLOR_CONFIG[player.id];

            return (
              <g
                key={`pawn-${player.id}-${token.id}`}
                className={`${isMovable ? 'cursor-pointer' : 'pointer-events-none'}`}
                onClick={() => {
                  if (isMovable) {
                    onSelectToken(token.id);
                  }
                }}
                onMouseEnter={() => {
                  if (isMovable && onHoverMove) {
                    const move = validMoves.find((m) => m.tokenId === token.id);
                    onHoverMove(move || null);
                  }
                }}
                onMouseLeave={() => {
                  if (isMovable && onHoverMove) {
                    onHoverMove(null);
                  }
                }}
              >
                {render3DPawn(
                  cx,
                  cy,
                  scale,
                  config.hex,
                  config.lightHex,
                  isMovable,
                  isHopping
                )}
              </g>
            );
          });
        })}

        {/* 9. Render Capture Explosion / Starburst FX */}
        {captureEffects.map((fx) => (
          <g
            key={`fx-${fx.id}`}
            transform={`translate(${fx.col + 0.5}, ${fx.row + 0.5})`}
            className="animate-ping pointer-events-none"
          >
            <circle cx="0" cy="0" r="0.6" fill={fx.color} opacity="0.6" />
            <polygon
              points="0,-0.6 0.18,-0.18 0.6,0 0.18,0.18 0,0.6 -0.18,0.18 -0.6,0 -0.18,-0.18"
              fill="#FBBF24"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
