export type Option = {
  key: string;
  label: string;
  subtext: string;
};

export type Question = {
  situation: string;
  question: string;
  options: Option[];
  consequences: Record<string, string>;
};

// ─── Brief ────────────────────────────────────────────────────────────────────

export const BRIEF =
  "It's 7:45pm. You're midway through a client dinner with the VP Tax of your most important account. 10/31 is right around the corner and your LTF is, let's say a \"work in process.\" The main course has just arrived. Then your phone lights up. It's T2. T2 has never called you directly. Not once. What happens next is entirely in this room's hands.";

// ─── Question 1 ───────────────────────────────────────────────────────────────

const Q1: Question = {
  situation: "Your phone is face-up on the table. T2's name is on the screen. The VP Tax is mid-sentence.",
  question: 'What do you do?',
  options: [
    {
      key: 'a',
      label: 'Step outside and pick up',
      subtext: '"Excuse me one moment" — napkin down, out the door, phone to ear',
    },
    {
      key: 'b',
      label: 'Let it ring to voicemail',
      subtext: "He can wait. This is an important dinner. You'll call after dessert.",
    },
    {
      key: 'c',
      label: 'Decline and text him',
      subtext: "A quick message: 'At client dinner — will call you straight after'",
    },
  ],
  consequences: {
    a: "T2 answers on the first ring, you tell him where you are. He responds: 'Clients first,' he says. 'Call me tomorrow.' He hangs up before you're back at the table. The VP Tax tactfully pretends not to have noticed your rosy red cheeks.",
    b: "T2 calls again, you let it ring. Twenty minutes later an email arrives: 'Call me tomorrow.' Just that. No subject line. You spend the rest of dinner checking your phone when you think nobody's watching.",
    c: "T2 replies within the minute: 'Good, close it. Call me tomorrow.' You put your phone face-down and try to enjoy the rest of dinner while you ponder what time exactly you call T2… is he a morning person?",
  },
};

// ─── Question 2 ───────────────────────────────────────────────────────────────

const Q2: Question = {
  situation: "It's Saturday AM — you decide on 8:30 as you drive to meet a friend at the course. Early shows how proactive you are but not unreasonable. He picks up on the second ring.",
  question: '"How are you doing?" he asks. You respond:',
  options: [
    {
      key: 'a',
      label: '"Crushing it Boss"',
      subtext: '"Excited for a huge year-end — what\'s up?"',
    },
    {
      key: 'b',
      label: '"Heading to the driving range"',
      subtext: '"Taking out my anxieties and frustrations of the world on some golf balls. How are you?"',
    },
    {
      key: 'c',
      label: '"Pushing hard"',
      subtext: '"Tough market but we\'re getting done what we can. Trying to close out the year as strong as possible"',
    },
  ],
  // Consequences handled specially via getConsequenceText
  consequences: {},
};

export const Q2_CONSEQUENCE_GOOD =
  "A pause. Then: 'Interesting approach. Hit em straight — will create less anxiety and frustration for you. Why don't you swing by Monday — we can catch up.' He hangs up. You hit a few more balls and join a good friend and client on the first tee.";

export const Q2_CONSEQUENCE_BAD =
  "'OK.' A pause that is doing a lot of work. 'So you'll hit budget this year?' Your hands get shaky and sweat begins to form on your upper lip…";

// ─── Question 3 — Bad path ────────────────────────────────────────────────────

const Q3_BAD: Question = {
  situation: 'You try to steady your voice.',
  question: 'What do you tell him?',
  options: [
    {
      key: 'a',
      label: '"I expect to be on target for budget, Sir"',
      subtext: 'Some risk with deal closing timelines so hard to be sure. Steady. Measured. Technically defensible.',
    },
    {
      key: 'b',
      label: '"Fighting with TAG over a RC issue"',
      subtext: 'Once I win that will be in good shape. Honesty is the best policy, right?',
    },
    {
      key: 'c',
      label: '"Rocking and rolling — over budget"',
      subtext: 'With a good start to next year. Bold. Ambitious. Optimistic. Confident.',
    },
  ],
  consequences: {
    a: "'Got it.' A pause. 'OK — sounds like maybe you should sit down with Ernie and map out a plan. Good luck.' The line goes dead, along with any chance of playing well today.",
    b: "'Got it.' Silence. 'Why don't you find some time with Ernie to work through that.' Click.",
    c: "'Got it.' The pause that follows carries an extraordinary amount of information. 'Hope so — why don't you shoot me an update after year-end on where you end up.' Is there such a thing as over-confidence?",
  },
};

// ─── Question 3 — Good path ───────────────────────────────────────────────────

const Q3_GOOD: Question = {
  situation: "Monday morning. You swing by T2's office. He waves you into the chair opposite and Olga brings you a green tea.",
  question: '"How\'d you hit \'em on Saturday?"',
  options: [
    {
      key: 'a',
      label: '"Some good, some bad"',
      subtext: '"Had a great time out there with friends and clients"',
    },
    {
      key: 'b',
      label: '"Long and straight"',
      subtext: '"Just like I like my whiskey"',
    },
    {
      key: 'c',
      label: '"Golf\'s hard"',
      subtext: '"But I love it"',
    },
  ],
  consequences: {
    a: "T2 smiles — properly, for what may be the first time. 'That's what golf and this place is all about. Doing great things with great people.' He leans forward. 'Have you heard of Hogs Head?'",
    b: "'I don't drink.' A pause of considerable geological duration. 'Thanks for swinging by — actually have a call popping up. You can shut the door on the way out.'",
    c: "'Yes.' A small, measured smile. 'Sounds like it may not love you back. Try some lessons. Call's popping up actually — please shut the door on the way out.'",
  },
};

// ─── All base questions (Q3 resolved via getQuestion) ─────────────────────────

export const QUESTIONS: Question[] = [Q1, Q2];

// ─── Outcomes ─────────────────────────────────────────────────────────────────

export const WIN_OUTCOME = {
  headline: 'Hogs Head.',
  text: "Everyone's heard of Hogs Head. You just didn't think you'd ever actually have a chance to join — T2 asks if you have your chequebook handy.",
  insight:
    'Clients first. Fun: like what you do and with whom you do it. Integrity. Personal reward. Our culture and our core values guide the way.',
};

export const LOSE_OUTCOME = {
  headline: "Ernie's calendar.",
  text: "Somewhere in the world Ernie is getting pinged. His calendar is hard to get onto — this is probably not the way you wanted to find your way in…",
  insight: '',
};

// ─── Branching logic ──────────────────────────────────────────────────────────

export const onGoodPath = (choices: string[]): boolean =>
  choices[0] === 'c' && choices[1] === 'b';

export const isWin = (choices: string[]): boolean =>
  onGoodPath(choices) && choices[2] === 'a';

export function getQuestion(index: number, choices: string[]): Question {
  if (index === 2) return onGoodPath(choices) ? Q3_GOOD : Q3_BAD;
  return QUESTIONS[index];
}

export function getConsequenceText(
  index: number,
  choices: string[],
  winningOption: string,
): string {
  if (index === 1) {
    return choices[0] === 'c' && winningOption === 'b'
      ? Q2_CONSEQUENCE_GOOD
      : Q2_CONSEQUENCE_BAD;
  }
  return getQuestion(index, choices).consequences[winningOption] ?? '';
}
