import { useState, useCallback } from 'react';
import type {
  GamePhase,
  GameMode,
  Difficulty,
  AtBatState,
  Zone,
  PitchOutcome,
  PitchTrajectory,
  AtBatOutcome,
  KorPitcherProfile,
  DomLineup,
  BatterProfile,
  PitchOption,
} from './data/types';
import { SCENARIOS } from './data/scenarios';
import { BATTER_PROFILES } from './data/batterProfiles';
import { PITCHER_REPERTOIRE } from './data/pitcherRepertoire';
import { DOM_BATTER_PROFILES } from './data/domBatterProfiles';
import { DOM_LINEUPS } from './data/domLineups';
import { KOR_PITCHERS } from './data/korPitcherProfiles';
import { determinePitchOutcome, generatePitchTrajectory } from './engine/outcomeEngine';
import { scorePitch, scoreAtBat, calculateTotalScore, calculateLeadScore } from './utils/scoring';
import type { AtBatSummary } from './utils/scoring';
import GameIntro from './components/GameIntro';
import PitchSelector from './components/PitchSelector';
import PitchScene from './components/PitchScene';
import OutcomeDisplay from './components/OutcomeDisplay';
import AtBatResult from './components/AtBatResult';
import GameResult from './components/GameResult';
import HUD from './components/HUD';
import ModeSelect from './components/ModeSelect';
import PitcherSelect from './components/PitcherSelect';
import LineupSelect from './components/LineupSelect';
import DifficultySelect from './components/DifficultySelect';
import MissNotify from './components/MissNotify';

const TOTAL_AT_BATS_JAPAN = SCENARIOS.length;

function isAtBatOver(
  outcome: PitchOutcome,
  balls: number,
  strikes: number,
): { over: boolean; result: AtBatOutcome | null } {
  // In-play outcomes immediately end the at-bat
  if (['single', 'double', 'triple', 'homerun'].includes(outcome)) {
    return {
      over: true,
      result: { type: 'hit', result: outcome as 'single' | 'double' | 'triple' | 'homerun' },
    };
  }
  if (['groundout', 'flyout', 'lineout'].includes(outcome)) {
    return {
      over: true,
      result: { type: 'out', result: outcome as 'groundout' | 'flyout' | 'lineout' },
    };
  }

  // Count-based endings
  if (outcome === 'swinging_strike' || outcome === 'called_strike') {
    if (strikes + 1 >= 3) {
      return { over: true, result: { type: 'strikeout' } };
    }
  }
  if (outcome === 'ball') {
    if (balls + 1 >= 4) {
      return { over: true, result: { type: 'walk' } };
    }
  }

  return { over: false, result: null };
}

