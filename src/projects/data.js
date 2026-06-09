// projects/data.js
// -----------------------------------------------------------------------------
// Single source of truth for project metadata. The home page's Garden scene
// reads this to render its cards (with links to /projects/<slug>/), and each
// project's own landing page imports its entry to render the template.
//
// A project entry can be either:
//
//   * Short landing — uses `body: string[]` (plain paragraphs), `highlights`,
//     and `screenshots` slots. See Super Chess below.
//   * Long-form write-up — uses `content: ContentBlock[]` for the body. When
//     `content` is present, ProjectLanding switches to the typed-block
//     renderer (headings, callouts, code blocks, galleries, etc.) instead of
//     paragraph + screenshot-grid. See Stickers from Roblox below.
//
// To add a new project:
//   1. Add an entry here.
//   2. Copy projects/<existing>/ to projects/<your-slug>/ and update the
//      <title>, data-project-slug, and meta tags.
//   3. Add a `projects-<slug>` input in vite.config.js.

const STICKERS_SHOTS = '/projects/stickers-from-roblox/screenshots';

export const PROJECTS = [
  // ---------------------------------------------------------------------------
  // Super Chess — long-form write-up
  // ---------------------------------------------------------------------------
  {
    slug: 'super-chess',
    kicker: 'Web · 2026',
    title: 'Super Chess',
    tagline:
      "What happens if you bolt a small card game onto standard chess. A shared deck of cards plays before each chess move and can freeze pieces, shield them, push pawns sideways, or block off a square the opponent wanted. The default deck is six cards today; 20+ live in the registry and rotate in for playtests. A nightly sim plays 500 games against itself so I can tune the cards without ever clicking a square.",
    palette: 'dusk',
    href: '/projects/super-chess/',
    demoUrl: 'https://super-chess.bitwiseandrea.com',
    githubUrl: 'https://github.com/BitwiseAndrea/super-chess',
    stack: ['TypeScript', 'Vite', 'D3', 'Vitest', 'Cloudflare Workers', 'Luau (Roblox port)'],
    highlights: [
      { label: 'Default deck', value: '6 cards' },
      { label: 'In the registry', value: '20+ designed' },
      { label: 'Engine', value: 'minimax + αβ + quiescence' },
      { label: 'Bench', value: 'perft(3) = 8902 ✓' },
    ],
    content: [
      // -----------------------------------------------------------------
      // Hook — Andrea's own dictated origin story.
      // -----------------------------------------------------------------
      {
        type: 'paragraph',
        text:
          "Super Chess started, more than anything, as a way to **annoy my boyfriend**. I have a lot of close friends who play chess and are *very* into it, and while I know the rules, I cannot say I really know how to play chess in any significant way. And quite frankly — it's not a game I want to learn. When I look at the people who have these high Elos, it's a lot of memorization and a lot of strategy, and that's just not what interests me about games.",
      },
      {
        type: 'paragraph',
        text:
          "So Super Chess started off as a question: *what if I took the fundamentals of chess and added some form of randomness to it?* Not enough to break it. Just enough that the people who have spent ten thousand hours memorizing openings can't quite use any of those memorized openings, and the rest of us get a fighting chance to do something interesting on move three.",
      },

      // -----------------------------------------------------------------
      // In short — exec summary
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'In short' },
      {
        type: 'paragraph',
        text:
          "Super Chess is **standard chess plus a shared deck of cards**. Each player holds up to two cards. A card plays *before* a chess move and does things like freeze an opponent's piece for a turn, shield one of your own pieces from capture, or block off a square the opponent wanted to move into. The current default deck is **six cards**; another sixteen are designed, registered, and runnable behind a config flag while playtesting catches up. The whole thing ships in three pieces:",
      },
      {
        type: 'list',
        ordered: true,
        items: [
          "**A real chess engine.** Full legal-move generation (perft(3) = 8902 ✓), negamax + alpha-beta + quiescence. Without that, none of the rest of this is testable.",
          "**A real-time playable simulator** in the browser, with a heuristic Card AI on top of the chess bot.",
          "**A batch runner** that plays hundreds of games against itself in a few seconds and exports per-card win-rate / play-rate stats so I can iterate on card balance instead of guessing. This runs nightly on CI.",
        ],
      },
      {
        type: 'paragraph',
        text:
          "There's also a **Roblox port of the engine** in Luau, sharing the same perft-validated move generator (1 / 20 / 400 / 8902 through depth 3) and a 16/20 implementation of the cards, as a graybox 3D place with [`SurfaceGui`](https://create.roblox.com/docs/reference/engine/classes/SurfaceGui) card hands and a classic-noob bot avatar standing behind one of the panels. Both ports read their card definitions from the same canonical JSON file.",
      },
      {
        type: 'paragraph',
        text:
          "If you want the short version: jump to [the prototyping rule of thumb](#pick-the-easiest-prototype-first) for the only generalizable lesson here, or [the patterns worth stealing](#steal-these-patterns) for the reusable code. Otherwise read on — the rest is the iteration loop, the cards, the engine, and the bot that lives in a Roblox place wearing a noob skin.",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // Pick the easiest prototype first — the admonition the user
      // explicitly asked to be called out in the post.
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'Pick the easiest prototype first' },
      {
        type: 'paragraph',
        text:
          "Before any code got written, I went through a bunch of versions of *what \"chess plus randomness\" could even look like*. Some made it as far as a notebook page. A couple got as far as a half-baked prototype:",
      },
      {
        type: 'list',
        items: [
          "**A deck-builder.** Each player drafts a small deck before the game and plays cards from it as it's drawn. Maybe even with shared random commons in a draft pool. Cool — but it's a *whole second game* on top of chess, with deck-building UI, draft logic, hidden information rules, all before you've moved a pawn.",
          "**A modifier on every piece, by default.** Every piece on the board gets a random per-game perk: *this knight can also move one extra square diagonally,* or *this rook can phase through one piece per game*. Beautiful in concept. Brutal to balance — you'd have to make sure every random combination of starting modifiers is at least playable, and the search space is gigantic.",
          "**Cards in hand, drawn from a shared deck, played before a chess move.** Two cards in your hand at any time. Each card is one effect. Capture-triggered draws so the back-and-forth pace stays interesting. No deck-building, no per-piece RNG, no hidden information beyond *\"what cards do they have right now?\"*.",
        ],
      },
      {
        type: 'paragraph',
        text:
          "The third one is what Super Chess is. Not because it's the most interesting of the three — honestly, the per-piece modifier idea is the one I'd most want to *play* — but because it was the **easiest one to actually ship**.",
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Tip — pick the easiest prototype first',
        body: [
          "When you have lots of ideas (and I always have too many, never too few), the right thing to build first is almost never the most exciting version. It's the one with the **fewest moving parts** that still tests the core question. You can add complexity later. You can't take time back.",
          "For Super Chess the core question was *\"do cards-on-top-of-chess feel good?\"* — a question I could answer with two cards, one chess engine, and a button that says *\"play card.\"* Drafting, deck-building, per-piece modifiers, all of that can come back later if the core idea works. Start simple. Ship the boring version. Iterate from there.",
        ],
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // What Super Chess actually is — rules + card table
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'What Super Chess actually is' },
      {
        type: 'paragraph',
        text:
          "Mechanically, it's standard chess — board, pieces, legal moves, check, checkmate, stalemate, castling, en passant, promotion, the 50-move rule. The card layer sits on top, and the rules are short:",
      },
      {
        type: 'list',
        items: [
          "There's **one shared deck across both players** (so the *opponent* can play the card you really wanted, and that's part of the game).",
          "Each player **holds up to two cards**, drawn from the top of the deck.",
          "On your turn, **you may play one card before your chess move**. A handful of cards are *post*-phase (defensive: Shield, Freeze, Foul Ground), and a handful (Pawn Storm, Mirror, Time Warp) **replace** your chess move entirely.",
          "**Capturing a piece draws a card.** That's the only card-draw trigger; white skips its first draw to offset the first-move advantage. Take a piece, get a card. The whole pace of the game is structured around this loop.",
        ],
      },
      { type: 'heading', level: 3, text: 'The default deck' },
      {
        type: 'paragraph',
        text:
          "The current default deck is **six cards**, all common, all categorized `default` in the canonical [`super-chess.json`](https://github.com/BitwiseAndrea/super-chess/blob/master/src/data/super-chess.json). They're the set I felt most confident dropping straight into a real game without further playtesting — small, legible effects with bounded interactions.",
      },
      {
        type: 'table',
        caption:
          "The default deck. All common, all in active rotation. Played before a chess move (or, for the post-phase ones, after).",
        columns: [
          { key: 'card', label: 'Card' },
          { key: 'effect', label: 'Effect' },
        ],
        rows: [
          { card: '❄️ **Freeze**', effect: "Freeze an opponent's piece for 1 turn." },
          { card: '🛡️ **Shield**', effect: 'Protect one of your pieces from capture for 1 turn.' },
          { card: '⛔ **Foul Ground**', effect: 'Opponent cannot move to the chosen empty square next turn.' },
          { card: '👟 **Double Step**', effect: 'Move any pawn exactly 2 squares forward (uses your whole turn).' },
          { card: '↩️ **Pawn Retreat**', effect: 'Move one of your pawns 1 square backward, straight or diagonal (uses your whole turn).' },
          { card: '↗️ **Sidestep**', effect: 'Move one of your pawns 1 square diagonally forward, no capture (uses your whole turn).' },
        ],
      },
      {
        type: 'paragraph',
        text:
          "Every card in that table is one entry in [`super-chess.json`](https://github.com/BitwiseAndrea/super-chess/blob/master/src/data/super-chess.json), which is the **single source of truth** for both the TypeScript engine and the Luau Roblox port. Edit it once; both runtimes pick up the change.",
      },
      {
        type: 'details',
        summary: 'The other 16 cards: created but currently experimental →',
        body: [
          {
            type: 'paragraph',
            text:
              "Sixteen more cards live in the registry, organized by `category`: **movement** (knight-jumps, teleports, swaps, retreats), **disruption** (must-move-this-piece-type, fog of war), **power** (Coup, Resurrection), and **chaos** (Mirror, Trade, Time Warp). They're fully implemented in the TS engine — the simulator can play them, the bot can score them — but they're not in the default deck yet because each one materially changes how the game flows, and the playtesting budget for *\"is rewinding two plies actually fun?\"* is its own project.",
          },
          {
            type: 'table',
            caption:
              "Implemented and runnable today via the simulator's card-override config. Not part of the default deck while balance work continues.",
            columns: [
              { key: 'card', label: 'Card' },
              { key: 'category', label: 'Category' },
              { key: 'effect', label: 'Effect' },
            ],
            rows: [
              { card: "♞ **Knight's Path**", category: 'Movement', effect: 'Any piece moves like a knight this turn.' },
              { card: '⚡ **Extra Move**', category: 'Movement', effect: 'Take an additional (non-capturing) chess move this turn.' },
              { card: '🌀 **Teleport**', category: 'Movement', effect: 'Move one of your pieces to any empty square.' },
              { card: '🌊 **Pawn Storm**', category: 'Movement', effect: 'Advance every legal pawn one square (entire turn).' },
              { card: '🚀 **Promotion Rush**', category: 'Movement', effect: 'Rush one pawn to the rank just before promotion.' },
              { card: '👻 **Ghost Step**', category: 'Movement', effect: 'One piece phases through blockers this turn.' },
              { card: '🔄 **Swap**', category: 'Movement', effect: 'Swap the positions of any two of your own pieces.' },
              { card: '🏰 **Fortify**', category: 'Movement', effect: 'One pawn moves like a rook this turn.' },
              { card: '↩️ **Retreat**', category: 'Movement', effect: 'Move one of your pieces backward up to 2 squares.' },
              { card: '🎯 **Disrupt**', category: 'Disruption', effect: 'Opponent must move a piece of the named type next turn.' },
              { card: '🌫️ **Fog**', category: 'Disruption', effect: 'Opponent must pre-declare their next move before you move.' },
              { card: '💥 **Coup**', category: 'Power', effect: 'Remove any reachable opponent piece (not the king).' },
              { card: '✨ **Resurrection**', category: 'Power', effect: 'Return your most recently captured minor piece to the board.' },
              { card: '🪞 **Mirror**', category: 'Chaos', effect: "Copy your opponent's last move with one of your pieces (entire turn)." },
              { card: '🤝 **Trade**', category: 'Chaos', effect: "Swap your most-advanced pawn with the opponent's least-advanced pawn." },
              { card: '⏪ **Time Warp**', category: 'Chaos', effect: "Undo your last move + opponent's response. Once per game per player." },
            ],
          },
          {
            type: 'paragraph',
            text:
              "Any of these can be enabled in a sim run by editing `src/config/cards.config.ts` to bump their `copies` above zero — useful for stress-testing the engine and seeing histograms shift in the nightly sim before committing to inclusion in the default deck.",
          },
        ],
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // The engine
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'The engine had to be a real chess engine first' },
      {
        type: 'paragraph',
        text:
          "I cannot stress enough that the *boring* part of building Super Chess was building a real chess engine. The card layer is interesting; the chess engine underneath has to be **plain, correct, and fast** before anything else gets to be true. None of the card effects are testable until move generation is correct. None of the simulator's win-rates are meaningful until the bot can actually play chess.",
      },
      {
        type: 'paragraph',
        text:
          "So before any cards got written, the first milestone was passing a **perft test** — Performance Test, the chess-engine community's standard way of asserting that your move generator emits exactly the right legal moves at every depth from a given position. The numbers are well-known and brittle. Get them wrong, the engine is wrong:",
      },
      {
        type: 'code',
        language: 'typescript',
        code:
`// Perft from the standard initial position. Both the TS engine and the
// Luau Roblox engine produce these exact counts. If a code change makes
// any of these wiggle, move generation has regressed.
perft(1) === 20      // 20 legal first moves for white
perft(2) === 400     // 20 white * 20 black replies
perft(3) === 8902    // the all-the-rules-must-be-right number`,
      },
      {
        type: 'callout',
        variant: 'fun-fact',
        title: 'Fun fact',
        body: [
          "Once you cross perft(3) = 8902 cleanly, you'd think the rest is downhill. It is not. perft(4) is **197,281** and any bug — castling rights, en passant capture detection, promotion edge cases — explodes the difference into the thousands. Most chess-engine bug stories are *\"the perft was off by 11 and tracking down the 11 took two days.\"* Super Chess only validates through perft(3) on CI because the card layer doesn't change move generation; depth 3 is enough to catch every regression I've ever introduced.",
        ],
      },
      {
        type: 'paragraph',
        text:
          "Above the move generator sits a textbook search: **negamax with alpha-beta pruning**, capture-first move ordering, and a **quiescence** layer at the leaves so the bot doesn't stop evaluating in the middle of a capture sequence and call a +9 position +0. Evaluation is material plus piece-square tables — also stored in `super-chess.json`, also shared with the Roblox port. At depth 2 the bot averages around **6 ms/move**; at depth 3, around 60 ms. Both are real-time.",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // The simulator
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: '500 games a night, no clicking' },
      {
        type: 'paragraph',
        text:
          "Here's where the project earns its keep. Once you have a chess engine and a card layer, the obvious question is *\"is this card overpowered?\"* and the *obvious wrong answer* is *\"play 50 games and see how it feels.\"* I am not going to play 50 games of anything to balance a card. I am barely going to play **one** game.",
      },
      {
        type: 'paragraph',
        text:
          "So the same bundle that powers the playable simulator also exposes a **CLI batch runner** that plays N games of bot-vs-bot, with both sides using the heuristic Card AI on top of the chess bot, and writes per-card statistics to disk:",
      },
      {
        type: 'code',
        language: 'bash',
        code:
`# 500 games at depth 2, save the structured results to disk.
pnpm sim --games 500 --depth 2 --output sim-results/run.json

# Export those results into something I can read.
pnpm export-stats --input sim-results/run.json --format markdown
pnpm export-stats --input sim-results/run.json --format csv

# What "good" looks like for a card in the output:
#   play_rate     - how often did the bot CHOOSE to play this card when held?
#   win_rate      - when this card was played, how often did its side win?
#   avg_material  - average centipawn delta the card produced when played`,
      },
      {
        type: 'paragraph',
        text:
          "Then **GitHub Actions runs a 500-game simulation nightly** at 02:00 UTC, generates a Markdown report, and posts it as a comment on issue #1 on the repo. Every morning I get a fresh balance snapshot in my notifications. If a card's `play_rate` quietly drops to ~0%, the heuristic Card AI has decided it's not worth playing — that's almost always a balance bug, and now I see it the next morning instead of three months later when I notice no one ever plays Trade.",
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Tip — bots playing themselves is the cheapest playtest you have',
        body: [
          "If your game has a deterministic-enough rules system that you can write *any* heuristic AI for it, you can run thousands of self-play games for free, every night, and look at the histograms in the morning. The bot doesn't have to be *good* — it has to be **consistent**. The signal lives in *how the histogram changes when you tweak a card*, not in any individual game's outcome.",
        ],
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // The card abstraction — the mega refactor
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'The card abstraction (now in one file)' },
      {
        type: 'paragraph',
        text:
          "The first version of the card system was, candidly, **AI slop**. I'd been letting the agent ship cards faster than I'd been reading the code, and by the time I sat down and actually opened the files, adding one new card meant editing **five of them**: `super-chess.json` (the metadata), `effects.ts` (the apply function), `cardAI.ts` (the bot's scoring heuristic), `targeting.ts` (the UI highlight rules), and sometimes `game/types.ts` (if the card needed long-running state). A community-submitted card was effectively impossible — you'd have to merge a PR that touched the core type system to add a single effect.",
      },
      {
        type: 'paragraph',
        text:
          "Sitting down with that mess turned out to be one of the more *fun* afternoons of the project. Years ago, before I was a manager, I was a teaching assistant for the intro OOP course at my university — the one where you finally explain inheritance and polymorphism to a room of second-years and watch the *\"oh, **that's** what classes are for\"* face go off in real time. Those muscles haven't been exercised in many, many years. Refactoring 20 cards into a registered-object API with one shared interface and a sparse-state side-table is exactly the worked example I used to draw on the whiteboard, just with snowflake emojis instead of `Animal -> Dog`.",
      },
      {
        type: 'paragraph',
        text:
          "After the rewrite, a card is **one self-contained file**:",
      },
      {
        type: 'code',
        language: 'typescript',
        code:
`// src/cards/builtin/freeze.ts
import type { Card } from '../card.ts';
import { cloneState } from '../card.ts';
import {
  CardCategory, CardDuration, CardRarity, CardTargetType, TurnPhase,
} from '../types.ts';
import { PieceType, opponent, pieceType } from '../../engine/index.ts';

export const freezeCard: Card = {
  def: {
    name: 'Freeze',
    rarity: CardRarity.Common,
    category: CardCategory.Default,
    copies: 3,
    emoji: '\u2744\ufe0f',
    shortDesc: "Freeze an opponent's piece for 1 turn.",
    rulesText:
      "Choose one of your opponent's pieces (not the king). That piece cannot " +
      "move on the opponent's next turn. Frozen pieces can still be captured.",
    requiresTarget: true,
    targetType: CardTargetType.OppPiece,
    phase: TurnPhase.Post,
    duration: CardDuration.OppTurn,
  },

  apply(state, color, target) {
    const sq = target.oppPieceSquare;
    const p  = sq !== undefined ? state.chess.board[sq] : null;
    if (!p)                              return reject(state, 'invalid target');
    if (pieceType(p) === PieceType.King) return reject(state, 'cannot freeze king');

    const next = cloneState(state);
    // 1 ply = "active during exactly the opponent's upcoming ply, gone
    // before our next turn starts". Setting 2 leaked into our turn.
    next.superState.frozenSquares.set(sq, 1);
    return { newState: next, logEntry: \`Froze \${sqStr(sq)}\`, materialDelta: 0 };
  },

  // Single source of truth used by both the UI highlighter and the bot's
  // simulate-and-score loop. Without this, the bot never plays Freeze.
  legalTargets(state, color) {
    return enumerateOpponentNonKingPieces(state, opponent(color));
  },
};`,
      },
      {
        type: 'paragraph',
        text:
          "Long-running effects (Shield, Freeze, Foul Ground, Mirror's mirror-state) used to require touching the `SuperState` type. Now they live in a typed namespace I called `cardState` — a `Map<string, unknown>` where each card stashes its own state under its own key, with its own optional `tick(superState)` hook to expire it. The well-known counters that the engine itself cares about (`frozenSquares`, `shieldTurns`) keep their static types; community cards opt in to the dynamic bag without touching the core types.",
      },
      {
        type: 'paragraph',
        text:
          "**Adding a new card is now: write one file, register it once, you're done.** Both the bot and the UI route through the same registry. The full developer-facing doc lives at [`docs/AUTHORING_CARDS.md`](https://github.com/BitwiseAndrea/super-chess/blob/master/docs/AUTHORING_CARDS.md) in the repo.",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // Roblox port
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'The Roblox port — same engine, different runtime' },
      {
        type: 'paragraph',
        text:
          "Once the TS engine had a card system worth porting, the obvious next move was to reproduce it in **Luau** as a Roblox place. Not because Roblox is the right *platform* for a chess game (it isn't), but because the engine + cards form a self-contained chunk of game logic that I wanted to know would survive being ported to a totally different runtime — and because a graybox 3D chess board with a little bot avatar standing next to it is, frankly, very cute.",
      },
      {
        type: 'paragraph',
        text:
          "Both engines read their card definitions, piece values, piece-square tables, and rule constants (max hand size, max moves per game) from the same canonical JSON: `public/super-chess.json`. A `pnpm cards:sync` script regenerates a Luau-embedded snapshot of that JSON whenever it changes, so the Roblox runtime can boot offline with the latest data. There's also an optional [`HttpService`](https://create.roblox.com/docs/reference/engine/classes/HttpService) boot-fetch path so the place can pull the live JSON if the developer wires it up.",
      },
      {
        type: 'paragraph',
        text:
          "The validation that mattered most was **bit-identical perft** between the two engines:",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`-- Both engines, from the standard initial position, must produce exactly:
perft(1) -> 20
perft(2) -> 400
perft(3) -> 8902

-- This is non-negotiable. If they diverge, one of the two move generators
-- has a bug, and any cross-runtime game is going to behave differently
-- when one card cares about a move-generation edge case the other doesn't.`,
      },
      {
        type: 'paragraph',
        text:
          "16 of the 20 cards are implemented in the Luau port (Mirror, Trade, Fog, and Time Warp ship as placeholders that explicitly say *NOT IMPLEMENTED* on the card so you can see the gap from inside the place). The 3D presentation is pure graybox: 64 [`Part`](https://create.roblox.com/docs/reference/engine/classes/Part)s for the squares with [`ClickDetector`](https://create.roblox.com/docs/reference/engine/classes/ClickDetector)s and [`SelectionBox`](https://create.roblox.com/docs/reference/engine/classes/SelectionBox)es, primitive cylinders and blocks for pieces, two `SurfaceGui` panels for the hands, and an R6 **classic-noob avatar standing behind the black hand panel** that crossfades between built-in idle / wave / cheer / laugh emote tracks based on game state. There's a [`BillboardGui`](https://create.roblox.com/docs/reference/engine/classes/BillboardGui) chat bubble above its head that says things like *\"hmm…\"* / *\"your move\"* / *\"GG!\"* / *\"oof\"* depending on whether it's thinking, waiting, celebrating, or losing.",
      },
      {
        type: 'paragraph',
        text:
          "The bot's pacing is deliberate: pre-delay 0.6 s, minimum think time 1.0 s, post-settle 0.2 s, with the StatusBoard text cycling *\"Black is thinking\"* / *\"..thinking.\"* / *\"..thinking..\"* / *\"..thinking…\"* every 0.3 s and a gold [`UIStroke`](https://create.roblox.com/docs/reference/engine/classes/UIStroke) pulse around the bot's hand panel. None of that pacing is necessary — the bot is fast enough that a depth-2 move comes back in under 10 ms — but a chess move that snaps back instantly feels like a glitch, not a turn.",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // Bug reports → Trello
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'Bug reports straight into Trello' },
      {
        type: 'paragraph',
        text:
          "When you ship a thing with **20 cards x all chess legal positions**, the bug surface is meaningfully bigger than \"games sometimes crash.\" Most of the bugs I find now are subtle interactions between two cards in a specific position — *\"if I Shield this piece on this turn and you Coup it next turn, what should happen?\"* — and there's no useful way to write that down without a snapshot of the exact state.",
      },
      {
        type: 'paragraph',
        text:
          "So there's a 🐞 bug-report button at the top of the play panel. It captures a full game snapshot — board FEN, both hands, the entire `superState` (frozen squares, shields, foul ground, etc), recent events, validation result, and a session debug log — and gives the user three ways to get it off their machine: *Send to Trello*, *Copy report*, *Download .json*.",
      },
      {
        type: 'paragraph',
        text:
          "The *Send to Trello* path posts to a Cloudflare Worker route at `POST /api/bug-report` that calls the Trello REST API server-side. The Trello API key and token live in `wrangler` secrets and **never touch the client bundle**. The Worker per-IP-rate-limits the route to 3 requests / minute via the Cloudflare rate-limit binding, clamps title to 120 chars and description to ~14 KiB, and otherwise falls through to the static SPA via `env.ASSETS.fetch`.",
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Tip — never ship API tokens in your client bundle',
        body: [
          "If your client needs to talk to a third-party API that requires a credential, **proxy through your own server**. Cloudflare Workers makes this almost free — one route, one secret, one rate-limit binding, and the client only ever sees your origin. The same pattern works for posting to Slack, hitting Discord webhooks, or any *\"please don't put this in JavaScript\"* REST API.",
        ],
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // Where it lives
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'Where it lives' },
      {
        type: 'paragraph',
        text:
          "The web app is a Vite SPA served from a Cloudflare Worker via `assets`. Custom domain at [super-chess.bitwiseandrea.com](https://super-chess.bitwiseandrea.com), wired to the `bitwiseandrea.com` zone. CI runs lint + tests on every push, and the nightly sim job posts its 500-game balance report as a comment on issue #1 of the repo.",
      },
      {
        type: 'paragraph',
        text:
          "The Roblox place lives in a Studio session called *Super Chess*, with all the engine code under `ReplicatedStorage/SuperChess/Modules/*` and the world built procedurally on server boot — board, hand panels, status board, lights, and the noob bot avatar are all spawned by `WorldBuilder.lua`, not hand-placed in Studio. Editing the place mostly means editing module scripts and pressing Play.",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // What's next
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: "What's next" },
      {
        type: 'list',
        items: [
          "**Multiplayer.** The web sim is currently single-player + bot only. There's a partial multiplayer prototype in `git log` (the *\"Multiplayer?\"* commit and its three follow-ups) — the move sync works; the card draw/state sync does not yet survive a refresh.",
          "**Mobile.** Some recent commits make the touch layout *bearable*, but the card hand panels still want a dedicated mobile-first layout with bigger touch targets. The Roblox port already works on mobile by default.",
          "**Closing the 4-card gap in Luau.** Mirror, Trade, Fog, and Time Warp need their effects ported. Mirror and Time Warp are the interesting ones — both involve serializing prior game states for replay/restore.",
          "**Drafting and deck-building modes** (the iteration ideas I deliberately deferred above). The card registry makes this *much* easier to ship now than it would have been in version 1.",
        ],
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // Steal these patterns
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'Steal these patterns' },
      {
        type: 'paragraph',
        text:
          "The reusable shapes from this build, with links back to where each one is discussed:",
      },
      {
        type: 'list',
        items: [
          "**Pick the easiest prototype that still tests the core question.** Defer the cool ideas until the boring version is shipped. [Where this is shown ↑](#pick-the-easiest-prototype-first)",
          "**A perft-style test before anything else.** If you're building any rules-system game, find the equivalent — a deterministic legality check that exercises every edge case in your rules — and make it green before you build anything on top. [Where this is shown ↑](#the-engine-had-to-be-a-real-chess-engine-first)",
          "**One canonical JSON that both runtimes read.** Card definitions, piece values, PSTs, rule constants — all in `public/super-chess.json`, regenerated into a Luau snapshot on demand. Edit once, both runtimes pick up the change. [Where this is shown ↑](#the-roblox-port-same-engine-different-runtime)",
          "**One file per card; register it once.** A registry-based plugin API means new cards (and community cards) don't have to touch the core type system. [Where this is shown ↑](#the-card-abstraction-now-in-one-file)",
          "**A `cardState` namespace** for long-running per-card state. `Map<string, unknown>` with optional `tick()` hooks; the typed core engine state stays typed. [Where this is shown ↑](#the-card-abstraction-now-in-one-file)",
          "**Bots playing themselves on a nightly cron** is the cheapest playtest you have. Watch the histograms, not the individual games. [Where this is shown ↑](#500-games-a-night-no-clicking)",
          "**Proxy third-party APIs through your own server.** A tiny Cloudflare Worker route + secrets keeps your API tokens out of the client bundle and earns you free rate-limiting. [Where this is shown ↑](#bug-reports-straight-into-trello)",
        ],
      },
      {
        type: 'paragraph',
        text:
          "If you want the long version of any of these, scroll back up — they're in context with the surrounding story for why they ended up looking the way they do.",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // Resources
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'Resources' },
      {
        type: 'list',
        items: [
          "[github.com/BitwiseAndrea/super-chess](https://github.com/BitwiseAndrea/super-chess) — the repo. Web project lives at the root; the Luau port lives under `roblox/`.",
          "[super-chess.bitwiseandrea.com](https://super-chess.bitwiseandrea.com) — the live web sim. Click *Play* to play vs the bot; *Simulate* to run a batch sim in the browser.",
          "[`docs/AUTHORING_CARDS.md`](https://github.com/BitwiseAndrea/super-chess/blob/master/docs/AUTHORING_CARDS.md) — the developer-facing doc for the Card registry. If you want to write your own card and PR it, start here.",
          "[Chess Programming Wiki — Perft](https://www.chessprogramming.org/Perft) — the standard reference for chess engine move-generation validation. The numbers I'm matching live here.",
          "[Chess Programming Wiki — Quiescence Search](https://www.chessprogramming.org/Quiescence_Search) — the trick for not stopping evaluation in the middle of a capture sequence. Without this, a chess bot is just *bad*.",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Stickers from Roblox — long-form write-up
  // ---------------------------------------------------------------------------
  {
    slug: 'stickers-from-roblox',
    kicker: 'Roblox + iOS · 2026',
    title: 'Stickers from Roblox',
    tagline:
      "An iMessage sticker app for your Roblox avatar expressions. Capture an expression inside the companion Roblox experience, sign in with your Roblox account on iPhone, and the stickers show up natively in iMessage. This page is the build journey — from a one-day facial animation experiment in Studio to an iOS companion app.",
    palette: 'dusk',
    href: '/projects/stickers-from-roblox/',
    githubUrl: null,
    demoUrl: null,
    highlights: [
      { label: 'Started', value: 'Jun 1, 2026' },
      { label: 'Shipped to Studio', value: 'Same day' },
      { label: 'Active time', value: '~11 hours' },
      { label: 'Tokens', value: 'TODO — pull from Cursor' },
    ],
    stack: [
      'Cursor Agents window',
      'Rojo',
      'Roblox Studio MCP',
      'Luau',
      'WrapDeformer',
      'EditableMesh',
      'Iris (Dear ImGui)',
    ],
    content: [
      {
        type: 'callout',
        variant: 'aside',
        title: 'Where this ended up',
        body: [
          "This started as **Morph Your Head** — a one-day experiment recreating the Super Mario 64 floating-head start screen on a Roblox avatar. The Studio side worked. Shipping it publicly hit three platform walls (which are basically what the rest of this post is about).",
          "A week later it became **Stickers from Roblox**: an iMessage companion app for iPhone. You capture an avatar expression inside the Roblox experience, sign in with your Roblox account on the phone, and the stickers show up natively in iMessage — drag any one into a conversation the same way iOS treats Memoji.",
          "The rest of this page is the original build journal, kept verbatim because the platform gaps it documents are exactly why the project became a sticker app instead of a Roblox-native feature.",
        ],
      },
      {
        type: 'image',
        src: `${STICKERS_SHOTS}/00-mario-64-press-start.png`,
        alt: 'Super Mario 64 PRESS START screen with the floating, stretchable Mario head',
        caption: 'The thing I wanted to make. Image: Super Mario 64 start screen.',
      },

      // -----------------------------------------------------------------
      // In short — executive summary for skim-readers. Borrowed in shape
      // from the internal proposal doc so a developer can decide in 30s
      // whether the rest of the post is worth their time.
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'In short' },
      {
        type: 'paragraph',
        text:
          "Built a stretchable Mario-64-style head with programmatic facial expressions on a Roblox avatar in roughly one engineering day. **It runs end-to-end in Studio. It does not yet run in a published place** without significant workarounds. Three platform gaps explain why, and they're all in the *public API surface* — not in the underlying tech:",
      },
      {
        type: 'list',
        ordered: true,
        items: [
          "**No public runtime API to set FACS controls.** Direct `FaceControls` writes are `PluginSecurity`-gated, so the supported path is uploading a `KeyframeSequence` asset per pose.",
          "**No `EditableMesh` access on default head meshes.** Roblox-owned head assets aren't whitelisted for editing by default; this demo needed an internal flag.",
          "**No documented FACS pose library.** The creator docs map exactly **5 expressions** to FACS values, out of the 50+ supported controls.",
        ],
      },
      {
        type: 'paragraph',
        text:
          "If you want the short version: jump to [where each phase runs](#three-phases-one-shipped) for the capability matrix, or [the patterns worth stealing](#steal-these-patterns) for the reusable code from this build. Otherwise read on — the rest is the iteration loop, the code, and the live demo failing in production with style.",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // The vision
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'The vision' },
      {
        type: 'paragraph',
        text:
          "Ever since Roblox released the facial expression APIs, I've wanted to leverage them in a bunch of my projects. Combined with `WrapDeformer`, this felt like the perfect time to try to recreate the loading screen for Super Mario 64.",
      },
      {
        type: 'paragraph',
        text:
          "I remember playing with that floating head when I was little — clicking on it, watching it stretch into shapes, getting it to spin. It was iconic. If you've never seen it, [here's the start screen in action](https://www.youtube.com/results?search_query=super+mario+64+title+screen+face) — that's the energy I was aiming for.",
      },
      // TODO(media): replace the search link above with a short embedded GIF of the
      // SM64 start screen face being stretched. Andrea wants to provide one; until
      // then this falls back to a YouTube search.

      { type: 'rule' },

      // -----------------------------------------------------------------
      // Why is the head pointy?
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'Why is the head pointy?' },
      {
        type: 'paragraph',
        text:
          "My workflow setup: the **Agents window in Cursor**, plus **Rojo**, plus the **Roblox Studio MCP**. The two of them overlap a little — Rojo because I want a real file system, the code on GitHub, the project living outside of Studio; Studio MCP because of the screenshots. For something like \"make a face stretchy,\" screenshots are everything, and Studio MCP lets the agent take them on its own. That keeps me out of the validation loop, which is one of my core principles when programming with AI.",
      },
      {
        type: 'quote',
        text: 'The less I have to validate, the better.',
      },
      {
        type: 'paragraph',
        text:
          "Tests, screenshots, MCP-driven previews — whenever I can hand off \"did this work?\" to a tool instead of clicking around myself, I do it.",
      },
      {
        type: 'paragraph',
        text:
          "And it mostly worked first try. The mesh deformation came up on the first attempt. Rojo tooling fought me for a couple of minutes (`zsh: killed rojo serve` was a fun one), but the whole tooling chapter was resolved in under half an hour — which is pretty good?",
      },
      {
        type: 'paragraph',
        text:
          "And then there it was: my Roblox avatar, deformable. It didn't really look like a traffic cone — it looked more like one of those strange indie games with a rendering bug.",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // Bring emotion to the heads
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'Bring emotion to the heads' },
      {
        type: 'paragraph',
        text:
          "At this point the head is morphy. We spent some time smoothing out the points (though I'm going to ask for it to be made *more* lumpy later, so this is not the last word on the lump situation).",
      },
      {
        type: 'paragraph',
        text:
          "I'm looking forward to going back and reading the code that actually does the deformation. This math fell squarely into the category of **math I wanted to exist, not math I wanted to understand**. Maybe one day curiosity wins. Today is not that day.",
      },
      {
        type: 'paragraph',
        text:
          "What I really wanted next was for the head to *emote*. The idea of my Roblox head breaking into a laugh because you poked it in the right spot, or wincing when you yank on its nose — reactions, feelings, a little personality.",
      },
      {
        type: 'paragraph',
        text:
          "The agent started talking about FACS poses, keyframes, and animation tracks it would manually play, and I told it, *\"you are making this way more complicated than we need.\"* It turned out it was not, in fact, making it more complicated than we needed.",
      },
      {
        type: 'paragraph',
        text:
          "Roblox doesn't have a built-in way to just say \"make this character smile\" or \"make this character frown.\" The [Facial Animation Moods documentation](https://create.roblox.com/docs/art/characters/facial-animation/moods) is genuinely interesting, but it's heavy-handed: the expectation is that you produce the animation yourself. Roblox does give you a lot of tools to do that — there's a facial animation editor in Studio, there's a face-capture flow that records *your* face and bakes it into an animation — but the floor is \"go author an animation,\" not \"call a function.\"",
      },
      {
        type: 'paragraph',
        text:
          "And the obvious approach — just write to the underlying [`FaceControls`](https://create.roblox.com/docs/reference/engine/classes/FaceControls) properties directly — is explicitly disallowed:",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`-- This is the API I wanted to use. It does not work in a game script.
character.Head.FaceControls.JawDrop = 0.5

-- Roblox kicks it back at runtime:
--   FaceControls.JawDrop requires PluginSecurity capability,
--   which game scripts (server and client) do not have.`,
      },
      {
        type: 'paragraph',
        text:
          "The Animation system *does* have the capability that game scripts don't. So the supported path is: build an animation that contains the FACS values you want, load it onto the character's [`Animator`](https://create.roblox.com/docs/reference/engine/classes/Animator), play it. The agent had been trying to tell me this for ten minutes. I was not listening.",
      },
      { type: 'heading', level: 3, text: 'The emoji conversation' },
      {
        type: 'paragraph',
        text:
          "I was chatting with a friend on the side while all this was happening, and we were saying — how fun would it be to have a facial expression for **every emoji**? A full set. And then, *how would we even collaborate on that?* Are we both going to have to sit in front of a face-capture rig pulling faces and recording them? That can't be the move.",
      },
      {
        type: 'paragraph',
        text:
          "Because there genuinely isn't a simple \"just make a face\" path. The only place in the entire creator documentation that maps FACS control values to human-readable expressions is the [head specifications page](https://create.roblox.com/docs/en-us/art/characters/head-specifications#facs-animation), and it lists **five** of them — eye blinks, mouth opens, happy, and sad — as the *validation actions* that an avatar head has to pass to count as a valid Roblox head:",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`-- The entire creator-docs mapping of FACS controls to expressions. Five entries.
-- These are validation poses — the head must successfully deform at the cage
-- landmarks for each of these or the asset fails validation.
local DocsMoods = {
    LeftEyeBlink  = { LeftEyeClosed  = 1, EyesLookDown = 1 },
    RightEyeBlink = { RightEyeClosed = 1, EyesLookDown = 1 },
    MouthOpens    = { JawDrop = 1 },
    Happy = {
        Pucker              = 1,
        LeftLipCornerPuller = 1, RightLipCornerPuller = 1,
    },
    Sad = {
        ChinRaiser            = 1,    ChinRaiserUpperLip     = 1,
        LeftCheekRaiser       = 0.85, RightCheekRaiser       = 0.85,
        LeftInnerBrowRaiser   = 1,    RightInnerBrowRaiser   = 1,
        LeftLipCornerDown     = 1,    RightLipCornerDown     = 1,
        LeftLowerLipDepressor = 1,    RightLowerLipDepressor = 1,
    },
}`,
      },
      {
        type: 'paragraph',
        text:
          "That's it. That's everything the docs give you. **Five expressions** out of 50+ supported FACS poses, **17 required controls** out of the full set, and even those five aren't quite what you'd reach for if you wanted to design feelings — \"Happy\" is just Pucker plus a lip-corner-pull, which is closer to a *grimace* than a smile if you actually play it. Beyond this table, the public surface assumes you're either going to upload your own facial animations or hand the controls to a player driving them with their actual face on a camera.",
      },
      {
        type: 'paragraph',
        text:
          "The high-level takeaway: **if I just want to make an NPC smile and frown, this is harder than it should be.** Hold that thought — it's the gap I ended up trying to fill. `Moods.lua` ends up shipping 50+ entries built on top of that 5-entry foundation, which is roughly the ratio of \"reference material I needed\" to \"reference material the docs ship.\"",
      },
      {
        type: 'image',
        src: `${STICKERS_SHOTS}/02-emoji-palette.png`,
        alt: 'Apple emoji palette — the target list for the mood library',
        caption: 'The actual target list. One mood per emoji where possible.',
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // While one agent cooked, the other one decorated
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'While one agent cooked, the other one decorated' },
      {
        type: 'paragraph',
        text:
          "While all of that mood-and-emote stuff was kicking around, I had a *separate* agent in the background **cooking up the FACS variables for every facial expression we could match to an emoji** — a parallel chat in the Agents window chewing on the long-tail data work while I kept iterating on the main thing.",
      },
      {
        type: 'paragraph',
        text:
          "This is one of my favorite things about this workflow. **One agent does the boring catalog work; I drive the fun iteration with the other.** Neither of them is waiting on me.",
      },
      {
        type: 'paragraph',
        text:
          "That parallel agent's output is a single-file library, `Moods.lua` — a map of mood-names to sparse FACS pose tables, plus a `combine()` helper. Overlapping controls average. Disjoint keys union. That's the whole API. Steal it if you want it.",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`-- A pose is just a sparse table of FACS control names → 0..1 values.
-- Sparse so an "absent" control means "no opinion" rather than "force to 0".
Moods.Smile = {
    LeftLipCornerPuller  = 0.6,
    RightLipCornerPuller = 0.6,
    LeftCheekRaiser      = 0.4,
    RightCheekRaiser     = 0.4,
}

-- combine() averages overlapping controls, unions disjoint ones. Two smiles
-- combined are still one smile (averaged), not a doubled-up smile (summed).
function Moods.combine(...: Pose): Pose
    local sums, counts = {}, {}
    for i = 1, select("#", ...) do
        local pose = (select(i, ...)) :: Pose
        for control, value in pairs(pose) do
            sums[control]   = (sums[control]   or 0) + value
            counts[control] = (counts[control] or 0) + 1
        end
    end
    local out: Pose = {}
    for k, sum in pairs(sums) do out[k] = sum / counts[k] end
    return out
end`,
      },
      {
        type: 'callout',
        variant: 'fun-fact',
        title: 'Fun fact',
        body: [
          "Roblox's animation system already blends overlapping tracks together when it can. Two [`AnimationTrack`](https://create.roblox.com/docs/reference/engine/classes/AnimationTrack) instances playing at the same priority cross-fade their joint poses by track weight; the engine effectively `combine()`s them for free at runtime. The reason I still wrote a `combine()` in script is that I want to build *one* `KeyframeSequence` per blended mood and register it once, instead of juggling N live tracks. But if you go the multi-track route, you get a lot of this behavior thrown in by the engine.",
        ],
      },
      {
        type: 'paragraph',
        text:
          "Here's where the *\"use the whole face\"* lesson from the validation pass (next section) lives in practice — at first I had three near-identical \"smiles\" that were all just lip-corner pulls. Real smiles aren't just mouths; they pull cheeks and brows along for the ride. Diversifying the table is what makes them visually distinct:",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`-- 🙂 SlightSmile — just the lip corners, barely.
Moods.SlightSmile = {
    LeftLipCornerPuller = 0.3, RightLipCornerPuller = 0.3,
}

-- 😊 WarmSmile — smile + Duchenne cheek raise.
Moods.WarmSmile = {
    LeftLipCornerPuller = 0.7, RightLipCornerPuller = 0.7,
    LeftCheekRaiser     = 0.6, RightCheekRaiser     = 0.6,
}

-- 🥰 Smitten — smile + cheeks + the sappy inner-brow raise.
Moods.Smitten = {
    LeftLipCornerPuller = 0.7, RightLipCornerPuller = 0.7,
    LeftCheekRaiser     = 0.5, RightCheekRaiser     = 0.5,
    LeftInnerBrowRaiser = 0.3, RightInnerBrowRaiser = 0.3,
}`,
      },
      {
        type: 'paragraph',
        text:
          "There's also a section of \"combination primitives\" — poses that don't map to a single emoji but compose well with `combine()`. They let you express something the catalog doesn't have a glyph for:",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`-- Primitives that compose. None of these is a "real" emoji.
Moods.HalfSmile  = { RightLipCornerPuller = 1 }
Moods.WinkLeft   = { LeftEyeClosed = 1 }
Moods.MouthOpen  = { JawDrop = 1 }
Moods.Surprised  = {
    JawDrop = 0.7,
    LeftEyeUpperLidRaiser = 1, RightEyeUpperLidRaiser = 1,
    LeftOuterBrowRaiser = 0.6, RightOuterBrowRaiser = 0.6,
    LeftInnerBrowRaiser = 0.5, RightInnerBrowRaiser = 0.5,
}

-- And then:
local cute = Moods.combine(Moods.Smile, Moods.WinkLeft)   -- 😉 (other side)
local yell = Moods.combine(Moods.Angry, Moods.MouthOpen)  -- ANGRY open mouth`,
      },
      { type: 'heading', level: 3, text: 'Lumpy, on purpose' },
      {
        type: 'paragraph',
        text:
          "The first attempt produced the rendering-bug shape from the earlier image. Diagnosing it took embarrassingly long, but the issue was simple: the cursor was pulling **one vertex** at full strength and leaving everything else alone. That gives you a tent pole. To get putty, you need a smooth falloff around the grabbed point so neighboring verts come along for the ride.",
      },
      {
        type: 'paragraph',
        text:
          "Pointy version (don't write this):",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`-- Naive: grab the closest vertex, move only that one.
for _, vid in ipairs(cageVertexIds) do
    if vid == nearestVid then
        dragWeights[vid] = 1            -- one vertex moves at full strength
    else
        dragWeights[vid] = 0            -- everything else stays put
    end
end
-- Result: a knife-edge spike. The grabbed point follows the cursor;
-- its immediate neighbors don't budge. The mesh shears between them.`,
      },
      {
        type: 'paragraph',
        text:
          "Lumpy version (do write this) — a smooth-bump kernel `(1 - (d/r)^2)^p` over an `EditableMesh` cage. Each vertex's weight depends on how far it sits from the grab point inside a sphere of radius `r`, raised to a power `p` that controls how flat the dome is:",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`-- DRAG_RADIUS    = 0.55   -- cage-local sphere radius (verts beyond this don't move)
-- FALLOFF_POWER  = 2.0    -- 1 = lumpy dome, 2 = round bump, >3 = flat top
local r, p = DRAG_RADIUS, FALLOFF_POWER

for _, vid in ipairs(cageVertexIds) do
    local pos = cageEM:GetPosition(vid)
    local d2  = (pos - localAnchor):Magnitude() ^ 2

    if d2 <= r * r then
        -- Smooth-bump weight. Flat-ish near the grab point, tapering to
        -- zero at the radius. Same gesture, rounded result.
        local tNorm   = math.sqrt(d2) / r
        local radialW = (1 - tNorm * tNorm) ^ p
        dragWeights[vid] = radialW
    end
end
-- Result: a rounded lump that follows the cursor like putty.`,
      },
      {
        type: 'paragraph',
        text:
          "There's also a *front-hemisphere cutoff* (only verts facing the camera get a non-zero weight), so when you grab a cheek you don't accidentally inflate the back of the head, but the radius-and-power kernel above is the part that converted the geometry from \"rendering bug\" to \"face.\" Same drag gesture, completely different feeling.",
      },
      {
        type: 'paragraph',
        text:
          "And then I hid the body. The Mario start screen is a head floating on wallpaper. So is this now.",
      },
      { type: 'heading', level: 3, text: 'The idle animation kept yeeting my head off camera' },
      {
        type: 'paragraph',
        text:
          "My avatar's idle animation has a big body-sway motion in it, and with the camera framing tightened up around just the head, the sway kept walking my head right out of the shot. So I disabled the idle.",
      },
      { type: 'heading', level: 3, text: 'The camera saga' },
      {
        type: 'list',
        items: [
          "**Camera follows the head.** Seemed smart. Once I put a background behind the head, it looked *terrible* — every time the head shifted, the background shifted with it, and the whole shot felt like found-footage horror. Undo.",
          "**Lock the camera perpendicular to the backplate at head-height.** Final answer. Background stays put, head can do whatever it wants in front of it, framing always reads as \"portrait of a face about to do something stupid.\"",
        ],
      },
      { type: 'heading', level: 3, text: 'Background' },
      {
        type: 'paragraph',
        text:
          "The background was the easy part. Just a tiled Roblox logo. I played around with making it more distressed — atmosphere effects, image tints, the whole bit — but the default looked fine, and I liked the **old Roblox logo tiled in the background as a little ode to the Super Mario start screen**. That was the vibe I was going for. Stop overthinking it. Ship it.",
      },
      { type: 'heading', level: 3, text: 'Chat commands — the no-UI way' },
      {
        type: 'paragraph',
        text:
          "I should probably mention here that I do UI professionally at Roblox — that's been my actual job for about eight years now. I love UI. I think about it constantly. So please take what I'm about to say in the spirit it's meant: **in a prototype, the right amount of UI is often zero.** Built-in input surfaces ship instantly, keep the codebase lighter, and let you reserve \"real UI\" for the parts of the experience that actually earn it. Chat commands are one of the cleanest examples on Roblox — `/smile` calls a function. Done. That's the entire input surface.",
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Tip — TextChatCommand is great for prototypes',
        body: [
          "[`TextChatCommand`](https://create.roblox.com/docs/reference/engine/classes/TextChatCommand) is a Roblox feature worth reaching for whenever you can. Low code, no UI to build, simple API, and **tab-autocomplete works out of the box** (`AutocompleteVisible` defaults to `true`). The same simplicity that makes it a long-standing admin and debug-tooling favorite makes it perfect for any low-stakes input surface.",
        ],
      },
      {
        type: 'paragraph',
        text:
          "And because every mood is a key in the `Moods` table, the *entire* command surface can be derived from that table at startup. No hand-written `/smile`, `/wink`, `/explode` boilerplate — just iterate:",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`-- One /<moodname> per preset in Moods. Adding Moods.Confused later
-- automatically gets a /confused command on the next server boot.
local sorted = {}
for name in pairs(Moods) do
    if type(Moods[name]) == "table" then table.insert(sorted, name) end
end
table.sort(sorted)

for _, name in ipairs(sorted) do
    local cmd = Instance.new("TextChatCommand")
    cmd.PrimaryAlias = "/" .. string.lower(name)
    cmd.Parent = TextChatService
    cmd.Triggered:Connect(function(textSource)
        local player = Players:GetPlayerByUserId(textSource.UserId)
        moodApplyRemote:FireClient(player, "apply", name)
    end)
end

-- And a manual combinator: /face smile winkleft → combine(Smile, WinkLeft).
-- Tokens are matched case-insensitively against Moods keys; unknown tokens warn.`,
      },
      {
        type: 'paragraph',
        text:
          "I also wanted to see the emoji *view* somewhere — and emojis don't render in Roblox text chat (various reasons). So for the dev-side I pulled in [Iris](https://github.com/SirMallard/Iris), an immediate-mode UI library for Roblox modeled on Dear ImGui. I've used it on a couple of projects. It makes the default things — sliders, buttons, toggles, windows — fast to write and visually consistent.",
      },
      { type: 'heading', level: 3, text: 'And then I actually looked at the faces' },
      {
        type: 'paragraph',
        text:
          "The faces did not look good. The kiss didn't look like a kiss. The frown didn't look like a frown. A lot of them looked vaguely the same — vaguely smile-shaped, vaguely concerned-shaped, but not *specifically* anything.",
      },
      {
        type: 'paragraph',
        text:
          "Which meant the next thing I was going to have to do — which I had been carefully avoiding — was go through every single mood and **manually validate every face by hand.**",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // EditableMesh + WrapDeformer: the tag team duo
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'EditableMesh + WrapDeformer: the tag team duo' },
      {
        type: 'paragraph',
        text:
          "I cut the agent loose with a fun assignment: **go validate every single facial animation.** Along the way we figured out how to drive the FACS controls via **animation tracks** instead of slamming values onto the face, which gave us a proper play/pause/blend pipeline. The iteration loop becomes:",
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Play the animation on the head.',
          'Take a screenshot through Studio MCP.',
          "Look at it. Is that a smile? Is that a kiss? Is that a *grimace*? Or is it just my avatar generally suffering?",
          'Tweak the FACS pose. Repeat.',
        ],
      },
      {
        type: 'paragraph',
        text:
          "Studio MCP is doing a lot of heavy lifting here. I never have to manually fly the camera, never press Play, never screenshot. The agent does the whole loop and shows me the receipts. **Validation handed off to a tool, again.**",
      },
      {
        type: 'gallery',
        columns: 3,
        shots: [
          { src: `${STICKERS_SHOTS}/04-smile-01-slight.png`, alt: 'Smirk',        caption: '😏 Smirk' },
          { src: `${STICKERS_SHOTS}/04-smile-02-smile.png`,  alt: 'Smile',        caption: '☺️ Smile' },
          { src: `${STICKERS_SHOTS}/04-smile-03-warm.png`,   alt: 'Warm smile',   caption: '😊 WarmSmile' },
          { src: `${STICKERS_SHOTS}/04-smile-04-grin.png`,   alt: 'Grin',         caption: '😀 Grin' },
          { src: `${STICKERS_SHOTS}/04-smile-05-warm-grin.png`, alt: 'Warm grin', caption: '😄 WarmGrin' },
          { src: `${STICKERS_SHOTS}/04-smile-06-hard-laugh.png`, alt: 'Hard laugh', caption: '😆 HardLaugh' },
        ],
      },
      {
        type: 'paragraph',
        text:
          "Concretely, the way moods get played at runtime is by building a [`KeyframeSequence`](https://create.roblox.com/docs/reference/engine/classes/KeyframeSequence) on the fly, registering it with [`KeyframeSequenceProvider`](https://create.roblox.com/docs/reference/engine/classes/KeyframeSequenceProvider), and playing the resulting animation on the character's `Animator` at `Action4` priority. The non-obvious bit is the **weight-0 body joints**:",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`local function buildKeyframeSequence(pose, name)
    local kfs = Instance.new("KeyframeSequence")
    kfs.Loop = true
    kfs.Priority = Enum.AnimationPriority.Action4

    local keyframe = Instance.new("Keyframe")
    keyframe.Time = 0

    -- IMPORTANT: every body-joint pose is weight=0. We only need the Pose
    -- hierarchy to exist so FaceControls can nest under "Head" — the engine
    -- reads NumberPose values inside that folder regardless of weights.
    -- Weight=1 here would override the lower-priority idle animation and
    -- visibly cancel its body motion the moment a mood is applied.
    local function pose(parent, joint)
        local p = Instance.new("Pose")
        p.Name, p.Weight, p.CFrame = joint, 0, CFrame.new()
        p.Parent = parent
        return p
    end
    local head = pose(pose(pose(pose(keyframe,
        "HumanoidRootPart"), "LowerTorso"), "UpperTorso"), "Head")

    local folder = Instance.new("Folder")
    folder.Name = "FaceControls"
    folder.Parent = head

    -- Emit every known FACS control. Sparse pose → implicit zero. This is
    -- what fully overrides the engine's default mood instead of bleeding it.
    for _, control in ipairs(ALL_FACS_CONTROLS) do
        local np = Instance.new("NumberPose")
        np.Name, np.Value = control, pose[control] or 0
        np.Parent = folder
    end
    keyframe.Parent = kfs
    return kfs
end`,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'The weight-0 thing was a real bug',
        body: [
          "Early versions had `weight = 1` on each joint pose because that's what you'd write reflexively. It compiled. It played. And then every time I sent `/smile`, my avatar's body would *freeze* mid-idle-animation, because the Action4-priority mood track was forcing every joint to CFrame.new() at full weight. Setting them to 0 keeps the hierarchy intact (so the engine still finds the `FaceControls` folder) without contributing to the body's pose.",
        ],
      },
      { type: 'heading', level: 3, text: 'Some faces don’t have all the parts' },
      {
        type: 'paragraph',
        text:
          "A funny realization mid-validation: a lot of avatar heads just **don't implement every FACS control**. Tongues in particular — a bunch of the classic Roblox heads don't have one, so the tongue animations are firing into the void. Same story for a couple of the more obscure controls. Part of the iteration loop became \"is this mood broken, or is this mood broken *for this head*?\"",
      },
      {
        type: 'paragraph',
        text:
          "I also gave the agent a longer leash on making the smile family *visually distinct*. There are five different smiles in the Apple emoji palette and they were all coming out as the same lip-corner pull. So I told the agent: pull in eyebrows, cheek raisers, inner brow raisers — use the whole face. Differentiate them. It did.",
      },
      { type: 'heading', level: 3, text: '“Do we need both?” — the EditableMesh vs WrapDeformer thing' },
      {
        type: 'paragraph',
        text:
          "One note on the deformation stack: I told the agent to use [`WrapDeformer`](https://create.roblox.com/docs/reference/engine/classes/WrapDeformer) for this. The mesh deformation part worked almost perfectly out of the gate — but I started getting permission errors when I tried to use [`EditableMesh`](https://create.roblox.com/docs/reference/engine/classes/EditableMesh) on the head that was actually on my avatar.",
      },
      {
        type: 'paragraph',
        text:
          "That makes sense. The asset was uploaded by the **Roblox** account, and asset permissions in `EditableMesh` have to be explicitly granted to whoever's editing them. We don't blanket-whitelist Roblox-owned assets to every creator — it's the same permission model that applies to anyone else's uploaded mesh.",
      },
      {
        type: 'paragraph',
        text:
          "Because I work at Roblox, I was able to force-enable a flag locally that bypasses this for my own sessions, which is how I kept moving. Worth being upfront about that — *the demo works on my machine partly because I cheated my way past a permission boundary most creators couldn't flip.* The code handles the public case gracefully: at character-setup time it probes [`AssetService:CreateEditableMeshAsync`](https://create.roblox.com/docs/reference/engine/classes/AssetService#CreateEditableMeshAsync) with a `pcall`, and if it fails, the runtime flips into a **FACS-pull fallback** instead of crashing.",
      },
      {
        type: 'paragraph',
        text:
          "In FACS-pull mode, dragging on the face doesn't move vertices — the runtime figures out *which part of the face you grabbed* and translates the drag direction into FACS controls. This is the part that gets fiddly with the camera mirror:",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`-- The cursor's "drag delta" comes in as a world-space vector. Convert into
-- the head's local space, then bin into one of six regions by Y/X bands.
local function classifyHeadRegion(localPos)
    local y, x = localPos.Y, localPos.X
    if y >  0.30 then return "Forehead" end
    if y >  0.00 then return x < -0.15 and "LeftEye"
                          or x >  0.15 and "RightEye" or "Nose" end
    if y > -0.22 then return x < -0.15 and "LeftCheek"
                          or x >  0.15 and "RightCheek" or "Nose" end
    if y > -0.40 then return "Mouth" end
    return "Chin"
end

-- Each region has its own drag → FACS mapping. Here's the Mouth one. The
-- mirror handling matters: the camera is in front of the face, so a drag
-- RIGHT on screen pushes the mouth to the head's anatomical LEFT.
if region == "Mouth" then
    if down  > 0 then pose.JawDrop      = strength * down end
    if up    > 0 then pose.Pucker       = strength * up * 0.9
                       pose.Funneler     = strength * up * 0.4 end
    if right > 0 then pose.MouthLeft        = strength * right * 0.7
                       pose.LeftLipStretcher = strength * right * 0.6 end
    if left  > 0 then pose.MouthRight       = strength * left  * 0.7
                       pose.RightLipStretcher= strength * left  * 0.6 end
end`,
      },
      {
        type: 'paragraph',
        text:
          "The whole face is split into Forehead / LeftEye / RightEye / Nose / LeftCheek / RightCheek / Mouth / Chin. Each region has its own mapping. The Cheek regions know about cheek puff. The Forehead knows about brows. Pulling down on the nose engages corrugator. It's a tiny rule-based animation system. **This is not what I want it to be**, but it's what you have to write when the platform doesn't ship a one-line API.",
      },
      {
        type: 'paragraph',
        text:
          "At some point in that frustration I asked the agent the obvious question: **do we actually need both? Can we do this with `WrapDeformer` and skip `EditableMesh` entirely?** The answer turns out to be: it depends on what you're trying to do. `WrapDeformer` is great if you're deforming **between two known meshes** — a defined rest pose and a defined target pose, with the deformer blending between them. Which leads me to my next side project, now living rent-free in my head:",
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Popcorn-kernel head (side project, daydream)',
        body: [
          "Your head is a kernel of popcorn. You're inside a popcorn machine. The machine heats up. You pop. Now your head is a fully popped, fluffy popcorn kernel — and the face is still on it, still working, still emoting at you from the inside of the popcorn-kernel geometry. There is just something extremely cute about a face being on a piece of popcorn.",
          "For *that* project, I think `WrapDeformer` alone is enough. I have a kernel mesh. I have a popped-kernel mesh. I want to blend between them. Done.",
        ],
      },
      {
        type: 'paragraph',
        text:
          "But for **this** project — arbitrary, live, finger-driven deformation of a head whose final shape is whatever the player just yanked it into half a second ago — there is no second known mesh. You need a way to *edit the actual vertex positions in real time*, and that's `EditableMesh`. `WrapDeformer` alone can't get there. They are the **tag team duo** here. You cannot drop one for the other.",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // Tragically, this does not work in production
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'Tragically, this does not work in production' },
      { type: 'heading', level: 3, text: 'The funky black stuff' },
      {
        type: 'paragraph',
        text:
          "Quick detour. When you stretch the head far enough, you start getting weird black chunks showing through the geometry — around the mouth, where the **plastic faces** of the head's internal mouth/teeth meshes start poking out through the deforming skin. It's *icky.*",
      },
      {
        type: 'image',
        src: `${STICKERS_SHOTS}/05-funky-black-stuff.png`,
        alt: 'Funky black voids around the mouth when the head is stretched far',
        caption: 'Internal mouth geometry poking through the skin. Known limitation. Moving on.',
      },
      {
        type: 'paragraph',
        text:
          "This seems like one of those things you live with. There are probably ways to limit it — for example, capping how far you're allowed to stretch the mouth area — but any clamp I write based on *this* head will likely fall apart on the next head with a differently-sized mouth. I'm not going to drop bespoke code in to handle this one case until I've thought about it more. **Known limitation. Moving on.**",
      },
      { type: 'heading', level: 3, text: '“Okay let’s try it in production”' },
      {
        type: 'paragraph',
        text:
          "I did a couple of small polish passes and then went to try this on the live, published version of the place.",
      },
      {
        type: 'paragraph',
        text:
          "I already knew `EditableMesh` wasn't going to work in production for the reasons covered above. So before publishing I added a **FACS fallback**: when `EditableMesh` isn't available, the drag input doesn't try to deform geometry — it translates the drag direction into a mood. Drag down → the mouth opens. Drag up → the eyebrows raise. Same system we were already using to play a mood on a face, just driven by drag delta instead of a chat command.",
      },
      {
        type: 'paragraph',
        text:
          "It came together fast and it's cute. I was making little chompy sounds at it while testing.",
      },
      {
        type: 'callout',
        variant: 'aside-stark',
        body: ['🎙️ TODO — record + embed the chompy audio clip here.'],
      },
      {
        type: 'paragraph',
        text:
          "Even though it's not the full Mario-yank thing, it gets close enough to the vision that I was really pleased with how quickly it stood up. I published it again. I expected this to work.",
      },
      {
        type: 'quote',
        text: 'It also did not work in production.',
      },
      {
        type: 'paragraph',
        text:
          "The reason this time: animation permissions. The fallback plays a specific keyframe animation, and you cannot play arbitrary keyframe animations on an arbitrary character — animation assets are gated by ownership too.",
      },
      {
        type: 'paragraph',
        text:
          "Specifically, the `KeyframeSequenceProvider:RegisterKeyframeSequence` call from the previous section returns a content URL like `rbxasset://temp-keyframesequences/...` that **only resolves inside Studio**. In a published place, those URLs silently no-op. So you end up with a two-path architecture, gated by `RunService:IsStudio()`:",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`-- Two playback paths, picked per-mood at runtime.
local IS_STUDIO = game:GetService("RunService"):IsStudio()

local function playMood(name)
    local pose = Moods[name]

    -- 1) Production-safe: if this mood has a permanent rbxassetid:// URL
    --    (uploaded out-of-band via tools/upload_moods.py — see below), play
    --    that. This is the only path that works in published experiences.
    local uri = MoodAssetIds.Ids[name]
    if uri then
        return playAssetUri(uri)
    end

    -- 2) Studio-only fallback: build a KeyframeSequence, register it for a
    --    temp content ID, play that. Works for /face combinations and ad-hoc
    --    poses where pre-uploading every variant isn't practical. Silently
    --    no-ops outside Studio.
    if IS_STUDIO then
        local id = KeyframeSequenceProvider:RegisterKeyframeSequence(
            buildKeyframeSequence(pose, name))
        return playRegisteredId(id)
    end

    warn(\`mood \${name} has no uploaded asset and we're not in Studio.\`)
end`,
      },
      {
        type: 'paragraph',
        text:
          "So the only path to actually shipping this is to **upload every one of these mood animations onto my own account** — once, out-of-band — and stash the resulting asset IDs in a lookup table the runtime can read. I wrote a Python uploader that parses `Moods.lua`, hits the Open Cloud Assets API for each one, and rewrites a generated Lua file in place:",
      },
      {
        type: 'code',
        language: 'luau',
        code:
`-- MoodAssetIds.lua — populated by tools/upload_moods.py.
-- Keys are mood names from Moods.lua; values are rbxassetid:// URLs that
-- resolve in production because the assets were uploaded under my account.
MoodAssetIds.Ids = {
    Afraid           = "rbxassetid://115755345833766",
    Aghast           = "rbxassetid://128027738837505",
    Angry            = "rbxassetid://90846961527288",
    Anguished        = "rbxassetid://113592766336826",
    Anxious          = "rbxassetid://101234389697998",
    Bawl             = "rbxassetid://109165684656611",
    BittersweetSmile = "rbxassetid://134936789190203",
    -- ...46 more entries...
}`,
      },
      {
        type: 'paragraph',
        text: "Which is — sorry, **what?**",
      },
      {
        type: 'paragraph',
        text:
          "I have to upload an animation for every mood. To make my own avatar smile. In an experience I made. That I am playing. On my own account.",
      },
      {
        type: 'paragraph',
        text:
          "I have no desire to upload these animations. I just want these facial animation keys to be playable on my avatar. **That's it.** We're working on that now.",
      },
      { type: 'heading', level: 3, text: 'Three phases, one shipped' },
      {
        type: 'paragraph',
        text:
          "By the time the dust settled there were three different versions of this project sitting in my head — one I wanted, one I tried, and one I actually shipped. Here's where each one runs and what blocks the next step:",
      },
      {
        type: 'table',
        caption:
          "Where I wanted to land vs. where I actually landed. Each row is what I would have shipped if the next blocker hadn't existed.",
        columns: [
          { key: 'goal', label: 'Phase' },
          { key: 'studio', label: 'Studio' },
          { key: 'prod', label: 'Production' },
          { key: 'blocker', label: 'What blocks it' },
        ],
        rows: [
          {
            goal:
              "**1. The full vision** — drag-deformable head *and* script-driven facial expressions, all on the fly.",
            studio: "✓ *(with the internal asset-editing flag enabled)*",
            prod: "✗",
            blocker:
              "`EditableMesh` requires explicit asset permission on the avatar's head mesh; Roblox-owned heads aren't whitelisted by default.",
          },
          {
            goal:
              "**2. Just the expressions** — script-driven facial animation via `KeyframeSequence` + `Animator`, no mesh deformation.",
            studio: "✓ *(no flag needed)*",
            prod: "✗",
            blocker:
              "`FaceControls` writes are gated by `PluginSecurity`; the workaround uses `KeyframeSequenceProvider:RegisterKeyframeSequence`, whose temporary content URLs **only resolve inside Studio**.",
          },
          {
            goal:
              "**3. What actually shipped** — drag falls back to FACS-pull; every mood is a permanent uploaded animation asset played via `Animator`.",
            studio: "✓",
            prod: "✓",
            blocker:
              "Nothing at runtime. *Cost:* **69 hand-uploaded animation assets** on my account that I now have to manage and keep in sync with `Moods.lua`.",
          },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Shout-out to the tooling',
        body: [
          "Phase 3 is not the outcome I wanted, but [Open Cloud](https://create.roblox.com/docs/cloud) plus the Studio MCP made the *\"upload 69 animations and keep them in sync\"* part **much** less arduous than it sounds. The whole upload step is a single `tools/upload_moods.py` script that parses `Moods.lua`, hits the Open Cloud Assets API for each entry, and rewrites the generated `MoodAssetIds.lua` lookup table in place. Adding a new mood is now: edit `Moods.lua`, run the script, ship.",
          "So I at least have a good way to iterate on this going forward, even though it isn't the version of this project I wanted to build.",
        ],
      },
      {
        type: 'paragraph',
        text:
          "Two things are worth saying out loud here. First: the fact that you have to upload an animation to make a character smile is, in my opinion, **wild**. It is such a simple thing. I'm genuinely surprised we don't offer a simple utility for this.",
      },
      {
        type: 'paragraph',
        text:
          "Second: on the deformation side, this is now the **second time this week** I've hit the same asset-permissions + `EditableMesh` wall on a different project. That one seems at least *partially* solvable in some cases, and we're looking into it.",
      },
      {
        type: 'paragraph',
        text: "But the question I keep coming back to on the facial animation side is more specific than \"why is this gated\":",
      },
      {
        type: 'quote',
        text:
          "We already let players animate their own avatar's face in real time, on camera, via [selfie view](https://en.help.roblox.com/hc/en-us/articles/17877687557396-Animate-Your-Avatar). And selfie view appears to expose only a *subset* of the FACS controls — I've stuck my tongue out at the camera plenty of times trying to get my avatar to copy me and it never has. If whatever subset selfie view exposes is acceptable for player-driven facial animation, why not expose exactly that subset as a public scripting API?",
      },
      {
        type: 'paragraph',
        text:
          "Whatever the policy reason is for restricting selfie view's coverage of FACS controls (tongue, certain extreme expressions, whatever it actually is), the same reasoning should apply on the scripting side. Match the surface, ship the API. This is the kind of thing that would make [Dynamic Heads](https://create.roblox.com/docs/art/characters/facial-animation/dynamic-heads) *go off* — NPCs that emote, in-game reactions, cutscenes, social moments, expressive companions. Each of those is a couple of well-placed `FaceControls` writes away. And right now I feel like we're crippling the feature by gating it harder than its own player-driven cousin.",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // Outro
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'Anyway, here’s the head' },
      {
        type: 'paragraph',
        text:
          "One day, one stretchable Mario-inspired Roblox head, one chat-driven mood library, one debug panel, one parallel emoji-cataloging agent, one popcorn-kernel side project living rent-free in my head, and one open platform question.",
      },
      {
        type: 'paragraph',
        text:
          "The demo works in Studio. It does *not* yet work in a published experience for everyone, for the reasons above — which is what I'm actively working on with the team.",
      },
      {
        type: 'paragraph',
        text: "If you want to poke at it:",
      },
      {
        type: 'list',
        items: [
          'The Moods library specifically: `src/ServerScriptService/MoodChat/Moods.lua` — single file, no deps, steal it.',
          'Chat commands: `/smile`, `/wink`, `/explode`, `/cry`, `/bawl`, `/face smile winkleft`, `/faceoff`, `/reset`.',
          'The iMessage companion app is **Stickers from Roblox** (this page). iOS source isn\'t public yet; ping me if you want to poke at it.',
        ],
      },
      {
        type: 'paragraph',
        text:
          "And if you read all the way down here — go watch the [Mario 64 start screen](https://www.youtube.com/results?search_query=super+mario+64+start+screen+face) for a minute. It's still the best thing.",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // Steal these patterns — developer cheat sheet. Each item names a
      // reusable shape from the build and links back to the section that
      // explains it in context. Borrowed-in-spirit from the proposal
      // doc's "What I can offer" closer; pointed outward at developers.
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'Steal these patterns' },
      {
        type: 'paragraph',
        text:
          "If you're building anything that touches Dynamic Heads, here's the reusable shape of this build in one list. Each line links back to where it's discussed in context above.",
      },
      {
        type: 'list',
        items: [
          "**Sparse FACS pose tables.** A pose is `{ [FaceControlName]: number }`; absent controls mean *\"no opinion,\"* so poses compose cleanly. [Where this is shown ↑](#while-one-agent-cooked-the-other-one-decorated)",
          "**A `combine()` that averages overlapping controls** and unions disjoint ones. Two smiles added = still one smile, not a doubled-up smile. [Where this is shown ↑](#while-one-agent-cooked-the-other-one-decorated)",
          "**Smooth-bump deformation kernel** — `(1 - (d/r)^2)^p` over an `EditableMesh` cage. Use this instead of moving a single vertex when you want putty, not a tent pole. [Where this is shown ↑](#lumpy-on-purpose)",
          "**`TextChatCommand` for prototype input.** No UI to build, tab-autocomplete out of the box, and the whole command surface generates from your data table at startup. [Where this is shown ↑](#chat-commands-the-no-ui-way)",
          "**`pcall` probe + capability fallback.** Detect `EditableMesh` access at runtime and route to a FACS-pull path on failure. Works for any Studio-only vs. production capability split. [Where this is shown ↑](#do-we-need-both-the-editablemesh-vs-wrapdeformer-thing)",
          "**`weight = 0` body joints in mood `KeyframeSequence`s.** Keeps the `FaceControls` folder reachable so the engine still finds it, while letting your idle animation keep playing underneath. The whole reason mood tracks compose with idles. [Where this is shown ↑](#editablemesh-wrapdeformer-the-tag-team-duo)",
          "**Two-path Studio/production runtime.** `IS_STUDIO` branches between `KeyframeSequenceProvider:RegisterKeyframeSequence` temp IDs (Studio-only) and pre-uploaded `rbxassetid://` URLs (production). The pattern generalizes to any Studio-vs-prod capability gap. [Where this is shown ↑](#tragically-this-does-not-work-in-production)",
          "**Open Cloud Assets API as the upload pipeline.** `tools/upload_moods.py` makes the 69-asset upload step a single command and regenerates the `MoodAssetIds.lua` lookup in place. Worth it any time you have to ship N variants of the same asset shape. [Where this is shown ↑](#three-phases-one-shipped)",
          "**Studio MCP as the validation loop.** The agent plays the animation, takes the screenshot, hands you the receipt. You stay out of the validation tree, which compounds across sessions. [Where this is shown ↑](#why-is-the-head-pointy)",
        ],
      },
      {
        type: 'paragraph',
        text:
          "If you want the long version of any of these, scroll back up — they're all in context, with the surrounding story for why they ended up looking the way they do.",
      },

      { type: 'rule' },

      // -----------------------------------------------------------------
      // Resources
      // -----------------------------------------------------------------
      { type: 'heading', level: 2, text: 'Resources' },
      {
        type: 'paragraph',
        text:
          "References that informed this project — prior art that proved the concept, plus the Roblox APIs and tooling I leaned on. If you want to make your own version, this is the reading list.",
      },
      { type: 'heading', level: 3, text: 'Prior art and inspiration' },
      {
        type: 'list',
        items: [
          "[Mario's face from the SM64 landing screen, draggable](https://www.youtube.com/watch?v=stK4h115y70) — a demonstration of what the start-screen face actually does when you pull it around. Two minutes of this is what convinced me to finally start.",
          "[*SM64 — Mario Gets A…* by mech-mind-games (itch.io)](https://mech-mind-games.itch.io/sm64-mario-gets-a) — a faithful in-browser recreation of the start menu, complete with a hidden secret animation. Left-click + drag to morph, right-click to reset. The creator wrote it up for their YouTube channel: [SethFunk](https://www.youtube.com/c/SethFunk).",
          "[*Stretch and Distort Mario's Face* (WebSim)](https://websim.com/@Pan_In_Panama/stretch-and-distort-marios-face) — a WebSim community has been riffing on this exact idea; lots of variants worth poking at.",
          "[WebGL-3D-Face-Manipulation by DaveBenRoberts (GitHub)](https://github.com/DaveBenRoberts/WebGL-3D-Face-Manipulation) — a clean WebGL reference implementation of finger-driven mesh deformation. Useful if you want to see how a non-Roblox engine handles the same problem.",
        ],
      },
      { type: 'heading', level: 3, text: 'Roblox APIs and tooling' },
      {
        type: 'list',
        items: [
          "[Introducing the new WrapDeformer Instance (DevForum)](https://devforum.roblox.com/t/introducing-the-new-wrapdeformer-instance/3294953) — the official announcement post. Covers static deformations, dynamic deformations driven by `EditableMesh`, and the blend-shape / \"shape keys\" workflow, with an example `.rbxl` file. The *\"Dynamic deformations of a rigged, skinned and animated Mesh\"* section is what made me believe this was actually possible on a Roblox avatar.",
          "[Head specifications → FACS animation](https://create.roblox.com/docs/en-us/art/characters/head-specifications#facs-animation) — the only place in the creator docs that maps FACS controls to human-readable expressions. Five entries: two eye-blinks, mouth-opens, happy, sad. These are the validation poses an avatar head has to pass.",
          "[Roblox Studio MCP](https://github.com/Roblox/studio-rust-mcp-server) — the Studio MCP server used to drive screenshots and validation from inside the agent loop. The single biggest contributor to keeping me out of the validation loop.",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Working with coding agents — short opinion piece
  // ---------------------------------------------------------------------------
  // This was originally an inline callout inside the Stickers from Roblox post.
  // Pulled out into its own document so it can be referenced from other
  // project landings (or anywhere else) without re-litigating the AI question
  // in every post.
  {
    slug: 'working-with-coding-agents',
    kicker: 'Note · 2026',
    title: 'Working with coding agents',
    tagline:
      "A standing note on why I work with AI coding agents, what it has and hasn't changed about how I program, and why I'm not self-conscious about it.",
    palette: 'dusk',
    href: '/projects/working-with-coding-agents/',
    content: [
      {
        type: 'paragraph',
        text:
          "For any AI haters out there — I completely respect your choice to use or not use coding agents. But I've been a manager for several years now, and in that time I've coded less and less. Something about coming back to programming after that is that it's actually a lot more like the job I was already doing: high-level guidance, code reviews, knowing what \"good\" looks like. I think this is a natural part of the evolution of being a programmer in this industry, and what's happened with AI is that we're all just **accelerated** to that level.",
      },
      {
        type: 'paragraph',
        text:
          "So I have no qualms — not an ounce of self-consciousness — about choosing to use AI. Half the time I think the stuff it writes is bad. Half the time I think it's great. Either way it speeds me up, it's a great partner to work with, and if I want to learn something or prototype quickly, it's the best thing I have. I'm having a blast, and I don't think any of this reflects poorly on my programming ability.",
      },
    ],
  },
];

export function getProject(slug) {
  return PROJECTS.find((p) => p.slug === slug) ?? null;
}
