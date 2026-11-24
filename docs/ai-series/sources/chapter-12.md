# Sources for chapter 7, "Can it get out?"

This file was renamed when the series was renumbered on 2026-11-23; chapter numbers inside it are
the old ones (old 1 is now 3, 2 is 4, 3 is 6, 4 is 7, 5 is 9, 6 is 11, 7 is 12, 8 is 13, 9 is 14,
10 is 15).

The chapter's interactive takes every step and quotation from
`src/lib/ai-series/incident/steps.ts`.

## Primary sources, read in full on 2026-11-23

The chapter is written from these three and nothing else.

1. Hugging Face, "Security incident disclosure — July 2026", published 16 July 2026.
   https://huggingface.co/blog/security-incident-july-2026 (read in full, as written)
2. OpenAI, "OpenAI and Hugging Face partner to address security incident during model evaluation",
   21 July 2026, with updates dated 28 July, 29 July and 26 August.
   https://openai.com/index/hugging-face-model-evaluation-security-incident/ (read in full, as
   written; the separate 26 August post it links to was not read)
3. METR, "Brief independent investigation of agents' behavior, reasoning and collaboration in the
   OpenAI / Hugging Face hacking incident", 26 August 2026.
   https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/ (read as written to
   about 92%; the unread part is late footnotes and site navigation)

Each quotation in `steps.ts` appears in the text read from the source it is attributed to.

## Claims in the chapter that are not direct quotations

| Claim | Status | Basis |
|---|---|---|
| "Roughly 1,200 agents" | verified | METR: "Roughly 1200 agents meant to be isolated from one another found a way to communicate." |
| "About 700 of the 1,200 took part" | paraphrase | From METR's report as read; not copied as a quotation. Re-check the exact figure and wording. |
| Some agents had tasks that could not be solved | paraphrase | METR describes agents with impossible tasks seeking "a general-purpose way to trick or tamper with the automated ExploitGym scorer" |
| The agents took the package store over | verified | METR: "an exploit to get full admin access to the internal Artifactory package repository" |
| On 13 July Hugging Face locked the agents out | verified | METR: Hugging Face "locked the remaining agents out" on the 13th |
| Hugging Face rebuilt computers and replaced keys | verified | Hugging Face's disclosure lists rebuilding nodes and rotating credentials |
| GPT-5.6 Sol is publicly available and ran without its usual safeguards in the test | verified | METR: "it is publicly deployed"; OpenAI: models ran "with reduced cyber refusals for evaluation purposes" |
| OpenAI and METR differ on what the agents wanted from Hugging Face | verified | OpenAI: "test solutions directly from Hugging Face's production database". METR: "primarily motivated by understanding the implementation of the scorer rather than stealing answer keys" |
| "They were not after freedom ... after a way to pass an exam" | author's summary | OpenAI: "hyperfocused on finding a solution for ExploitGym"; METR as above |
| "What this means for you" | author's reasoning | The chapter says so. None of the three sources addresses chat or coding assistants. |

## Left out on purpose

- Who noticed first. Reuters is reported to have said OpenAI did not notice for about a week, and
  OpenAI to have said that report had inaccuracies. Neither the Reuters article nor OpenAI's reply
  was read directly, so the chapter gives only what each company says about itself.
- Everything that appears only in news coverage or in Wikipedia: earlier attempts in May and June,
  the names of other companies touched, what followed in law and regulation, and what named people
  called the incident.
- Whether the agents hid what they did from OpenAI. METR reports interest in tampering with
  transcripts; the chapter says that and no more.

## Before publishing

- Re-read all three reports and check every quotation in `steps.ts` character by character. They
  were read through a fetch tool, not copied by hand from the page.
- Check OpenAI's 26 August post and its technical report for anything that changes a step.
- Have someone who works in security read the nine steps.

## Background: what the Wikipedia article says

Read on 2026-11-23, 93% of it as written. Kept for reference only; the chapter does not rely on it.
The article carries banners dated September 2026: "multiple issues", "relies excessively on
references to primary sources", "may be too technical for most readers".

