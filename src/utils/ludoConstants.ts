import { BoardCellCoord, PlayerColor } from '../types/ludo';

// 52 common track cells in clockwise order
export const TRACK_CELLS: BoardCellCoord[] = [
  /* 0  - Green Start */ { row: 6, col: 1 },
  /* 1 */ { row: 6, col: 2 },
  /* 2 */ { row: 6, col: 3 },
  /* 3 */ { row: 6, col: 4 },
  /* 4 */ { row: 6, col: 5 },
  /* 5 */ { row: 5, col: 6 },
  /* 6 */ { row: 4, col: 6 },
  /* 7 */ { row: 3, col: 6 },
  /* 8  - Safe */ { row: 2, col: 6 },
  /* 9 */ { row: 1, col: 6 },
  /* 10 */ { row: 0, col: 6 },
  /* 11 */ { row: 0, col: 7 },
  /* 12 */ { row: 0, col: 8 },
  /* 13 - Yellow Start */ { row: 1, col: 8 },
  /* 14 */ { row: 2, col: 8 },
  /* 15 */ { row: 3, col: 8 },
  /* 16 */ { row: 4, col: 8 },
  /* 17 */ { row: 5, col: 8 },
  /* 18 */ { row: 6, col: 9 },
  /* 19 */ { row: 6, col: 10 },
  /* 20 */ { row: 6, col: 11 },
  /* 21 - Safe */ { row: 6, col: 12 },
  /* 22 */ { row: 6, col: 13 },
  /* 23 */ { row: 6, col: 14 },
  /* 24 */ { row: 7, col: 14 },
  /* 25 */ { row: 8, col: 14 },
  /* 26 - Blue Start */ { row: 8, col: 13 },
  /* 27 */ { row: 8, col: 12 },
  /* 28 */ { row: 8, col: 11 },
  /* 29 */ { row: 8, col: 10 },
  /* 30 */ { row: 8, col: 9 },
  /* 31 */ { row: 9, col: 8 },
  /* 32 */ { row: 10, col: 8 },
  /* 33 */ { row: 11, col: 8 },
  /* 34 - Safe */ { row: 12, col: 8 },
  /* 35 */ { row: 13, col: 8 },
  /* 36 */ { row: 14, col: 8 },
  /* 37 */ { row: 14, col: 7 },
  /* 38 */ { row: 14, col: 6 },
  /* 39 - Red Start */ { row: 13, col: 6 },
  /* 40 */ { row: 12, col: 6 },
  /* 41 */ { row: 11, col: 6 },
  /* 42 */ { row: 10, col: 6 },
  /* 43 */ { row: 9, col: 6 },
  /* 44 */ { row: 8, col: 5 },
  /* 45 */ { row: 8, col: 4 },
  /* 46 */ { row: 8, col: 3 },
  /* 47 - Safe */ { row: 8, col: 2 },
  /* 48 */ { row: 8, col: 1 },
  /* 49 */ { row: 8, col: 0 },
  /* 50 */ { row: 7, col: 0 },
  /* 51 */ { row: 6, col: 0 },
];

// Safe track indexes (cannot capture)
export const SAFE_TRACK_INDEXES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Color configuration
export const COLOR_CONFIG: Record<
  PlayerColor,
  {
    startIndex: number;
    name: string;
    hindiName: string;
    hex: string;
    bgHex: string;
    lightHex: string;
    glowHex: string;
    homeCorridor: BoardCellCoord[];
    homeCenter: BoardCellCoord;
    yardCenter: BoardCellCoord;
    yardSlots: BoardCellCoord[];
  }
