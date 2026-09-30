import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Player,
  PlayerColor,
  PlayerType,
  MoveOption,
  GamePhase,
  GameSpeed,
  CaptureEffect,
  GameStats,
} from './types/ludo';
import {
  COLOR_CONFIG,
  COLOR_ORDER,
  TOTAL_STEPS_TO_HOME,
  getTrackIndex,
  SAFE_TRACK_INDEXES,
  getTokenCoordinate,
} from './utils/ludoConstants';
import { soundManager } from './utils/audio';
import { getValidMoves, pickBestBotMove } from './utils/aiBot';
import { LudoBoard } from './components/LudoBoard';
import { Dice3D } from './components/Dice3D';
import { PlayerCard } from './components/PlayerCard';
import { AndroidProjectModal } from './components/AndroidProjectModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { RulesGuideModal } from './components/RulesGuideModal';
import { VictoryModal } from './components/VictoryModal';
import {
  FolderArchive,
  Volume2,
  VolumeX,
  RotateCcw,
  Settings,
  HelpCircle,
  Play,
  Pause,
  Trophy,
  Dices,
  Smartphone,
  Monitor,
  Zap,
  Sparkles,
} from 'lucide-react';

const INITIAL_PLAYERS: Player[] = [
  {
    id: 'RED',
    name: 'लाल (Red)',
    type: 'HUMAN',
    colorHex: COLOR_CONFIG.RED.hex,
    bgHex: COLOR_CONFIG.RED.bgHex,
    lightHex: COLOR_CONFIG.RED.lightHex,
    hasWon: false,
    rank: null,
    active: true,
    tokens: [
      { id: 0, color: 'RED', position: -1, stepCount: -1 },
      { id: 1, color: 'RED', position: -1, stepCount: -1 },
      { id: 2, color: 'RED', position: -1, stepCount: -1 },
      { id: 3, color: 'RED', position: -1, stepCount: -1 },
    ],
  },
  {
    id: 'GREEN',
    name: 'हरा (Green)',
    type: 'BOT',
    colorHex: COLOR_CONFIG.GREEN.hex,
    bgHex: COLOR_CONFIG.GREEN.bgHex,
    lightHex: COLOR_CONFIG.GREEN.lightHex,
    hasWon: false,
    rank: null,
    active: true,
    tokens: [
      { id: 0, color: 'GREEN', position: -1, stepCount: -1 },
      { id: 1, color: 'GREEN', position: -1, stepCount: -1 },
      { id: 2, color: 'GREEN', position: -1, stepCount: -1 },
      { id: 3, color: 'GREEN', position: -1, stepCount: -1 },
    ],
  },
  {
    id: 'YELLOW',
    name: 'पीला (Yellow)',
    type: 'BOT',
    colorHex: COLOR_CONFIG.YELLOW.hex,
    bgHex: COLOR_CONFIG.YELLOW.bgHex,
    lightHex: COLOR_CONFIG.YELLOW.lightHex,
    hasWon: false,
    rank: null,
    active: true,
    tokens: [
      { id: 0, color: 'YELLOW', position: -1, stepCount: -1 },
      { id: 1, color: 'YELLOW', position: -1, stepCount: -1 },
      { id: 2, color: 'YELLOW', position: -1, stepCount: -1 },
      { id: 3, color: 'YELLOW', position: -1, stepCount: -1 },
    ],
  },
  {
    id: 'BLUE',
    name: 'नीला (Blue)',
    type: 'BOT',
    colorHex: COLOR_CONFIG.BLUE.hex,
    bgHex: COLOR_CONFIG.BLUE.bgHex,
    lightHex: COLOR_CONFIG.BLUE.lightHex,
    hasWon: false,
    rank: null,
    active: true,
    tokens: [
      { id: 0, color: 'BLUE', position: -1, stepCount: -1 },
      { id: 1, color: 'BLUE', position: -1, stepCount: -1 },
      { id: 2, color: 'BLUE', position: -1, stepCount: -1 },
      { id: 3, color: 'BLUE', position: -1, stepCount: -1 },
    ],
  },
];