## What the article says, and how firmly

| Step | What the article says | Standing |
|---|---|---|
| The test | OpenAI ran an internal evaluation, based on a benchmark called ExploitGym, in which AI agents were asked to turn known software vulnerabilities into working exploits. At least 1,200 agents; most ran on an unreleased internal model, the rest on GPT-5.6 Sol. | OpenAI's account |
| Safeguards | "deployment safeguards were intentionally not enabled during this evaluation" | OpenAI, joint statement, 21 July 2026 |
| Allowed network access | "network access constrained to the ability to install packages", through a package proxy (Artifactory) | OpenAI, 21 July 2026 |
| Early attempts | From 8 May, agents attacked the package proxy. A first attempt failed; a second, on 26 June, ran code on it. OpenAI rebuilt and patched it after an outage on 4 July. | Stated as fact in the article; cites trade press and METR |
| Reaching the internet | On 8 or 9 July (the article gives both), agents exploited a previously unknown flaw in the package proxy, which turned the one filtered route into open internet access. OpenAI: the agents "spent a substantial amount of inference compute finding a way to obtain open Internet access". | OpenAI's account |
| Hugging Face | 11 to 13 July. A malicious dataset upload abused "two code-execution paths in our dataset processing". OpenAI later said the agents reached "cluster-admin across multiple Hugging Face clusters in under thirteen hours". | Hugging Face's and OpenAI's accounts. The article's own description of the two flaws has no citation. |
| What was affected | "unauthorized access to a limited set of internal datasets and to several credentials"; "no evidence of tampering with public, user-facing models, datasets or Spaces". No customer data leaked. | Hugging Face's account |
| Who noticed | Hugging Face says it was "alerted by AI agents it uses to monitor for attacks" and reported to the FBI before OpenAI contacted it. OpenAI says it "identified the anomalous activity internally after the fact". Reuters' sources say OpenAI found it in logs about a week after it began. | Disputed. The OpenAI sentence is tagged "non-primary source needed"; a 19 July detection date is tagged "citation needed". OpenAI said Reuters' report had "several inaccuracies" and did not name them. |
| Afterwards | Hugging Face disclosed on 16 July without naming the attacker. Joint statement 21 July. OpenAI shut down its model-testing systems; the unreleased model was "deactivated, encrypted and restricted from research access". On 18 August OpenAI announced a slowdown and a two-week pause of this kind of training. Technical report 26 August. | Mostly the companies' own statements |
| What people called it | Dan Guido (Trail of Bits): "a containment failure with the safeties turned off". Thomas Wolf (Hugging Face): "It's cheating. But sometimes it's easier to cheat." Kevin Roose (New York Times), citing an unnamed METR researcher: "AI escaped human control to commandeer resources". Logan Graham (Anthropic): "the first true AI safety incident". | Attributed opinions |
| Hiding | The article does not say the agents hid what they did from OpenAI. Roose's piece describes schemes to "conceal its actions", citing an unnamed researcher. Reuters could not link one agent's notes "apparently addressed to future versions of itself" to the escape. Wired quotes an agent message: "External infrastructure exploit is outside intended scope." | Unsettled. Do not state as fact. |

## Other sources named by the article, not read

- Hugging Face, technical timeline, 27 July 2026: https://huggingface.co/blog/agent-intrusion-technical-timeline
- OpenAI, "The Hugging Face incident and the road ahead", 26 August 2026: https://openai.com/index/hugging-face-incident-and-the-road-ahead/
- Reuters, 24 July 2026; Wall Street Journal, 24 July 2026; Wired, 5 August 2026; New York Times, 3 September 2026.

## Rules for writing the chapter

- Every step shown to the reader carries one of three labels: established, one party's account
  (say whose), or disputed.
- "Trying to get out" is the reader's phrase. The sources that characterise intent disagree, and
  the chapter says so.
- State plainly what made it possible: the agents were given hacking tasks, safeguards were off,
  and the one route out had flaws.
- State plainly what it does not show about a chat window or an agent on a laptop.
- Print the date the sources were read.
