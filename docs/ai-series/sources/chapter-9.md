# Sources for chapter 9, "How I used AI to build this"

The chapter is written from the saved record of the session that built the series (on John's
machine, not in this repository), this repository's history, and one outside document. Nothing in
it may identify the series' reader.

## Claims

| Claim | Status | Basis |
|---|---|---|
| Claude wrote every word and all the code; John asked, chose and corrected | verified | Session record; chapter 0 says the same |
| "It took one day" | verified | Every commit from 87567d2 on, and the session, are dated 2026-11-23 (local time) |
| John's quoted messages | verified | Copied from his messages in the session record. One is shortened: the touchscreen message continues after "moves" |
| "Ten chapters" was his answer to a question about the plan | verified | Session record |
| The first plan said an AI getting out only happens in films | verified | The plan's first version: "The picture from films is wrong about how it works." |
| The incident happened after the last text Claude practiced on | verified | Incident: July 2026. The model's stated knowledge cutoff: June 2026 |
| Work was handed to other AI models, each time with written instructions | verified | 50 agent launches counted in the session record before chapter 9 was begun; the page gives no number |
| A caption would have said the opposite of the picture above it | verified | Build agent's report for chapter 4 (summary line against caption) |
| All checks passed while every chapter showed "Invalid Date" and had lost its title | verified | Session record; fixed in `vite.config.ts` |
| Claude asked before the download, with size and source; 65 openings, nine left out | verified | Session record; `docs/ai-series/sources/chapter-3.md` |
| The touch-drag fault was found by John on his phone; earlier checks used a mouse or simulated touches | verified | Session record |
| Readers found the chapter 4 contradiction, corrected chapter 2's biology, proposed the counselor comparison | verified | Round 1 reports |
| "Thirteen pretend readers in all" | verified | Three in round 1, three in round 2, one re-read of chapter 4, and three rounds of two for chapter 9 |
| Chapter 4 "cut by about a third" | verified | 1,106 words on the page before, 755 after |
| Nothing was published until John said so, each time | verified | Session record |
| The harness setting: no stop for routine work; a second AI model reviews each action and blocks risky ones; the company says this does not guarantee safety; a stricter setting exists | verified through a summarizing fetch | The session ran in permission mode "auto" (session record). Claude Code documentation, permission modes page, read 2026-11-23: "A separate classifier model reviews actions before they run and blocks the ones it judges risky"; "does not guarantee safety". Exact wording not checked against the page itself |
| Written instructions, some from John and some from the company, said to ask before publishing or large downloads | verified | John's standing instructions and the product's own instructions to the model, both in the session record |
| John's first message described his mother and went to Anthropic with the conversation | verified | Follows from how the product works; chapter 5 |
| No identifying detail is in any public file; each batch of changes was searched first | verified | Searches run before each commit |
| John caught two mistakes: the news story and the touch-drag fault | verified | Session record |
| Facts in chapters 1 to 8 were checked against sources by AI and not by a human expert | verified as far as the session shows | No expert review took place in the session. Whether John has had anyone read them is not known to the writer |
| It worked in the website's folder; a second copy is kept elsewhere; a program it runs can reach beyond the folder | verified | The repository is on GitHub; the sandbox setting was off |
| The first quoted message ("Like me, she does not do well with reading long form content...") | verified | From John's first message; this sentence contains nothing identifying |
| "The work took several hundred steps" | verified | 449 tool actions by the coordinating model counted in the session record before chapter 9 was written, not counting the other models' own steps |
| The saved record shows it asked every time before publishing or a large download | verified | Each push to the public site and the model download follow a message from John saying to do it |
| Whether the second model would have blocked an unasked publish was never tested | verified | No such attempt was made. The documentation lists production deploys among actions the setting blocks by default; this was not tested and the page does not claim it |
| A program started by the harness could have changed other files or used the internet | verified | The sandbox setting was off; during the session the AI did write to John's notes folder and use the internet, at his request |
| The pretend readers were other Claude models at the same company and were given a description of the reader | verified | Session record |
| A model knows nothing written after its practice ended | general statement | Consistent with chapter 5's fixed file; the first plan's error is the example |

## Removed after the reader test

A section "Who owns it" quoted the U.S. Copyright Office (*Copyright and Artificial Intelligence,
Part 2: Copyrightability*, January 2025, page iii: "Copyright does not extend to purely
AI-generated material"; "prompts do not alone provide sufficient control"). Both quotations were
read in the report itself on 2026-11-23. Readers found the section interesting but not about their
questions, and the page was too long, so it was cut. The plan lists ownership under "also covers";
it can return if John wants it.


## Confirmed by John

On 2026-11-23, after reading the published chapter, John confirmed that its account of his harness
setting and written instructions ("What it could touch") is accurate.

## Added from John's answers (2026-11-23)

| Claim | Status | Basis |
|---|---|---|
| John uses a personal plan with the model-training setting turned off | John's statement | He said the "Help improve our AI models" setting is turned off, on a personal plan |
| So the description is not used for training unless flagged for safety review | follows from chapter 5 | `docs/ai-series/sources/chapter-5.md`, Anthropic's published rules as read there |
| He keeps his conversations and does not delete them | John's statement | He archives every session; archiving is not deleting |
| Why he chose the setting: coding agents since 2023, grown trust, partly overconfidence, not hurt yet, questions it often | John's statement, reworded | His words: "I'm running on auto somewhat hubristically, but it has not bit me... I question whether or not it's a good idea often" |