function updateCount(
  outcome: PitchOutcome,
  balls: number,
  strikes: number,
): { balls: number; strikes: number } {
  switch (outcome) {
    case 'called_strike':
    case 'swinging_strike':
      return { balls, strikes: Math.min(strikes + 1, 3) };
    case 'foul':
      // Foul with 2 strikes doesn't add a strike
      return { balls, strikes: strikes < 2 ? strikes + 1 : strikes };
    case 'ball':
      return { balls: Math.min(balls + 1, 4), strikes };
    default:
      // In-play outcomes don't change count
      return { balls, strikes };
  }
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('mode_select');
  const [gameMode, setGameMode] = useState<GameMode>('japan');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [selectedPitcher, setSelectedPitcher] = useState<KorPitcherProfile | null>(null);
  const [selectedLineup, setSelectedLineup] = useState<DomLineup | null>(null);
  const [atBat, setAtBat] = useState<AtBatState>({
    scenarioIndex: 0,
    balls: 0,
    strikes: 0,
    pitchHistory: [],
    result: null,
  });
  const [completedAtBats, setCompletedAtBats] = useState<AtBatSummary[]>([]);
  const [currentTrajectory, setCurrentTrajectory] = useState<PitchTrajectory | null>(null);
  const [lastOutcome, setLastOutcome] = useState<{
    outcome: PitchOutcome;
    pitchCode: string;
    zone: Zone;
    actualZone: Zone;
    newBalls: number;
    newStrikes: number;
  } | null>(null);
  const [atBatOver, setAtBatOver] = useState<{ result: AtBatOutcome; score: number } | null>(null);

  // Derived data based on mode
  const totalAtBats = gameMode === 'dom'
    ? (selectedLineup?.batterIds.length ?? 9)
    : TOTAL_AT_BATS_JAPAN;

  // Current batter/pitcher based on mode
  let batter: BatterProfile | null = null;
  let pitcher: { pitches: PitchOption[]; hand: 'L' | 'R'; nameKo: string } | null = null;
  let scenario = undefined as ReturnType<typeof Object.assign> | undefined;

  if (gameMode === 'japan') {
    const sc = SCENARIOS[atBat.scenarioIndex];
    scenario = sc;
    batter = sc ? BATTER_PROFILES[sc.batterId] : null;
    const pitcherData = sc ? PITCHER_REPERTOIRE[sc.pitcherId] : null;
    pitcher = pitcherData ? { pitches: pitcherData.pitches, hand: pitcherData.hand, nameKo: pitcherData.nameKo } : null;
  } else if (gameMode === 'dom' && selectedLineup && selectedPitcher) {
    const batterId = selectedLineup.batterIds[atBat.scenarioIndex];
    batter = batterId ? DOM_BATTER_PROFILES[batterId] : null;
    pitcher = { pitches: selectedPitcher.pitches, hand: selectedPitcher.hand, nameKo: selectedPitcher.nameKo };
  }

  // Handlers
  const handleSelectMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setPhase('difficulty_select');
  }, []);

  const handleSelectDifficulty = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    if (gameMode === 'japan') {
      setPhase('intro');
    } else {
      setPhase('pitcher_select');
    }
  }, [gameMode]);

  const handleBackToModeSelectFromDifficulty = useCallback(() => {
    setPhase('mode_select');
  }, []);

  const handleSelectPitcher = useCallback((p: KorPitcherProfile) => {
    setSelectedPitcher(p);
    setPhase('lineup_select');
  }, []);

  const handleSelectLineup = useCallback((lineup: DomLineup) => {
    setSelectedLineup(lineup);
    setAtBat({ scenarioIndex: 0, balls: 0, strikes: 0, pitchHistory: [], result: null });
    setPhase('pitch_select');
  }, []);

  const handleBackToModeSelect = useCallback(() => {
    setPhase('mode_select');
    setSelectedPitcher(null);
    setSelectedLineup(null);
  }, []);

  const handleBackToPitcherSelect = useCallback(() => {
    setPhase('pitcher_select');
    setSelectedLineup(null);
  }, []);

  const handleStart = useCallback(() => {
    setPhase('pitch_select');
  }, []);

  const handlePitchSelect = useCallback(
    (pitchCode: string, zone: Zone) => {
      if (!batter || !pitcher) return;

      // Find the selected pitch option for speed
      const pitchOption = pitcher.pitches.find((p) => p.code === pitchCode);
      const avgSpeed = pitchOption?.avgSpeed || 90;

      // Build hard mode context if applicable
      const hardCtx = difficulty === 'hard' ? {
        pitchHistory: atBat.pitchHistory,
        pitchSpeed: avgSpeed,
        difficulty,
      } : undefined;

      // Determine outcome with hard mode support
      const { outcome, actualZone } = determinePitchOutcome(
        batter.id,
        pitchCode,
        zone,
        atBat.balls,
        atBat.strikes,
        hardCtx,
      );

      // Generate trajectory — use actualZone for animation target
      const batSide = batter.bats === 'S' ? 'R' : batter.bats;
      const trajectory = generatePitchTrajectory(
        pitchCode,
        actualZone,
        avgSpeed,
        pitcher.hand,
        batSide,
      );

      // Calculate new count
      const newCount = updateCount(outcome, atBat.balls, atBat.strikes);

      setCurrentTrajectory(trajectory);
      setLastOutcome({
        outcome,
        pitchCode,
        zone,
        actualZone,
        newBalls: newCount.balls,
        newStrikes: newCount.strikes,
      });

      // Show miss notification before animation if pitch missed target zone
      if (difficulty === 'hard' && actualZone !== zone) {
        setPhase('miss_notify');
      } else {
        setPhase('animating');
      }
    },
    [batter, pitcher, atBat.balls, atBat.strikes, difficulty],
  );

  const handleMissNotifyDone = useCallback(() => {
    setPhase('animating');
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setPhase('outcome');
  }, []);

  const handleOutcomeNext = useCallback(() => {
    if (!lastOutcome) return;

    const { outcome, pitchCode, zone, actualZone, newBalls, newStrikes } = lastOutcome;
    const pitchScore = scorePitch(outcome, actualZone);

    // Add pitch to history (includes actualZone for hard mode tracking)
    const newPitch = { pitchCode, zone, actualZone, outcome, score: pitchScore };
    const newHistory = [...atBat.pitchHistory, newPitch];

    // Check if at-bat is over
    const { over, result } = isAtBatOver(outcome, atBat.balls, atBat.strikes);

    if (over && result) {
      // Calculate at-bat score
      const abBonus = scoreAtBat(result);
      const pitchTotal = newHistory.reduce((s, p) => s + p.score, 0);
      const abScore = pitchTotal + abBonus;

      setAtBat((prev) => ({
        ...prev,
        balls: newBalls,
        strikes: newStrikes,
        pitchHistory: newHistory,
        result,
      }));
      setAtBatOver({ result, score: abScore });
      setPhase('at_bat_result');
    } else {
      // Continue at-bat
      setAtBat((prev) => ({
        ...prev,
        balls: newBalls,
        strikes: newStrikes,
        pitchHistory: newHistory,
      }));
      setPhase('pitch_select');
    }
  }, [lastOutcome, atBat]);

  const handleAtBatNext = useCallback(() => {
    if (!atBatOver) return;

    // batterId: for japan use scenario, for dom use lineup
    const batterId = gameMode === 'japan'
      ? (scenario?.batterId ?? '')
      : (selectedLineup?.batterIds[atBat.scenarioIndex] ?? '');

    // Record completed at-bat
    const summary: AtBatSummary = {
      batterId,
      pitchHistory: atBat.pitchHistory,
      outcome: atBatOver.result,
      totalScore: atBatOver.score,
    };

    const newCompletedAtBats = [...completedAtBats, summary];
    setCompletedAtBats(newCompletedAtBats);

    const nextIndex = atBat.scenarioIndex + 1;

    if (nextIndex >= totalAtBats) {
      // Game over
      setPhase('game_result');
    } else {
      // Next at-bat
      setAtBat({
        scenarioIndex: nextIndex,
        balls: 0,
        strikes: 0,
        pitchHistory: [],
        result: null,
      });
      setAtBatOver(null);
      setLastOutcome(null);
      setCurrentTrajectory(null);
      setPhase('pitch_select');
    }
  }, [atBatOver, scenario, atBat, completedAtBats, gameMode, selectedLineup, totalAtBats]);

  const handleRestart = useCallback(() => {
    setPhase('mode_select');
    setGameMode('japan');
    setDifficulty('normal');
    setSelectedPitcher(null);
    setSelectedLineup(null);
    setAtBat({
      scenarioIndex: 0,
      balls: 0,
      strikes: 0,
      pitchHistory: [],
      result: null,
    });
    setCompletedAtBats([]);
    setCurrentTrajectory(null);
    setLastOutcome(null);
    setAtBatOver(null);
  }, []);

  // Render based on phase
  switch (phase) {
    case 'mode_select':
      return <ModeSelect onSelectMode={handleSelectMode} />;

    case 'difficulty_select':
      return (
        <DifficultySelect
          gameMode={gameMode}
          onSelect={handleSelectDifficulty}
          onBack={handleBackToModeSelectFromDifficulty}
        />
      );

    case 'intro':
      return <GameIntro onStart={handleStart} />;

    case 'pitcher_select':
      return (
        <PitcherSelect
          pitchers={KOR_PITCHERS}
          onSelect={handleSelectPitcher}
          onBack={handleBackToModeSelect}
        />
      );

    case 'lineup_select':
      return (
        <LineupSelect
          lineups={DOM_LINEUPS}
          batterProfiles={DOM_BATTER_PROFILES}
          onSelect={handleSelectLineup}
          onBack={handleBackToPitcherSelect}
        />
      );

    case 'pitch_select':
      if (!batter || !pitcher) return null;
      return (
        <>
          <HUD
            scenario={scenario}
            balls={atBat.balls}
            strikes={atBat.strikes}
            outs={scenario?.outs ?? 0}
            currentAtBat={atBat.scenarioIndex + 1}
            totalAtBats={totalAtBats}
            pitcherName={pitcher.nameKo}
            batterName={batter.nameKo}
            gameMode={gameMode}
          />
          <PitchSelector
            pitches={pitcher.pitches}
            batSide={batter.bats === 'S' ? 'R' : batter.bats}
            onSelect={handlePitchSelect}
            balls={atBat.balls}
            strikes={atBat.strikes}
          />
        </>
      );

    case 'miss_notify':
      if (!batter || !pitcher || !lastOutcome) return null;
      return (
        <MissNotify
          targetZone={lastOutcome.zone}
          actualZone={lastOutcome.actualZone}
          onDone={handleMissNotifyDone}
        />
      );

    case 'animating':
      if (!batter || !pitcher || !currentTrajectory) return null;
      return (
        <>
          <HUD
            scenario={scenario}
            balls={atBat.balls}
            strikes={atBat.strikes}
            outs={scenario?.outs ?? 0}
            currentAtBat={atBat.scenarioIndex + 1}
            totalAtBats={totalAtBats}
            pitcherName={pitcher.nameKo}
            batterName={batter.nameKo}
            gameMode={gameMode}
          />
          <PitchScene
            pitch={currentTrajectory}
            isAnimating={true}
            onAnimationComplete={handleAnimationComplete}
          />
        </>
      );

    case 'outcome':
      if (!batter || !pitcher || !lastOutcome) return null;
      return (
        <>
          <HUD
            scenario={scenario}
            balls={lastOutcome.newBalls}
            strikes={lastOutcome.newStrikes}
            outs={scenario?.outs ?? 0}
            currentAtBat={atBat.scenarioIndex + 1}
            totalAtBats={totalAtBats}
            pitcherName={pitcher.nameKo}
            batterName={batter.nameKo}
            gameMode={gameMode}
          />
          <OutcomeDisplay
            outcome={lastOutcome.outcome}
            pitchCode={lastOutcome.pitchCode}
            zone={lastOutcome.zone}
            actualZone={lastOutcome.actualZone}
            difficulty={difficulty}
            batterProfile={batter}
            balls={lastOutcome.newBalls}
            strikes={lastOutcome.newStrikes}
            onNext={handleOutcomeNext}
          />
        </>
      );

    case 'at_bat_result':
      if (!batter || !atBatOver) return null;
      return (
        <AtBatResult
          batter={batter}
          outcome={atBatOver.result}
          pitchHistory={atBat.pitchHistory}
          totalScore={atBatOver.score}
          scenarioActualResult={scenario?.actualResult ?? ''}
          onNext={handleAtBatNext}
          isLastAtBat={atBat.scenarioIndex + 1 >= totalAtBats}
        />
      );

    case 'game_result': {
      const total = calculateTotalScore(completedAtBats);
      const leadScore = calculateLeadScore(completedAtBats);
      return (
        <GameResult
          atBats={completedAtBats}
          totalScore={total}
          difficulty={difficulty}
          onRestart={handleRestart}
          gameMode={gameMode}
          pitcherName={selectedPitcher?.nameKo}
          leadScore={leadScore}
        />
      );
    }

    default:
      return null;
  }
}
