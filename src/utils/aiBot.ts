import { Player, PlayerColor, MoveOption } from '../types/ludo';
import {
  SAFE_TRACK_INDEXES,
  TOTAL_STEPS_TO_HOME,
  getTrackIndex,
} from './ludoConstants';

export function getValidMoves(
  player: Player,
  diceValue: number,
  allPlayers: Player[]
): MoveOption[] {
  const moves: MoveOption[] = [];

  player.tokens.forEach((token) => {
    // 1. In Yard
    if (token.stepCount === -1) {
      if (diceValue === 6) {
        // Can open token to start cell (stepCount 0)
        // Check if destination (start cell) has a capture
        const startTrackIndex = getTrackIndex(player.id, 0);
        let willCapture = false;
        
        // Find if opponent token is on our start position (though start is safe spot in standard rules)
        // In standard rules, start spots are safe, so no capture on start spot.
        moves.push({
          tokenId: token.id,
          fromStep: -1,
          toStep: 0,
          isOpening: true,
          willCapture,
          isHome: false,
        });
      }
      return;
    }

    // 2. Already Finished
    if (token.stepCount === TOTAL_STEPS_TO_HOME) {
      return;
    }

    // 3. On board or corridor
    const nextStep = token.stepCount + diceValue;

    // Check if nextStep exceeds center home
    if (nextStep > TOTAL_STEPS_TO_HOME) {
      // Cannot overshoot home! Needs exact roll
      return;
    }

    // Check if move lands on center home
    const isHome = nextStep === TOTAL_STEPS_TO_HOME;

    // Check if nextStep lands on an opponent token (capture)
    let willCapture = false;
    if (nextStep <= 50) {
      const targetTrackIndex = getTrackIndex(player.id, nextStep);
      // Can only capture if target cell is NOT safe
      if (!SAFE_TRACK_INDEXES.has(targetTrackIndex)) {
        for (const otherPlayer of allPlayers) {
          if (otherPlayer.id === player.id || !otherPlayer.active) continue;
          for (const oppToken of otherPlayer.tokens) {
            if (oppToken.stepCount >= 0 && oppToken.stepCount <= 50) {
              const oppTrackIndex = getTrackIndex(otherPlayer.id, oppToken.stepCount);
              if (oppTrackIndex === targetTrackIndex) {
                willCapture = true;
                break;
              }
            }
          }
          if (willCapture) break;
        }
      }
    }

    moves.push({
      tokenId: token.id,
      fromStep: token.stepCount,
      toStep: nextStep,
      isOpening: false,
      willCapture,
      isHome,
    });
  });

  return moves;
}

export function pickBestBotMove(
  player: Player,
  validMoves: MoveOption[],
  allPlayers: Player[]
): MoveOption | null {
  if (validMoves.length === 0) return null;
  if (validMoves.length === 1) return validMoves[0];

  let bestMove = validMoves[0];
  let highestScore = -Infinity;

  validMoves.forEach((move) => {
    let score = 0;

    // 1. Capture opponent token
    if (move.willCapture) {
      score += 120;
    }

    // 2. Reach center home
    if (move.isHome) {
      score += 100;
    }

    // 3. Move into safe home corridor (step 51..55)
    if (move.fromStep <= 50 && move.toStep > 50) {
      score += 65;
    }

    // 4. Open new token from yard when 6 is rolled
    if (move.isOpening) {
      const activeCount = player.tokens.filter(
        (t) => t.stepCount >= 0 && t.stepCount < TOTAL_STEPS_TO_HOME
      ).length;
      if (activeCount === 0) {
        score += 90; // Must open if no active token
      } else if (activeCount === 1) {
        score += 55;
      } else {
        score += 35;
      }
    }

    // 5. Land on a safe star cell
    if (!move.isOpening && move.toStep <= 50) {
      const targetTrackIndex = getTrackIndex(player.id, move.toStep);
      if (SAFE_TRACK_INDEXES.has(targetTrackIndex)) {
        score += 45;
      }
    }

    // 6. Escape danger if current cell is not safe and an opponent is within 6 steps behind
    if (move.fromStep >= 0 && move.fromStep <= 50) {
      const currentTrackIndex = getTrackIndex(player.id, move.fromStep);
      if (!SAFE_TRACK_INDEXES.has(currentTrackIndex)) {
        let isThreatened = false;
        for (const opp of allPlayers) {
          if (opp.id === player.id || !opp.active) continue;
          for (const oppToken of opp.tokens) {
            if (oppToken.stepCount >= 0 && oppToken.stepCount <= 50) {
              const oppTrackIndex = getTrackIndex(opp.id, oppToken.stepCount);
              const distanceBehind = (currentTrackIndex - oppTrackIndex + 52) % 52;
              if (distanceBehind >= 1 && distanceBehind <= 6) {
                isThreatened = true;
                break;
              }
            }
          }
          if (isThreatened) break;
        }
        if (isThreatened) {
          score += 40; // High incentive to escape
        }
      }
    }

    // 7. General progress bonus (prefer advancing token closer to home)
    score += (move.toStep / TOTAL_STEPS_TO_HOME) * 15;

    // 8. Slight randomness to add personality
    score += Math.random() * 4;

    if (score > highestScore) {
      highestScore = score;
      bestMove = move;
    }
  });

  return bestMove;
}
