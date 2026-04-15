import { useState } from 'react';
import { type GameState } from '../lib/types';
import { getQuestion, getConsequenceText, BRIEF } from '../lib/case';
import { supabase } from '../lib/supabase';
import OutcomePanel from './OutcomePanel';

interface Props {
  gameState: GameState;
}

function PulsingDot({ color = 'bg-amber-400' }: { color?: string }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${color}`}
      style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
    />
  );
}

export default function Player({ gameState }: Props) {
  const { phase, question_index, votes, winning_option, choices, outcome_type } = gameState;

  // Track this participant's vote per question index
  const [myVotes, setMyVotes] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const myVote = myVotes[question_index];
  const hasVoted = myVote !== undefined;
  const currentQuestion = getQuestion(question_index, choices);

  const totalVotes = votes.a + votes.b + votes.c;

  const handleVote = async (optionKey: string) => {
    if (hasVoted || submitting) return;
    setSubmitting(true);
    setMyVotes((prev) => ({ ...prev, [question_index]: optionKey }));
    await supabase.rpc('cast_vote', { option_key: optionKey });
    setSubmitting(false);
  };

  // ── Lobby ──────────────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <div className="border-b border-slate-800 px-5 py-4">
          <h1 className="text-lg font-bold text-amber-400 tracking-tight">The T2 Call</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 space-y-6 text-center">
          <div className="flex items-center gap-2">
            <PulsingDot color="bg-green-400" />
            <span className="text-green-400 font-semibold">You're in!</span>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-left max-w-sm">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">The brief</p>
            <p className="text-slate-300 text-sm leading-relaxed italic">{BRIEF}</p>
          </div>
          <p className="text-slate-500 text-sm">Waiting for the presenter to start…</p>
        </div>
      </div>
    );
  }

  // ── Voting ─────────────────────────────────────────────────────────────────
  if (phase === 'voting') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-amber-400 tracking-tight">The T2 Call</h1>
          <span className="text-xs text-slate-500">Q{question_index + 1} of 3</span>
        </div>
        <div className="flex-1 px-5 py-8 space-y-6 max-w-md mx-auto w-full">
          <div>
            <p className="text-slate-500 text-sm mb-2">{currentQuestion.situation}</p>
            <h2 className="text-xl font-bold leading-snug">{currentQuestion.question}</h2>
          </div>

          {!hasVoted ? (
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleVote(opt.key)}
                  disabled={submitting}
                  className="w-full text-left bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 hover:border-amber-500/50 rounded-2xl p-4 transition-all disabled:opacity-60"
                  style={{ minHeight: '72px' }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold text-sm mt-0.5 uppercase w-4 shrink-0">
                      {opt.key}
                    </span>
                    <div>
                      <p className="font-semibold text-white leading-snug">{opt.label}</p>
                      <p className="text-slate-400 text-sm mt-0.5 leading-snug">{opt.subtext}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
                  Vote cast
                </p>
                <p className="text-white font-semibold text-lg">
                  {currentQuestion.options.find((o) => o.key === myVote)?.label}
                </p>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <PulsingDot />
                <p className="text-slate-400 text-sm">
                  Waiting for presenter… {totalVotes > 0 && `(${totalVotes} in)`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Consequence ─────────────────────────────────────────────────────────────
  if (phase === 'consequence') {
    const roomChoice = currentQuestion.options.find((o) => o.key === winning_option);
    const myThisVote = myVotes[question_index];
    const iMatched = myThisVote !== undefined && myThisVote === winning_option;
    const iDiffered = myThisVote !== undefined && myThisVote !== winning_option;

    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-amber-400 tracking-tight">The T2 Call</h1>
          <span className="text-xs text-slate-500">Q{question_index + 1} of 3</span>
        </div>
        <div className="flex-1 px-5 py-8 space-y-5 max-w-md mx-auto w-full">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">The room chose</p>
            <div className="bg-slate-800 border border-slate-600 rounded-2xl p-4">
              <p className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-1">
                Option {winning_option?.toUpperCase()}
              </p>
              <p className="text-white font-semibold">{roomChoice?.label}</p>
              {roomChoice?.subtext && (
                <p className="text-slate-400 text-sm mt-0.5">{roomChoice.subtext}</p>
              )}
            </div>
            {iMatched && (
              <p className="text-green-400 text-sm mt-2 flex items-center gap-1.5">
                <span>✓</span> Your vote matched the majority
              </p>
            )}
            {iDiffered && (
              <p className="text-slate-500 text-sm mt-2">
                You voted differently — the room went another way
              </p>
            )}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
              Consequence
            </p>
            <p className="text-slate-200 leading-relaxed text-sm">
              {getConsequenceText(question_index, choices, winning_option ?? '')}
            </p>
          </div>

          <div className="flex items-center gap-2 justify-center pt-2">
            <PulsingDot />
            <p className="text-slate-500 text-sm">Waiting for presenter…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Outcome ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="border-b border-slate-800 px-5 py-4">
        <h1 className="text-lg font-bold text-amber-400 tracking-tight">The T2 Call</h1>
      </div>
      <div className="flex-1 px-5 py-8 max-w-md mx-auto w-full">
        <OutcomePanel outcomeType={outcome_type} />
      </div>
    </div>
  );
}
