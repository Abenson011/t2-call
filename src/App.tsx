import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { type GameState, type Role, DEFAULT_GAME_STATE, normaliseGameState } from './lib/types';
import RolePicker from './components/RolePicker';
import Host from './components/Host';
import Player from './components/Player';

export default function App() {
  // ?join in the URL means this is a participant link — skip the role picker
  const isJoinLink = new URLSearchParams(window.location.search).has('join');
  const [role, setRole] = useState<Role | null>(isJoinLink ? 'player' : null);
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial state fetch
    supabase
      .from('game_sessions')
      .select('*')
      .eq('id', 'main')
      .single()
      .then(({ data, error }) => {
        if (data && !error) {
          setGameState(normaliseGameState(data as Record<string, unknown>));
        }
        setLoading(false);
      });

    // Real-time subscription
    const channel = supabase
      .channel('game_sessions_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: 'id=eq.main' },
        (payload) => {
          setGameState(normaliseGameState(payload.new as Record<string, unknown>));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-500 text-sm">Connecting…</div>
      </div>
    );
  }

  if (!role) {
    return <RolePicker onSelect={setRole} />;
  }

  if (role === 'host') {
    return <Host gameState={gameState} />;
  }

  return <Player gameState={gameState} />;
}
