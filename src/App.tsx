import { useState, useCallback } from 'react';
import type {
  GamePhase,
  AtBatState,
  Zone,
  PitchOutcome,
  PitchTrajectory,
  AtBatOutcome,
} from './data/types';
import { SCENARIOS } from './data/scenarios';
import { BATTER_PROFILES } from './data/batterProfiles';
import { PITCHER_REPERTOIRE } from './data/pitcherRepertoire';
import { determinePitchOutcome, generatePitchTrajectory } from './engine/outcomeEngine';
import { scorePitch, scoreAtBat, calculateTotalScore } from './utils/scoring';
import type { AtBatSummary } from './utils/scoring';
import GameIntro from './components/GameIntro';
import PitchSelector from './components/PitchSelector';
import PitchScene from './components/PitchScene';
import OutcomeDisplay from './components/OutcomeDisplay';
import AtBatResult from './components/AtBatResult';
import GameResult from './components/GameResult';
import HUD from './components/HUD';

const TOTAL_AT_BATS = SCENARIOS.length;

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
  const [phase, setPhase] = useState<GamePhase>('intro');
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
    newBalls: number;
    newStrikes: number;
  } | null>(null);
  const [atBatOver, setAtBatOver] = useState<{ result: AtBatOutcome; score: number } | null>(null);

  // Current scenario data
  const scenario = SCENARIOS[atBat.scenarioIndex];
  const batter = scenario ? BATTER_PROFILES[scenario.batterId] : null;
  const pitcher = scenario ? PITCHER_REPERTOIRE[scenario.pitcherId] : null;

  // Handlers
  const handleStart = useCallback(() => {
    setPhase('pitch_select');
  }, []);

  const handlePitchSelect = useCallback(
    (pitchCode: string, zone: Zone) => {
      if (!scenario || !batter || !pitcher) return;

      // Determine outcome
      const outcome = determinePitchOutcome(
        scenario.batterId,
        pitchCode,
        zone,
        atBat.balls,
        atBat.strikes,
      );

      // Find the selected pitch option for speed
      const pitchOption = pitcher.pitches.find((p) => p.code === pitchCode);
      const avgSpeed = pitchOption?.avgSpeed || 90;

      // Generate trajectory
      const trajectory = generatePitchTrajectory(
        pitchCode,
        zone,
        avgSpeed,
        pitcher.hand,
        batter.bats,
      );

      // Calculate new count
      const newCount = updateCount(outcome, atBat.balls, atBat.strikes);

      setCurrentTrajectory(trajectory);
      setLastOutcome({
        outcome,
        pitchCode,
        zone,
        newBalls: newCount.balls,
        newStrikes: newCount.strikes,
      });
      setPhase('animating');
    },
    [scenario, batter, pitcher, atBat.balls, atBat.strikes],
  );

  const handleAnimationComplete = useCallback(() => {
    setPhase('outcome');
  }, []);

  const handleOutcomeNext = useCallback(() => {
    if (!lastOutcome || !scenario) return;

    const { outcome, pitchCode, zone, newBalls, newStrikes } = lastOutcome;
    const pitchScore = scorePitch(outcome, zone);

    // Add pitch to history
    const newPitch = { pitchCode, zone, outcome, score: pitchScore };
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
  }, [lastOutcome, atBat, scenario]);

  const handleAtBatNext = useCallback(() => {
    if (!atBatOver || !scenario) return;

    // Record completed at-bat (pitchHistory already includes the last pitch)
    const summary: AtBatSummary = {
      batterId: scenario.batterId,
      pitchHistory: atBat.pitchHistory,
      outcome: atBatOver.result,
      totalScore: atBatOver.score,
    };

    const newCompletedAtBats = [...completedAtBats, summary];
    setCompletedAtBats(newCompletedAtBats);

    const nextIndex = atBat.scenarioIndex + 1;

    if (nextIndex >= TOTAL_AT_BATS) {
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
  }, [atBatOver, scenario, atBat, completedAtBats]);

  const handleRestart = useCallback(() => {
    setPhase('intro');
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
    case 'intro':
      return <GameIntro onStart={handleStart} />;

    case 'pitch_select':
      if (!scenario || !batter || !pitcher) return null;
      return (
        <>
          <HUD
            scenario={scenario}
            balls={atBat.balls}
            strikes={atBat.strikes}
            outs={scenario.outs}
            currentAtBat={atBat.scenarioIndex + 1}
            totalAtBats={TOTAL_AT_BATS}
            pitcherName={pitcher.nameKo}
            batterName={batter.nameKo}
          />
          <PitchSelector
            pitches={pitcher.pitches}
            batSide={batter.bats}
            onSelect={handlePitchSelect}
            balls={atBat.balls}
            strikes={atBat.strikes}
          />
        </>
      );

    case 'animating':
      if (!scenario || !batter || !pitcher || !currentTrajectory) return null;
      return (
        <>
          <HUD
            scenario={scenario}
            balls={atBat.balls}
            strikes={atBat.strikes}
            outs={scenario.outs}
            currentAtBat={atBat.scenarioIndex + 1}
            totalAtBats={TOTAL_AT_BATS}
            pitcherName={pitcher.nameKo}
            batterName={batter.nameKo}
          />
          <PitchScene
            pitch={currentTrajectory}
            isAnimating={true}
            onAnimationComplete={handleAnimationComplete}
          />
        </>
      );

    case 'outcome':
      if (!scenario || !batter || !pitcher || !lastOutcome) return null;
      return (
        <>
          <HUD
            scenario={scenario}
            balls={lastOutcome.newBalls}
            strikes={lastOutcome.newStrikes}
            outs={scenario.outs}
            currentAtBat={atBat.scenarioIndex + 1}
            totalAtBats={TOTAL_AT_BATS}
            pitcherName={pitcher.nameKo}
            batterName={batter.nameKo}
          />
          <OutcomeDisplay
            outcome={lastOutcome.outcome}
            pitchCode={lastOutcome.pitchCode}
            zone={lastOutcome.zone}
            batterProfile={batter}
            balls={lastOutcome.newBalls}
            strikes={lastOutcome.newStrikes}
            onNext={handleOutcomeNext}
          />
        </>
      );

    case 'at_bat_result':
      if (!scenario || !batter || !atBatOver) return null;
      return (
        <AtBatResult
          batter={batter}
          outcome={atBatOver.result}
          pitchHistory={atBat.pitchHistory}
          totalScore={atBatOver.score}
          scenarioActualResult={scenario.actualResult}
          onNext={handleAtBatNext}
          isLastAtBat={atBat.scenarioIndex + 1 >= TOTAL_AT_BATS}
        />
      );

    case 'game_result': {
      const total = calculateTotalScore(completedAtBats);
      return (
        <GameResult
          atBats={completedAtBats}
          totalScore={total}
          onRestart={handleRestart}
        />
      );
    }

    default:
      return null;
  }
}
