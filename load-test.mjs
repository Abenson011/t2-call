/**
 * Load test — simulates 200 concurrent participants voting across all 3 questions.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_ANON_KEY="your-key"; node load-test.mjs
 *
 * While this runs:
 *   1. Open t2-call.vercel.app as presenter
 *   2. Click "Begin the case" — the script votes on Q1
 *   3. Click "Reveal results" then "Next question" — the script votes on Q2
 *   4. Repeat for Q3
 *   5. Final report prints when you reach the outcome screen
 */

import { createClient } from '@supabase/supabase-js';

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL      = 'https://uhlajiyeeichrwnavkhi.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const PARTICIPANT_COUNT = 200;
const MAX_VOTE_DELAY_MS = 8000; // votes spread across 8s window per question

const OPTIONS = ['a', 'b', 'c'];

// ── Helpers ───────────────────────────────────────────────────────────────────

const randomOption = () => OPTIONS[Math.floor(Math.random() * OPTIONS.length)];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const log = msg => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

// ── Send one wave of 200 votes ────────────────────────────────────────────────

async function sendVoteWave(questionIndex) {
  log(`Q${questionIndex + 1}: Sending ${PARTICIPANT_COUNT} votes...`);
  const start = Date.now();

  const results = await Promise.all(
    Array.from({ length: PARTICIPANT_COUNT }, async (_, i) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      await sleep(Math.random() * MAX_VOTE_DELAY_MS);
      const option = randomOption();
      const { error } = await supabase.rpc('cast_vote', { option_key: option });
      return { id: i + 1, option, success: !error, error: error?.message };
    })
  );

  const elapsed   = ((Date.now() - start) / 1000).toFixed(1);
  const succeeded = results.filter(r => r.success);
  const failed    = results.filter(r => !r.success);
  const tally     = { a: 0, b: 0, c: 0 };
  succeeded.forEach(r => tally[r.option]++);

  log(`Q${questionIndex + 1}: Done in ${elapsed}s — ${succeeded.length} OK, ${failed.length} failed`);

  return { questionIndex, succeeded, failed, tally, elapsed };
}

// ── Watch for game state changes ──────────────────────────────────────────────

function watchGameState(supabase, onUpdate) {
  return supabase
    .channel('load-test-watcher')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: 'id=eq.main' },
      payload => onUpdate(payload.new)
    )
    .subscribe();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_ANON_KEY) {
    console.error('\nMissing SUPABASE_ANON_KEY. Run as:');
    console.error('  $env:SUPABASE_ANON_KEY="your-key"; node load-test.mjs\n');
    process.exit(1);
  }

  log(`Load test ready — ${PARTICIPANT_COUNT} simulated participants, 3 questions`);
  log('Waiting for host to click "Begin the case"...\n');

  const watcher   = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const allResults = [];

  let currentQuestion  = -1;
  let voteInProgress   = false;

  await new Promise((resolve) => {
    watchGameState(watcher, async (state) => {
      // New voting phase started
      if (state.phase === 'voting' && state.question_index !== currentQuestion && !voteInProgress) {
        currentQuestion = state.question_index;
        voteInProgress  = true;

        const result = await sendVoteWave(currentQuestion);
        allResults.push(result);
        voteInProgress = false;

        if (currentQuestion === 2) {
          log('All 3 questions done — waiting for host to reach outcome screen...');
        }
      }

      // Outcome reached — print final report
      if (state.phase === 'outcome') {
        await watcher.removeAllChannels();
        resolve();
      }
    });
  });

  // ── Final report ─────────────────────────────────────────────────────────────

  console.log('\n══════════════════════════════════════════');
  console.log('  LOAD TEST RESULTS — ALL 3 QUESTIONS');
  console.log('══════════════════════════════════════════');

  let totalSent = 0, totalOK = 0, totalFailed = 0;

  for (const r of allResults) {
    const pct = k => Math.round((r.tally[k] / (r.succeeded.length || 1)) * 100);
    console.log(`\n  Q${r.questionIndex + 1}`);
    console.log(`    Sent   : ${PARTICIPANT_COUNT}`);
    console.log(`    OK     : ${r.succeeded.length}`);
    console.log(`    Failed : ${r.failed.length}`);
    console.log(`    Time   : ${r.elapsed}s`);
    console.log(`    Split  : A=${r.tally.a} (${pct('a')}%)  B=${r.tally.b} (${pct('b')}%)  C=${r.tally.c} (${pct('c')}%)`);
    if (r.failed.length > 0) {
      const unique = [...new Set(r.failed.map(f => f.error))];
      unique.forEach(e => console.log(`    Error  : ${e}`));
    }
    totalSent   += PARTICIPANT_COUNT;
    totalOK     += r.succeeded.length;
    totalFailed += r.failed.length;
  }

  console.log('\n──────────────────────────────────────────');
  console.log(`  Total votes sent   : ${totalSent}`);
  console.log(`  Total votes OK     : ${totalOK}`);
  console.log(`  Total votes failed : ${totalFailed}`);
  console.log('──────────────────────────────────────────');

  if (totalFailed === 0) {
    console.log('\n  ✓ All 600 votes recorded across all 3 questions.\n');
  } else {
    console.log(`\n  ✗ ${totalFailed} vote(s) failed — check errors above.\n`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
