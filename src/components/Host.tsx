import { QRCodeSVG } from 'qrcode.react';
import { type GameState } from '../lib/types';
import { getQuestion, getConsequenceText, isWin, BRIEF } from '../lib/case';
import { supabase } from '../lib/supabase';
import OutcomePanel from './OutcomePanel';

interface Props {
  gameState: GameState;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function totalVotes(votes: { a: number; b: number; c: number }): number {
  return votes.a + votes.b + votes.c;
}

function votePercent(votes: { a: number; b: number; c: number }, key: string): number {
  const total = totalVotes(votes);
  if (total === 0) return 0;
  const val = (votes as Record<string, number>)[key] ?? 0;
  return Math.round((val / total) * 100);
}

function computeWinner(votes: { a: number; b: number; c: number }): string {
  const entries = Object.entries(votes) as [string, number][];
  return entries.reduce((max, curr) => (curr[1] >= max[1] ? curr : max))[0];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressDots({ completed, current }: { completed: number; current: number }) {
  return (
    <div className="flex gap-2 items-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i < completed || i === current ? 'bg-amber-400 w-8' : 'bg-slate-600 w-6'
          }`}
        />
      ))}
    </div>
  );
}

function VoteBars({
  options,
  votes,
  winner,
  faded,
}: {
  options: { key: string; label: string }[];
  votes: { a: number; b: number; c: number };
  winner: string;
  faded: boolean;
}) {
  const total = totalVotes(votes);

  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const pct = votePercent(votes, opt.key);
        const count = (votes as Record<string, number>)[opt.key] ?? 0;
        const isWinner = opt.key === winner;
        const dimmed = faded && !isWinner;

        return (
          <div
            key={opt.key}
            className="transition-opacity duration-300"
            style={{ opacity: dimmed ? 0.35 : 1 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-slate-200 text-sm flex items-center gap-1.5">
                {faded && isWinner && <span className="text-amber-400">✓</span>}
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  {opt.key.toUpperCase()}
                </span>
                {opt.label}
              </span>
              <span className="text-slate-400 text-sm tabular-nums">
                {count} <span className="text-slate-600">({pct}%)</span>
              </span>
            </div>
            <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isWinner || !faded ? 'bg-amber-400' : 'bg-slate-500'}`}
                style={{ width: `${pct}%`, transition: 'width 0.4s ease' }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-slate-600 text-right">
        {total} vote{total !== 1 ? 's' : ''} cast
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Host({ gameState }: Props) {
  const { phase, question_index, votes, winning_option, choices, outcome_type } = gameState;

  const currentQuestion = getQuestion(question_index, choices);
  const total = totalVotes(votes);
  const liveWinner = computeWinner(votes);
  const revealedWinner = winning_option ?? liveWinner;

  // ─── Supabase actions ──────────────────────────────────────────────────────

  const handleBegin = async () => {
    await supabase
      .from('game_sessions')
      .update({
        phase: 'voting',
        question_index: 0,
        votes: { a: 0, b: 0, c: 0 },
        winning_option: null,
        choices: [],
        outcome_type: null,
      })
      .eq('id', 'main');
  };

  const handleReveal = async () => {
    const winner = computeWinner(votes);
    const newChoices = [...choices, winner];
    await supabase
      .from('game_sessions')
      .update({
        phase: 'consequence',
        winning_option: winner,
        choices: newChoices,
      })
      .eq('id', 'main');
  };

  const handleNext = async () => {
    if (question_index === 2) {
      await supabase
        .from('game_sessions')
        .update({
          phase: 'outcome',
          outcome_type: isWin(choices) ? 'win' : 'lose',
        })
        .eq('id', 'main');
    } else {
      await supabase
        .from('game_sessions')
        .update({
          phase: 'voting',
          question_index: question_index + 1,
          votes: { a: 0, b: 0, c: 0 },
          winning_option: null,
        })
        .eq('id', 'main');
    }
  };

  const handleReset = async () => {
    await supabase
      .from('game_sessions')
      .update({
        phase: 'lobby',
        question_index: 0,
        votes: { a: 0, b: 0, c: 0 },
        winning_option: null,
        choices: [],
        outcome_type: null,
      })
      .eq('id', 'main');
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const completedCount = choices.length;
  const currentDot = phase === 'lobby' ? -1 : question_index;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-800 px-8 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-amber-400 tracking-tight">The T2 Call</h1>
          <p className="text-xs text-slate-500">Presenter view</p>
        </div>
        {phase !== 'lobby' && (
          <ProgressDots completed={completedCount} current={currentDot} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden max-w-3xl w-full mx-auto px-8 py-6 flex flex-col">

        {/* ── Lobby ── */}
        {phase === 'lobby' && (
          <div className="flex flex-col h-full gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Ready to begin</h2>
              <p className="text-slate-400 text-sm">
                Project this screen — participants scan the QR code or visit the URL, then start the case below.
              </p>
            </div>

            {/* QR + Brief side by side */}
            <div className="flex gap-5 flex-1 min-h-0">
              {/* QR card */}
              <div className="flex flex-col items-center justify-center gap-4 bg-slate-800 border border-slate-700 rounded-2xl p-6 w-64 shrink-0">
                <p className="text-lg font-bold text-white tracking-tight">Ready to Begin</p>
                <div className="bg-white rounded-xl p-3">
                  <QRCodeSVG
                    value={`${window.location.origin}/?join`}
                    size={150}
                    fgColor="#1e293b"
                    bgColor="#ffffff"
                  />
                </div>
                <div className="text-center">
                  <p className="text-amber-400 font-mono text-sm">{window.location.host}/?join</p>
                  <p className="text-slate-500 text-xs mt-0.5">Scan or visit on your phone</p>
                </div>
              </div>

              {/* Brief card */}
              <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-6 overflow-hidden">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
                  Brief — shown to participants
                </p>
                <p className="text-slate-300 italic leading-relaxed text-sm">{BRIEF}</p>
              </div>
            </div>

            <button
              onClick={handleBegin}
              className="shrink-0 px-10 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold rounded-2xl text-base transition-colors shadow-lg self-start"
            >
              Begin the case
            </button>
          </div>
        )}

        {/* ── Voting ── */}
        {phase === 'voting' && (
          <div className="flex flex-col h-full gap-5">
            <div>
              <p className="text-slate-500 text-sm mb-1">
                Q{question_index + 1} of 3 — {currentQuestion.situation}
              </p>
              <h2 className="text-2xl font-bold leading-tight">{currentQuestion.question}</h2>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex-1">
              <VoteBars
                options={currentQuestion.options}
                votes={votes}
                winner={liveWinner}
                faded={false}
              />
            </div>
            <div>
              <button
                onClick={handleReveal}
                disabled={total === 0}
                className="px-10 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-bold rounded-2xl text-base transition-colors shadow-lg"
              >
                Reveal results
              </button>
            </div>
          </div>
        )}

        {/* ── Consequence ── */}
        {phase === 'consequence' && (
          <div className="flex flex-col h-full gap-5">
            <div>
              <p className="text-slate-500 text-sm mb-1">
                Q{question_index + 1} of 3 — Results
              </p>
              <h2 className="text-2xl font-bold leading-tight">{currentQuestion.question}</h2>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <VoteBars
                options={currentQuestion.options}
                votes={votes}
                winner={revealedWinner}
                faded={true}
              />
            </div>
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5 flex-1">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                Consequence
              </p>
              <p className="text-white leading-relaxed">
                {getConsequenceText(question_index, choices, revealedWinner)}
              </p>
            </div>
            <div>
              <button
                onClick={handleNext}
                className="px-10 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-2xl text-base transition-colors shadow-lg"
              >
                {question_index === 2 ? 'See the outcome' : 'Next question'}
              </button>
            </div>
          </div>
        )}

        {/* ── Outcome ── */}
        {phase === 'outcome' && (
          <OutcomePanel outcomeType={outcome_type} onReset={handleReset} />
        )}
      </div>

      {/* Reset button — visible during active play */}
      {(phase === 'voting' || phase === 'consequence') && (
        <button
          onClick={handleReset}
          className="fixed bottom-5 left-5 px-3 py-2 text-slate-600 hover:text-slate-400 text-sm transition-colors"
        >
          ↺ Reset session
        </button>
      )}
    </div>
  );
}
