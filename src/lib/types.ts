export type Role = 'host' | 'player';

export type GamePhase = 'lobby' | 'voting' | 'consequence' | 'outcome';

export type GameState = {
  phase: GamePhase;
  question_index: number;
  votes: { a: number; b: number; c: number };
  winning_option: string | null;
  choices: string[];
  outcome_type: 'win' | 'lose' | null;
};

export const DEFAULT_GAME_STATE: GameState = {
  phase: 'lobby',
  question_index: 0,
  votes: { a: 0, b: 0, c: 0 },
  winning_option: null,
  choices: [],
  outcome_type: null,
};

export function normaliseGameState(raw: Record<string, unknown>): GameState {
  return {
    phase: (raw.phase as GamePhase) ?? 'lobby',
    question_index: (raw.question_index as number) ?? 0,
    votes: (raw.votes as { a: number; b: number; c: number }) ?? { a: 0, b: 0, c: 0 },
    winning_option: (raw.winning_option as string | null) ?? null,
    choices: (raw.choices as string[]) ?? [],
    outcome_type: (raw.outcome_type as 'win' | 'lose' | null) ?? null,
  };
}