> = {
  GREEN: {
    startIndex: 0,
    name: 'Green',
    hindiName: 'हरा (Green)',
    hex: '#059669', // emerald-600
    bgHex: '#10B981',
    lightHex: '#D1FAE5',
    glowHex: 'rgba(16, 185, 129, 0.4)',
    homeCorridor: [
      { row: 7, col: 1 },
      { row: 7, col: 2 },
      { row: 7, col: 3 },
      { row: 7, col: 4 },
      { row: 7, col: 5 },
    ],
    homeCenter: { row: 7, col: 6 },
    yardCenter: { row: 2.5, col: 2.5 },
    yardSlots: [
      { row: 1.5, col: 1.5 },
      { row: 1.5, col: 3.5 },
      { row: 3.5, col: 1.5 },
      { row: 3.5, col: 3.5 },
    ],
  },
  YELLOW: {
    startIndex: 13,
    name: 'Yellow',
    hindiName: 'पीला (Yellow)',
    hex: '#D97706', // amber-600
    bgHex: '#F59E0B',
    lightHex: '#FEF3C7',
    glowHex: 'rgba(245, 158, 11, 0.4)',
    homeCorridor: [
      { row: 1, col: 7 },
      { row: 2, col: 7 },
      { row: 3, col: 7 },
      { row: 4, col: 7 },
      { row: 5, col: 7 },
    ],
    homeCenter: { row: 6, col: 7 },
    yardCenter: { row: 2.5, col: 11.5 },
    yardSlots: [
      { row: 1.5, col: 10.5 },
      { row: 1.5, col: 12.5 },
      { row: 3.5, col: 10.5 },
      { row: 3.5, col: 12.5 },
    ],
  },
  BLUE: {
    startIndex: 26,
    name: 'Blue',
    hindiName: 'नीला (Blue)',
    hex: '#2563EB', // blue-600
    bgHex: '#3B82F6',
    lightHex: '#DBEAFE',
    glowHex: 'rgba(59, 130, 246, 0.4)',
    homeCorridor: [
      { row: 7, col: 13 },
      { row: 7, col: 12 },
      { row: 7, col: 11 },
      { row: 7, col: 10 },
      { row: 7, col: 9 },
    ],
    homeCenter: { row: 7, col: 8 },
    yardCenter: { row: 11.5, col: 11.5 },
    yardSlots: [
      { row: 10.5, col: 10.5 },
      { row: 10.5, col: 12.5 },
      { row: 12.5, col: 10.5 },
      { row: 12.5, col: 12.5 },
    ],
  },
  RED: {
    startIndex: 39,
    name: 'Red',
    hindiName: 'लाल (Red)',
    hex: '#DC2626', // red-600
    bgHex: '#EF4444',
    lightHex: '#FEE2E2',
    glowHex: 'rgba(239, 68, 68, 0.4)',
    homeCorridor: [
      { row: 13, col: 7 },
      { row: 12, col: 7 },
      { row: 11, col: 7 },
      { row: 10, col: 7 },
      { row: 9, col: 7 },
    ],
    homeCenter: { row: 8, col: 7 },
    yardCenter: { row: 11.5, col: 2.5 },
    yardSlots: [
      { row: 10.5, col: 1.5 },
      { row: 10.5, col: 3.5 },
      { row: 12.5, col: 1.5 },
      { row: 12.5, col: 3.5 },
    ],
  },
};

export const COLOR_ORDER: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];

export const TOTAL_STEPS_TO_HOME = 56; // 0..50 (51 track) + 51..55 (5 corridor) + 56 (home)

/**
 * Returns exact cell coordinate for a token given its color and stepCount.
 */
export function getTokenCoordinate(
  color: PlayerColor,
  tokenId: number,
  stepCount: number
): BoardCellCoord {
  const config = COLOR_CONFIG[color];
  if (stepCount === -1) {
    // In Yard
    return config.yardSlots[tokenId];
  }
  if (stepCount >= 0 && stepCount <= 50) {
    // On circular track
    const trackIndex = (config.startIndex + stepCount) % 52;
    return TRACK_CELLS[trackIndex];
  }
  if (stepCount >= 51 && stepCount <= 55) {
    // In home corridor
    const corridorIdx = stepCount - 51;
    return config.homeCorridor[corridorIdx];
  }
  // Step 56: In Home center
  return config.homeCenter;
}

/**
 * Returns the track index (0..51) if the token is currently on the common circular track,
 * or -1 if in yard, home corridor, or finished.
 */
export function getTrackIndex(color: PlayerColor, stepCount: number): number {
  if (stepCount >= 0 && stepCount <= 50) {
    return (COLOR_CONFIG[color].startIndex + stepCount) % 52;
  }
  return -1;
}