export default function App() {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [activeTurnColor, setActiveTurnColor] = useState<PlayerColor>('RED');
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [phase, setPhase] = useState<GamePhase>('ROLL_DICE');
  const [validMoves, setValidMoves] = useState<MoveOption[]>([]);
  const [hoveredMove, setHoveredMove] = useState<MoveOption | null>(null);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    'लूडो वीडियो डेमो तैयार है! लाल (Red) पासा फेंकें या ऑटो-डेमो चालू करें।'
  );

  // Video / Auto-Demo & Mobile Frame Controls
  const [isAutoDemo, setIsAutoDemo] = useState<boolean>(false);
  const [mobileFrameMode, setMobileFrameMode] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<GameSpeed>('1x');

  // Animation states
  const [animatingToken, setAnimatingToken] = useState<{
    color: PlayerColor;
    tokenId: number;
    stepCount: number;
  } | null>(null);
  const [captureEffects, setCaptureEffects] = useState<CaptureEffect[]>([]);

  // Modals state
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);
  const [androidModalTab, setAndroidModalTab] = useState<'apk_guide' | 'download_project' | 'code_viewer' | 'commands'>('apk_guide');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const openAndroidModal = (tab: 'apk_guide' | 'download_project' | 'code_viewer' | 'commands' = 'apk_guide') => {
    setAndroidModalTab(tab);
    setShowAndroidModal(true);
  };

  // Stats
  const [gameStats, setGameStats] = useState<GameStats>({
    turnsPlayed: 0,
    totalSixes: 0,
    totalCaptures: 0,
    startTime: Date.now(),
  });

  const activePlayer = players.find((p) => p.id === activeTurnColor)!;

  // Determine if active player acts as a bot (either player.type === BOT or Auto-Demo mode is active)
  const isCurrentPlayerBot =
    activePlayer.type === 'BOT' || (isAutoDemo && activePlayer.type === 'HUMAN');

  // Turn speed delays
  const stepDelay =
    gameSpeed === '2x' ? 65 : gameSpeed === '1.5x' ? 95 : 140;
  const botThinkDelay =
    gameSpeed === '2x' ? 300 : gameSpeed === '1.5x' ? 450 : 600;

  // Switch turn
  const passTurn = useCallback(() => {
    setConsecutiveSixes(0);
    setValidMoves([]);
    setHoveredMove(null);

    const activeList = players.filter((p) => p.active && !p.hasWon);
    if (activeList.length <= 1) {
      return;
    }

    const currentIdx = activeList.findIndex((p) => p.id === activeTurnColor);
    const nextIdx = (currentIdx + 1) % activeList.length;
    const nextPlayer = activeList[nextIdx];

    setActiveTurnColor(nextPlayer.id);
    setPhase('ROLL_DICE');
    setStatusMessage(`अब ${COLOR_CONFIG[nextPlayer.id].hindiName} की बारी है!`);
  }, [players, activeTurnColor]);

  // Execute step-by-step hopping movement
  const executeMove = useCallback(
    (tokenId: number) => {
      if (phase !== 'SELECT_TOKEN') return;

      const move = validMoves.find((m) => m.tokenId === tokenId);
      if (!move) return;

      setPhase('MOVING_TOKEN');
      setHoveredMove(null);

      const pIdx = players.findIndex((p) => p.id === activeTurnColor);
      const currP = players[pIdx];
      const token = currP.tokens.find((t) => t.id === tokenId)!;

      // Handle opening directly from Yard (-1 to 0)
      if (move.isOpening) {
        soundManager.playTokenStep();
        setAnimatingToken({ color: currP.id, tokenId, stepCount: 0 });

        setTimeout(() => {
          setAnimatingToken(null);
          const updatedPlayers = [...players];
          const updatedP = { ...currP };
          const updatedTokens = [...updatedP.tokens];
          const tIdx = updatedTokens.findIndex((t) => t.id === tokenId);
          updatedTokens[tIdx] = { ...token, stepCount: 0 };
          updatedP.tokens = updatedTokens;
          updatedPlayers[pIdx] = updatedP;
          setPlayers(updatedPlayers);

          setStatusMessage(
            `🎉 ${COLOR_CONFIG[currP.id].name} का मोहरा मैदान में आया!`
          );

          // Extra roll for 6
          setPhase('ROLL_DICE');
          setStatusMessage(`⭐ छक्का आने पर ${currP.name} को बोनस रोल मिला!`);
        }, stepDelay * 1.5);
        return;
      }

      // Step-by-step hopping loop
      let currentHop = move.fromStep;
      const targetHop = move.toStep;

      const hopInterval = setInterval(() => {
        currentHop++;
        soundManager.playTokenStep();
        setAnimatingToken({ color: currP.id, tokenId, stepCount: currentHop });

        if (currentHop >= targetHop) {
          clearInterval(hopInterval);

          setTimeout(() => {
            setAnimatingToken(null);

            // Finalize position in state
            const updatedPlayers = [...players];
            const updatedP = { ...currP };
            const updatedTokens = [...updatedP.tokens];
            const tIdx = updatedTokens.findIndex((t) => t.id === tokenId);
            updatedTokens[tIdx] = { ...token, stepCount: targetHop };
            updatedP.tokens = updatedTokens;

            let wasCapture = false;
            let extraRoll = false;

            // Safe Spot sound
            if (targetHop <= 50) {
              const trackIdx = getTrackIndex(currP.id, targetHop);
              if (SAFE_TRACK_INDEXES.has(trackIdx)) {
                soundManager.playSafeSpot();
              }
            }

            // Home enter check
            if (move.isHome) {
              soundManager.playHomeEnter();
              extraRoll = true;
              setStatusMessage(`🌟 ${currP.name} का मोहरा होम पहुंच गया!`);
            }

            // Capture check on common track
            if (targetHop <= 50) {
              const myTrackIdx = getTrackIndex(currP.id, targetHop);
              if (!SAFE_TRACK_INDEXES.has(myTrackIdx)) {
                updatedPlayers.forEach((otherP, oIdx) => {
                  if (otherP.id !== currP.id && otherP.active) {
                    const oppTokens = [...otherP.tokens];
                    let oppCaptured = false;
                    oppTokens.forEach((oppT, oppIdx) => {
                      if (oppT.stepCount >= 0 && oppT.stepCount <= 50) {
                        const oppTrackIdx = getTrackIndex(
                          otherP.id,
                          oppT.stepCount
                        );
                        if (oppTrackIdx === myTrackIdx) {
                          // Capture!
                          oppTokens[oppIdx] = { ...oppT, stepCount: -1 };
                          oppCaptured = true;
                          wasCapture = true;
                          extraRoll = true;
                          soundManager.playCapture();

                          // Trigger visual burst FX
                          const targetCoord = getTokenCoordinate(
                            currP.id,
                            tokenId,
                            targetHop
                          );
                          const fxId = Date.now();
                          setCaptureEffects((prev) => [
                            ...prev,
                            {
                              id: fxId,
                              row: targetCoord.row,
                              col: targetCoord.col,
                              color: COLOR_CONFIG[otherP.id].hex,
                            },
                          ]);
                          setTimeout(() => {
                            setCaptureEffects((prev) =>
                              prev.filter((fx) => fx.id !== fxId)
                            );
                          }, 750);

                          setStatusMessage(
                            `💥 ${currP.name} ने ${COLOR_CONFIG[otherP.id].name} का मोहरा काट दिया!`
                          );
                        }
                      }
                    });
                    if (oppCaptured) {
                      updatedPlayers[oIdx] = { ...otherP, tokens: oppTokens };
                    }
                  }
                });
              }
            }

            // Check if player has won
            const allHome = updatedTokens.every(
              (t) => t.stepCount === TOTAL_STEPS_TO_HOME
            );
            if (allHome && !updatedP.hasWon) {
              updatedP.hasWon = true;
              updatedP.rank = 1;
              setWinner(updatedP);
              soundManager.playVictory();
              setStatusMessage(`🏆 विजेता: ${updatedP.name}! बधाई हो!`);
            }

            updatedPlayers[pIdx] = updatedP;
            setPlayers(updatedPlayers);

            // Stats
            setGameStats((prev) => ({
              ...prev,
              turnsPlayed: prev.turnsPlayed + 1,
              totalCaptures: prev.totalCaptures + (wasCapture ? 1 : 0),
            }));

            // Extra roll if 6 rolled
            if (diceValue === 6 && consecutiveSixes < 3) {
              extraRoll = true;
            }

            setTimeout(() => {
              if (extraRoll && !updatedP.hasWon) {
                setPhase('ROLL_DICE');
                setStatusMessage(
                  `⭐ ${updatedP.name} को बोनस रोल मिला! दोबारा पासा फेंकें।`
                );
              } else {
                passTurn();
              }
            }, stepDelay * 2.5);
          }, stepDelay);
        }
      }, stepDelay);
    },
    [
      phase,
      validMoves,
      players,
      activeTurnColor,
      diceValue,
      consecutiveSixes,
      stepDelay,
      passTurn,
    ]
  );

  // Roll Dice handler
  const handleRollDice = useCallback(() => {
    if (phase !== 'ROLL_DICE' || isRolling) return;

    setIsRolling(true);
    soundManager.playDiceRoll();

    let rollTicks = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollTicks++;
      if (rollTicks >= 6) {
        clearInterval(interval);
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalDice);
        setIsRolling(false);

        const newConsecSixes = finalDice === 6 ? consecutiveSixes + 1 : 0;
        setConsecutiveSixes(newConsecSixes);

        if (finalDice === 6) {
          soundManager.playSixRolled();
          setGameStats((s) => ({ ...s, totalSixes: s.totalSixes + 1 }));
        }

        // 3 consecutive sixes penalty
        if (newConsecSixes === 3) {
          setStatusMessage('⚠️ लगातार 3 छक्के! यह चाल रद्द होती है।');
          setTimeout(() => {
            passTurn();
          }, botThinkDelay * 1.5);
          return;
        }

        // Calculate valid moves
        const moves = getValidMoves(activePlayer, finalDice, players);
        setValidMoves(moves);

        if (moves.length === 0) {
          setStatusMessage(
            `नंबर ${finalDice} आया। ${activePlayer.name} के लिए कोई चाल उपलब्ध नहीं!`
          );
          setTimeout(() => {
            passTurn();
          }, botThinkDelay * 1.2);
        } else {
          setPhase('SELECT_TOKEN');
          setStatusMessage(
            `नंबर ${finalDice} आया! चाल चलने के लिए चमकता मोहरा चुनें।`
          );

          // If Bot or Auto-Demo mode: auto-select best move
          if (isCurrentPlayerBot) {
            const bestMove = pickBestBotMove(activePlayer, moves, players);
            if (bestMove) {
              setTimeout(() => {
                executeMove(bestMove.tokenId);
              }, botThinkDelay);
            }
          }
        }
      }
    }, 45);
  }, [
    phase,
    isRolling,
    consecutiveSixes,
    activePlayer,
    players,
    isCurrentPlayerBot,
    botThinkDelay,
    passTurn,
    executeMove,
  ]);

  // Automated trigger for Bot / Auto-Demo turn
  useEffect(() => {
    if (isCurrentPlayerBot && phase === 'ROLL_DICE' && !isRolling && !winner) {
      const timer = setTimeout(() => {
        handleRollDice();
      }, botThinkDelay);
      return () => clearTimeout(timer);
    }
  }, [isCurrentPlayerBot, phase, isRolling, winner, botThinkDelay, handleRollDice]);

  // Reset Game
  const handleResetGame = () => {
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        hasWon: false,
        rank: null,
        tokens: p.tokens.map((t) => ({ ...t, stepCount: -1, position: -1 })),
      }))
    );
    setActiveTurnColor('RED');
    setDiceValue(1);
    setPhase('ROLL_DICE');
    setValidMoves([]);
    setHoveredMove(null);
    setWinner(null);
    setConsecutiveSixes(0);
    setAnimatingToken(null);
    setCaptureEffects([]);
    setGameStats({
      turnsPlayed: 0,
      totalSixes: 0,
      totalCaptures: 0,
      startTime: Date.now(),
    });
    setStatusMessage('खेल दोबारा शुरू हुआ! लाल (Red) पासा फेंकें।');
  };

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleSetPlayerCount = (count: number) => {
    setPlayerCount(count);
    let activeColors: PlayerColor[] = [];
    if (count === 2) {
      activeColors = ['RED', 'YELLOW'];
    } else if (count === 3) {
      activeColors = ['RED', 'GREEN', 'YELLOW'];
    } else {
      activeColors = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    }

    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        active: activeColors.includes(p.id),
      }))
    );

    if (!activeColors.includes(activeTurnColor)) {
      setActiveTurnColor('RED');
    }
  };

  const handleUpdatePlayer = (color: PlayerColor, updates: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === color ? { ...p, ...updates } : p))
    );
  };

  const activeConf = COLOR_CONFIG[activeTurnColor];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 via-amber-500 to-blue-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Dices className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>लूडो गेम</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  Playable Demo
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                पासा और चार रंगों के मोहरे (Red, Green, Yellow, Blue)
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Auto Demo Video Mode Toggle */}
            <button
              onClick={() => setIsAutoDemo((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                isAutoDemo
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="ऑटो-डेमो मोड: चारों रंगों के मोहरे अपने आप खेलते हैं"
            >
              {isAutoDemo ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>ऑटो-डेमो रोकें</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span>▶️ ऑटो-डेमो (Watch Match)</span>
                </>
              )}
            </button>

            {/* Mobile Device Frame Toggle */}
            <button
              onClick={() => setMobileFrameMode((prev) => !prev)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                mobileFrameMode
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={mobileFrameMode ? 'फुलस्क्रीन व्यू' : 'मोबाइल स्क्रीन व्यू'}
            >
              {mobileFrameMode ? (
                <Monitor className="w-4 h-4" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
            </button>

            {/* Speed control */}
            <div className="hidden xs:flex bg-slate-800 p-0.5 rounded-xl">
              {(['1x', '1.5x', '2x'] as GameSpeed[]).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setGameSpeed(spd)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-lg cursor-pointer transition-colors ${
                    gameSpeed === spd
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>

            {/* Android Project ZIP & APK Guide Button */}
            <button
              onClick={() => openAndroidModal('apk_guide')}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-transform active:scale-95 cursor-pointer ring-1 ring-emerald-400/40"
              title="APK बनाने का तरीका और Android Studio Kotlin + XML प्रोजेक्ट डाउनलोड करें"
            >
              <Smartphone className="w-4 h-4 text-emerald-200" />
              <span>📲 APK बनाने का तरीका</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMuted ? 'ध्वनि चालू करें' : 'ध्वनि बंद करें'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="सेटिंग्स"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Rules */}
            <button
              onClick={() => setShowRulesModal(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="नियम"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Reset */}
            <button
              onClick={handleResetGame}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="खेल रीसेट करें"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 flex flex-col items-center justify-center">
        {/* Optional Mobile Device Enclosure View */}
        <div
          className={`w-full transition-all duration-300 ${
            mobileFrameMode
              ? 'max-w-[420px] bg-slate-900 border-8 border-slate-800 rounded-[44px] shadow-2xl p-3 sm:p-4 my-2 relative ring-1 ring-slate-700/60'
              : 'max-w-6xl'
          }`}
        >
          {/* Mobile Speaker / Notch if in Mobile Frame Mode */}
          {mobileFrameMode && (
            <div className="flex justify-between items-center px-4 py-1 mb-2 text-[10px] text-slate-400 font-mono">
              <span>9:41</span>
              <div className="w-16 h-4 bg-slate-950 rounded-full mx-auto -mt-1 shadow-inner" />
              <span>100% 🔋</span>
            </div>
          )}

          {/* Auto-Demo Live Announcement Banner */}
          {isAutoDemo && (
            <div className="w-full mb-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>🎬 लाइव वीडियो डेमो चल रहा है (Auto-Play)</span>
              </span>
              <button
                onClick={() => setIsAutoDemo(false)}
                className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold rounded-md text-[10px] hover:bg-amber-400 cursor-pointer"
              >
                🎮 मैं खेलूँगा
              </button>
            </div>
          )}

          {/* APK Guide & Ready Project Highlight Banner */}
          <div className="w-full mb-3 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-blue-950/80 border border-emerald-500/40 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/50">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm sm:text-base text-white">
                    APK बनाने का तरीका
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                    Ludo Game Kotlin + XML
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  1. मेरा तैयार प्रोजेक्ट डाउनलोड करें &bull; 2. Android Studio में 'Build APK' से 1 मिनट में APK पाएं
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
              <button
                onClick={() => openAndroidModal('download_project')}
                className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <FolderArchive className="w-4 h-4 text-blue-400" />
                <span>1. तैयार प्रोजेक्ट ZIP</span>
              </button>
              <button
                onClick={() => openAndroidModal('apk_guide')}
                className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer transition-transform active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>2. APK गाइड देखें &rarr;</span>
              </button>
            </div>
          </div>

          {/* Layout Container */}
          <div
            className={`flex flex-col ${
              mobileFrameMode ? 'gap-2' : 'lg:flex-row gap-4'
            } items-center justify-center w-full`}
          >
            {/* Left Players (Green & Red) on desktop layout */}
            {!mobileFrameMode && (
              <div className="w-full lg:w-64 flex lg:flex-col gap-2.5 order-2 lg:order-1 justify-center">
                {players[1].active && (
                  <PlayerCard
                    player={players[1]} // GREEN (Top-Left)
                    isCurrentTurn={activeTurnColor === 'GREEN'}
                    canRoll={phase === 'ROLL_DICE' && !isRolling}
                    position="top-left"
                    onQuickRoll={handleRollDice}
                  />
                )}
                {players[0].active && (
                  <PlayerCard
                    player={players[0]} // RED (Bottom-Left)
                    isCurrentTurn={activeTurnColor === 'RED'}
                    canRoll={phase === 'ROLL_DICE' && !isRolling}
                    position="bottom-left"
                    onQuickRoll={handleRollDice}
                  />
                )}
              </div>
            )}

            {/* Center: The Board & Game Stage */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-[560px] w-full order-1 lg:order-2">
              {/* Turn Status Banner */}
              <div
                className="w-full mb-2.5 px-3 sm:px-4 py-2 rounded-2xl border text-center transition-all shadow-md flex items-center justify-between"
                style={{
                  backgroundColor: `${activeConf.hex}18`,
                  borderColor: `${activeConf.hex}60`,
                }}
              >
                <div className="flex items-center gap-2 text-left min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: activeConf.hex }}
                  />
                  <div className="truncate">
                    <span className="text-xs sm:text-sm font-bold text-white block truncate">
                      {statusMessage}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {phase === 'ROLL_DICE' &&
                        (isCurrentPlayerBot
                          ? 'बॉट पासा फेंक रहा है...'
                          : 'पासा फेंकने के लिए बटन दबाएं')}
                      {phase === 'SELECT_TOKEN' &&
                        `${validMoves.length} चालें उपलब्ध - चमकते मोहरे पर क्लिक करें`}
                      {phase === 'MOVING_TOKEN' && 'मोहरा आगे बढ़ रहा है...'}
                    </span>
                  </div>
                </div>

                <div
                  className="px-2.5 py-1 rounded-xl bg-slate-900 border text-white font-mono font-bold text-xs sm:text-sm shrink-0 shadow-sm"
                  style={{ borderColor: activeConf.hex }}
                >
                  🎲 {diceValue}
                </div>
              </div>

              {/* The 15x15 Ludo Board */}
              <LudoBoard
                players={players}
                activePlayerColor={activeTurnColor}
                validMoves={validMoves}
                onSelectToken={executeMove}
                hoveredMove={hoveredMove}
                onHoverMove={setHoveredMove}
                animatingToken={animatingToken}
                captureEffects={captureEffects}
              />

              {/* In Mobile Frame Mode: Mini Player Roster Row */}
              {mobileFrameMode && (
                <div className="grid grid-cols-4 gap-1.5 w-full mt-2">
                  {players.map((p) => {
                    if (!p.active) return null;
                    const conf = COLOR_CONFIG[p.id];
                    const isTurn = p.id === activeTurnColor;
                    return (
                      <div
                        key={p.id}
                        className={`p-1.5 rounded-xl border text-center transition-all ${
                          isTurn
                            ? 'bg-slate-800 border-2 shadow-md'
                            : 'bg-slate-900/80 border-slate-800 opacity-75'
                        }`}
                        style={{ borderColor: isTurn ? conf.hex : undefined }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full mx-auto mb-0.5"
                          style={{ backgroundColor: conf.hex }}
                        />
                        <div className="text-[10px] font-bold text-white truncate">
                          {p.name.split(' ')[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dice Roller Bottom Bar */}
              <div className="w-full mt-2.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-around gap-4">
                <Dice3D
                  value={diceValue}
                  isRolling={isRolling}
                  canRoll={
                    phase === 'ROLL_DICE' &&
                    !isCurrentPlayerBot &&
                    !isRolling
                  }
                  activeColor={activeTurnColor}
                  onRoll={handleRollDice}
                  disabled={isCurrentPlayerBot}
                />

                <div className="text-left text-xs max-w-[200px] text-slate-400">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: activeConf.hex }}
                    />
                    <span>{activePlayer.name}</span>
                  </div>
                  <div className="text-[11px] mt-0.5 text-slate-400">
                    {isCurrentPlayerBot
                      ? '🤖 ऑटो-चाल (Bot/Demo)'
                      : phase === 'ROLL_DICE'
                      ? '👇 पासा फेंकें'
                      : '👇 मोहरा चुनें'}
                  </div>
                </div>

                <button
                  onClick={() => setShowAndroidModal(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-400 flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
                >
                  <FolderArchive className="w-4 h-4 text-emerald-400" />
                  <span>Android कोड</span>
                </button>
              </div>
            </div>

            {/* Right Players (Yellow & Blue) on desktop layout */}
            {!mobileFrameMode && (
              <div className="w-full lg:w-64 flex lg:flex-col gap-2.5 order-3 justify-center">
                {players[2].active && (
                  <PlayerCard
                    player={players[2]} // YELLOW (Top-Right)
                    isCurrentTurn={activeTurnColor === 'YELLOW'}
                    canRoll={phase === 'ROLL_DICE' && !isRolling}
                    position="top-right"
                    onQuickRoll={handleRollDice}
                  />
                )}
                {players[3].active && (
                  <PlayerCard
                    player={players[3]} // BLUE (Bottom-Right)
                    isCurrentTurn={activeTurnColor === 'BLUE'}
                    canRoll={phase === 'ROLL_DICE' && !isRolling}
                    position="bottom-right"
                    onQuickRoll={handleRollDice}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AndroidProjectModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
        initialTab={androidModalTab}
      />

      <GameSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        playerCount={playerCount}
        setPlayerCount={handleSetPlayerCount}
        players={players}
        onUpdatePlayer={handleUpdatePlayer}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onStartNewGame={handleResetGame}
      />

      <RulesGuideModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      <VictoryModal
        winner={winner}
        onNewGame={handleResetGame}
        stats={gameStats}
      />
    </div>
  );
}
