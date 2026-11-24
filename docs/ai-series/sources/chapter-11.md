# Sources for chapter 6, "Giving it hands"

This file was renamed when the series was renumbered on 2026-11-23; chapter numbers inside it are
the old ones (old 1 is now 3, 2 is 4, 3 is 6, 4 is 7, 5 is 9, 6 is 11, 7 is 12, 8 is 13, 9 is 14,
10 is 15).

Checked on 2026-11-23 unless noted.

| Claim in the chapter | Status | Source |
|---|---|---|
| The AI systems John uses at work read files, change them and run programs | John to confirm | From John's description of using a coding agent |
| An AI model can only write text; a separate program carries out its requests | author's knowledge | How tool use works in these systems. No citation gathered. Add the provider's documentation on tool use before publishing. |
| That program is called a harness | author's usage | The term is common but not universal ("agent harness"). Check a source that uses it. |
| The five requests | written for the page | The page says so |
| What each request does to the pretend computer | verified | `src/lib/ai-series/harness/harness.ts` and its tests |
| The harness John uses has rules: always, ask first, never | not checked today | True of Claude Code's permission settings as Claude knows them (allow, ask and deny rules). Link the documentation before publishing. |
| A flaw in the harness or surrounding software can let through what the rules forbid; this happened in the July 2026 incident | reported | See chapter 7's notes in `docs/ai-series/PLAN.md`. Chapter 7 must verify it against the original reports. |

Not in the chapter yet: when tool use and the Model Context Protocol were introduced. Verify before
adding the "Plug in a tool" extra.
