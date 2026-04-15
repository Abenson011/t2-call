-- ─── Game sessions table ────────────────────────────────────────────────────
create table game_sessions (
  id text primary key default 'main',
  phase text not null default 'lobby',
  question_index integer not null default 0,
  votes jsonb not null default '{"a":0,"b":0,"c":0}',
  winning_option text,
  choices text[] not null default '{}',
  outcome_type text,
  updated_at timestamptz default now()
);

-- Insert the single game row
insert into game_sessions (id) values ('main');

-- Enable realtime on this table
alter publication supabase_realtime add table game_sessions;

-- ─── Atomic vote increment RPC ───────────────────────────────────────────────
-- Call from client: supabase.rpc('cast_vote', { option_key: 'a' })
create or replace function cast_vote(option_key text)
returns void language plpgsql as $$
begin
  update game_sessions
  set votes = jsonb_set(
        votes,
        array[option_key],
        (coalesce(votes ->> option_key, '0')::int + 1)::text::jsonb
      ),
      updated_at = now()
  where id = 'main';
end;
$$;
