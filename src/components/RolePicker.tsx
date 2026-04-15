import { type Role } from '../lib/types';

interface Props {
  onSelect: (role: Role) => void;
}

export default function RolePicker({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-10">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-amber-400 tracking-tight">The T2 Call</h1>
          <p className="text-slate-400 text-lg italic leading-snug">
            A live case study. One path to glory.<br />Many paths to Ernie.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onSelect('host')}
            className="w-full py-5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold rounded-2xl text-lg transition-colors shadow-lg"
          >
            Start as presenter
          </button>
          <button
            onClick={() => onSelect('player')}
            className="w-full py-5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold rounded-2xl text-lg transition-colors border border-slate-600"
          >
            Join as participant
          </button>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">
          Share this URL with your audience — everyone selects Participant and votes live.
        </p>
      </div>
    </div>
  );
}
