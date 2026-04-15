import { WIN_OUTCOME, LOSE_OUTCOME } from '../lib/case';
import Confetti from './Confetti';
import FlightMap from './FlightMap';

interface Props {
  outcomeType: 'win' | 'lose' | null;
  onReset?: () => void;
}

export default function OutcomePanel({ outcomeType, onReset }: Props) {
  const win = outcomeType === 'win';
  const outcome = win ? WIN_OUTCOME : LOSE_OUTCOME;

  // ── WIN ── Full-screen map with text card overlaid at bottom
  if (win) {
    return (
      <>
        {/* Layer 1 — World map (full screen background) */}
        <div className="fixed inset-0 z-0 bg-slate-900">
          <FlightMap />
        </div>

        {/* Layer 2 — Confetti (above map, above text) */}
        <Confetti />

        {/* Layer 3 — Outcome text card (above map, below confetti) */}
        <div className="fixed bottom-0 left-0 right-0 z-10 p-6">
          <div className="max-w-3xl mx-auto bg-slate-900/85 backdrop-blur-sm border border-amber-500/40 rounded-2xl p-7">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="text-3xl font-bold text-amber-400 mb-3">{outcome.headline}</div>
                <p className="text-slate-200 leading-relaxed">{outcome.text}</p>
                {outcome.insight && (
                  <p className="text-sm text-slate-400 italic mt-4 leading-relaxed">{outcome.insight}</p>
                )}
              </div>
              {onReset && (
                <button
                  onClick={onReset}
                  className="shrink-0 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors text-sm mt-1"
                >
                  Run again
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── LOSE ── Standard card layout
  return (
    <div className="rounded-2xl p-8 border-2 border-slate-600 bg-slate-800/60">
      <div className="text-4xl font-bold mb-5 text-slate-300">{outcome.headline}</div>
      <p className="text-lg text-slate-200 mb-6 leading-relaxed">{outcome.text}</p>
      {outcome.insight && (
        <div className="border-t border-slate-700 pt-5">
          <p className="text-sm text-slate-400 italic leading-relaxed">{outcome.insight}</p>
        </div>
      )}
      {onReset && (
        <button
          onClick={onReset}
          className="mt-8 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
        >
          Run again
        </button>
      )}
    </div>
  );
}
