export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export type PlayerType = 'HUMAN' | 'BOT';

export interface Token {
  id: number; // 0 to 3
  color: PlayerColor;
  position: number; // -1 for yard, 0..50 on common track, 51..55 in home corridor, 56 for center home
  stepCount: number; // -1 for yard, 0 for start position, 1..50, 51..55, 56 for finished
}

export interface Player {
  id: PlayerColor;
  name: string;
  type: PlayerType;
  colorHex: string;
  bgHex: string;
  lightHex: string;
  tokens: Token[];
  hasWon: boolean;
  rank: number | null; // 1st, 2nd, 3rd, 4th
  active: boolean; // whether this player is in the current game (e.g. in 2-player mode, Red and Yellow might be active)
}

export interface BoardCellCoord {
  row: number; // 0 to 14
  col: number; // 0 to 14
}

export interface MoveOption {
  tokenId: number;
  fromStep: number;
  toStep: number;
  isOpening: boolean;
  willCapture: boolean;
  isHome: boolean;
}

export type GamePhase = 'ROLL_DICE' | 'SELECT_TOKEN' | 'MOVING_TOKEN' | 'GAME_OVER';

export type GameSpeed = '1x' | '1.5x' | '2x';

export interface CaptureEffect {
  row: number;
  col: number;
  color: string;
  id: number;
}

export interface GameStats {
  turnsPlayed: number;
  totalSixes: number;
  totalCaptures: number;
  startTime: number;
}
