# Research for chapter 7, "Can it get out?"

The chapter is not written. This file holds what has been read so far about the July 2026 incident,
so the chapter can be written against it.

Read on 2026-11-23: the Wikipedia article "OpenAI rogue agent breach of Hugging Face", 93% of it as
written (the rest is navigation and footer). **None of the primary sources below has been read
yet.** The chapter must be written from the primary sources, not from Wikipedia. The article
carries banners dated September 2026: "multiple issues", "relies excessively on references to
primary sources", "may be too technical for most readers".

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

## Primary sources to read before writing

- Hugging Face, "Security incident disclosure, July 2026", 16 July 2026: https://huggingface.co/blog/security-incident-july-2026
- Hugging Face, technical timeline, 27 July 2026: https://huggingface.co/blog/agent-intrusion-technical-timeline
- OpenAI and Hugging Face, joint statement, 21 July 2026: https://openai.com/index/hugging-face-model-evaluation-security-incident/
- OpenAI, "The Hugging Face incident and the road ahead", 26 August 2026: https://openai.com/index/hugging-face-incident-and-the-road-ahead/
- METR, independent investigation, 26 August 2026: https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/
- Reuters, 24 July 2026: https://www.reuters.com/business/its-ai-agent-spent-days-hacking-company-sources-say-openai-did-not-notice-week-2026-07-24/
- Wall Street Journal, 24 July 2026: https://www.wsj.com/tech/ai/how-the-futuristic-hack-by-rogue-openai-models-unfolded-1657bcea
- Wired, 5 August 2026: https://www.wired.com/story/openai-didnt-notice-its-ai-agents-using-a-message-board-to-plan-their-hacking-spree/
- New York Times (Roose), 3 September 2026: https://www.nytimes.com/2026/09/03/technology/openai-hugging-face-hacking.html

## Rules for writing the chapter

- Every step shown to the reader carries one of three labels: established, one party's account
  (say whose), or disputed.
- "Trying to get out" is the reader's phrase. The sources that characterise intent disagree, and
  the chapter says so.
- State plainly what made it possible: the agents were given hacking tasks, safeguards were off,
  and the one route out had flaws.
- State plainly what it does not show about a chat window or an agent on a laptop.
- Print the date the sources were read.
