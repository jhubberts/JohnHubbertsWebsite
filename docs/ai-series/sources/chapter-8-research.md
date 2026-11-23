# Chapter 8, "What it costs": sourced fact sheet

Compiled 23 November 2026. Not chapter prose.

**How to read the marks.** VERIFIED means the supporting words were in the page text I fetched. PARTLY means I only saw a search-result summary or a news report of the source, or the page fetched did not contain the figure. NOT FOUND means no source located. Caveat on "verbatim": my fetch tool returns pages through a summarising step, so quotes are as relayed by it. Check each against the live page before print. Where I read a PDF directly (the two Berkeley Lab reports), I say so.

---

## A. Electricity per text prompt

### A1. Company-published figures

**A1a. Google: median Gemini Apps text prompt uses 0.24 Wh.** VERIFIED.
- Quote: "the median Gemini Apps text prompt uses 0.24 watt-hours (Wh) of energy"
- Source: Google Cloud blog, "Measuring the environmental impact of AI inference", 21 Aug 2025. https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference . Paper: Elsworth et al., "Measuring the environmental impact of delivering AI at Google Scale", arXiv:2508.15734, 21 Aug 2025. https://arxiv.org/abs/2508.15734 (primary, from Google).
- Measured: median prompt, Gemini Apps, text only, data from May 2025. Includes active chips, idle machines, CPU and RAM, data-centre overhead.
- Caveats (Google's): "The data and claims have not been verified by an independent third-party." Results "do not represent the specific environmental impact for all Gemini App text-generation prompts." A narrower count of active chips only gives 0.10 Wh, which Google calls "an optimistic scenario at best." Google reports a 33x drop in energy per median prompt over the year to May 2025.
- Median is not the same as an average (A1b).

**A1b. OpenAI (Sam Altman): the average ChatGPT query uses about 0.34 Wh.** VERIFIED for the wording; the date is PARTLY.
- Quote: "the average query uses about 0.34 watt-hours" and "about what an oven would use in a little over one second"
- Source: Sam Altman, blog post "The Gentle Singularity". https://blog.samaltman.com/the-gentle-singularity . The fetched page showed no date. A secondary blog dates it 10 June 2025 (https://simonwillison.net/2025/Jun/10/sam-altman/), not fetched.
- Measured: "average" query; no method, model, or scope given. This is a CEO's blog post, not a methodology paper.
- Caveat: critics note no methodology was published (PARTLY, search summaries).

**A1c. Mistral.** Energy per response: NOT FOUND. Mistral gives carbon and water per response only (see B1).

**A1d. Anthropic, Meta.** Per-prompt electricity figure: NOT FOUND. A March 2026 guide (search summary only, PARTLY) says Anthropic has published none.

**A1e. Microsoft.** Microsoft Research authors (not a product disclosure) estimate a median 0.34 Wh per query for frontier-scale models. VERIFIED (abstract).
- Quote: "a median energy per query of 0.34 Wh (IQR: 0.18–0.67)"
- Source: Oviedo et al., "Energy Use of AI Inference: Efficiency Pathways and Test-Time Compute", Microsoft Research, Sept 2025. https://www.microsoft.com/en-us/research/publication/energy-use-of-ai-inference-efficiency-pathways-and-test-time-compute
- Measured: bottom-up estimate for models over 200 billion parameters on H100 nodes. It is an estimate, not a measurement of Microsoft products. Only the abstract was visible.

### A2. Independent estimates and the older higher number

**A2a. Epoch AI: about 0.3 Wh for a typical GPT-4o query.** VERIFIED.
- Quote: "typical ChatGPT queries using GPT-4o likely consume roughly 0.3 watt-hours"
- Source: Epoch AI (Josh You), "How much energy does ChatGPT use?", 7 Feb 2025. https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use
- Assumptions: about 500 output tokens, about 1 second of H100 time, 70% of peak power. The author calls it pessimistic and says plausible assumptions span about 0.1 to 4 Wh.
- Update: Epoch's topic page (updated 14 Jul 2026, VERIFIED) says a 100-word prompt to a free chatbot takes "around 0.6 watt-hours (Wh) of energy to generate your response", which includes "a share of the upfront energy cost of developing the model." https://epoch.ai/publications/ai-energy

**A2b. The older figure of about 3 Wh.** PARTLY.
- Epoch attributes it to Alex de Vries (2023) and says it assumed 2,000 output and 4,000 input tokens per query and older A100 hardware. I did not read de Vries's paper. Epoch's page says it was "widely cited." Superseded by A1a, A1b, A2a (all 0.24 to 0.34 Wh), though none is independently audited.

**A2c. Academic benchmark.** Jegham et al., "How Hungry is AI?", arXiv:2505.09598 v6 (24 Nov 2025): a "0.42 Wh short query" (model not named on the page I fetched). https://arxiv.org/abs/2505.09598 . VERIFIED for the abstract; the method uses "company-specific environmental multipliers and statistical inference of hardware configurations", so it is inferred, not measured.

### A3. How the figure varies by request

**A3a. Long inputs.** Epoch estimates about 2.5 Wh for a 10,000-token input and about 40 Wh for 100,000 tokens. VERIFIED (same Epoch page). Estimates, not measurements.

**A3b. Reasoning modes.** VERIFIED.
- Quote: reasoning-enabled models used "30 times more power on average to respond to 1,000 written prompts"
- Source: Fortune, 5 Dec 2025, reporting the AI Energy Score project (Hugging Face and Salesforce). https://fortune.com/2025/12/05/ai-reasoning-energy-problem-data-centers-30-times-more-power/ (news report of the study).
- Measured: 40 open models, 1,000 prompts, same hardware. Spread is wide: one Phi 4 reasoning model used 9,462 Wh with reasoning on and about 18 Wh off, for the whole 1,000 prompts. The 30x is an average across the set.
- Microsoft Research (A1e) estimates 4.32 Wh median per query with about 15x more tokens (abstract, VERIFIED).
- Jegham et al.: "exceed 29 Wh per long prompt" for the most energy-intensive models (VERIFIED, abstract).

**A3c. Images and video.** VERIFIED, from open models only.
- Source: MIT Technology Review, "We did the math on AI's energy footprint", 20 May 2025. https://www.technologyreview.com/2025/05/20/1116327/ai-energy-usage-climate-footprint-big-tech/
- Figures as reported: Llama 3.1 405B text response about 6,706 J total (about 1.9 Wh, my conversion); Llama 3.1 8B about 114 J (about 0.03 Wh). One Stable Diffusion 3 image about 2,282 J (about 0.63 Wh), or 4,402 J at 50 steps. A 5-second CogVideoX video "about 3.4 million joules" (about 0.94 kWh). Totals estimated by doubling GPU energy.
- Caveat: "Closed models like ChatGPT, Gemini, and Claude don't disclose their energy data", so these do not apply directly to them.

---

## B. Water per text prompt

**B1a. Google: 0.26 mL (about five drops).** VERIFIED. Same Google blog as A1a: "consumes 0.26 milliliters (or about five drops) of water". Derived from energy per prompt and Google's 2024 fleet-average water usage effectiveness. Counts on-site data-centre cooling only. Narrow-method figure 0.12 mL.

**B1b. OpenAI (Altman): about 0.000085 gallons, "roughly one fifteenth of a teaspoon".** VERIFIED. Same Altman post as A1b. 0.000085 US gal is about 0.32 mL (my conversion). No method given. In Feb 2026 Altman called claims of gallons per query "completely untrue, totally insane" (Fortune, 24 Feb 2026, VERIFIED). https://fortune.com/2026/02/24/sam-altman-open-ai-electricity-usage-water-usage-data-centers-ceo-tech/

**B1c. Mistral: 45 mL of water, 1.14 gCO2e, for a 400-token Le Chat response.** VERIFIED.
- Quote: "the use of our AI assistant Le Chat for a 400-token response - excluding users' terminals"
- Source: Mistral, "Our contribution to a global environmental standard for AI", 22 Jul 2025. https://mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai . Life-cycle analysis done with Carbone 4 and ADEME, peer-reviewed by Resilio and Hubblo (company's own account).
- Measured: marginal inference only, not training, with upstream impacts such as server manufacturing. Caveat: "this study is a first approximation."

**B2. Widely quoted independent estimate: GPT-3 "drinks" a 500 mL bottle per roughly 10 to 50 medium-length responses.** VERIFIED.
- Quote: "GPT-3 needs to “drink” (i.e., consume) a 500ml bottle of water for roughly 10 – 50 medium-length responses"
- Source: Li, Yang, Islam, Ren, "Making AI Less 'Thirsty'", arXiv:2304.03271 v5, last revised 26 Mar 2025. https://arxiv.org/html/2304.03271v5 (first posted 2023)
- Counted: on-site cooling evaporation plus off-site water used to generate electricity. Excluded: water embedded in manufacturing. The paper's own table gives about 17 to 66 responses per 500 mL by site. The authors call their inference energy figure conservative and say newer models likely use more.
- Superseded or disputed? It describes GPT-3 on Microsoft data centres, not today's systems. Ren says Google's comparison to his number is misleading because his includes off-site water (TechRadar, PARTLY, page date unreliable: https://www.techradar.com/pro/today-i-learned-a-single-google-gemini-query-uses-about-five-drops-of-water-but-thats-not-the-whole-truth ).

**B3. Whole US data-centre water.** VERIFIED (read the report PDF). LBNL 2024 report: US data centres directly consumed about 66 billion litres in 2023 and had an indirect water footprint of "nearly 800 billion liters" through electricity generation. Same report as D2.

---

## C. Everyday comparisons

**C1. One web search: about 0.3 Wh (Google, 2009).** PARTLY.
- Quote: "in 2009 Google estimated that a typical search required 0.3 Wh of energy."
- Source: Full Fact, 15 Aug 2019. https://fullfact.org/environment/google-search/ . Google's January 2009 blog post could not be read (body missing from the fetch). A search summary of its text gave 0.0003 kWh (1 kJ) per search including pre-query work.
- Caveats: 17 years old. Full Fact says it had no more recent data. No current Google figure found.

**C2. One hour of streaming video: about 0.077 kWh (77 Wh), Netflix, 2019.** VERIFIED.
- Quote: "streaming a Netflix video in 2019 typically consumed around 0.077 kWh of electricity per hour."
- Source: IEA commentary (George Kamiya), 10 Dec 2020. https://www.iea.org/commentaries/the-carbon-footprint-of-streaming-video-fact-checking-the-headlines
- Counted: devices (72%), networks (23%), data centres (5%). Excludes set-top boxes and consoles. "highly sensitive to the choice of viewing device, type of network connection and resolution." Phone on WiFi, standard definition: 0.037 kWh.

**C3. LED bulb for an hour: roughly 9 Wh (9 W bulb).** PARTLY.
- Energy Star (VERIFIED) says a 60 W incandescent corresponds to "a minimum of 800 lumens" (https://www.energystar.gov/products/lighting_fans/light_bulbs/learn_about_brightness). The FTC figure of "about 9 watts" for 800 lumens came only from a search summary of https://www.consumer.ftc.gov/articles/0164-shopping-light-bulbs (page not fetched; direct fetch failed). Energy Trust gives 8 to 15 W (search summary). Treat 9 W as typical, not exact.

**C4. Boiling 1 litre of water from 20 to 100 degrees C.** My calculation, standard physics constants, no web source.
- 1 kg x 4.186 kJ per kg per kelvin x 80 K = 334.9 kJ. At 3,600 kJ per kWh, that is 0.093 kWh, about 93 Wh. A real kettle loses some heat, so use somewhat more (about 100 Wh, rule of thumb, unsourced).
- Scale (my arithmetic): 93 Wh is about 390 Google-median prompts (0.24 Wh) or about 270 at OpenAI's 0.34 Wh.

---

## D. Totals

**D1a. World, latest: IEA, "Key Questions on Energy and AI" (2026).** VERIFIED.
- Quote: "roughly doubling from 485 TWh in 2025 to 950 TWh in 2030", "around 3% of global electricity demand by that date." AI-focused data centres: "surging 50% in 2025."
- Source: IEA, https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary . Report page undated in the fetch; the related IEA news release (https://iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions) is dated 16 April 2026 and says demand "soared by 17% in 2025."
- Share of world electricity in 2025: about 1.5% (Our World in Data summary of IEA, PARTLY: https://ourworldindata.org/how-much-energy-do-data-centers-and-artificial-intelligence-use). Crypto mining excluded.

**D1b. World, previous IEA report: "Energy and AI" (2025).** VERIFIED. 2024: about 415 TWh, about 1.5% of global electricity. 2030 Base Case: about 945 TWh, "just under 3%". https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai . Page gave "IEA (2025)", no month. IEA says "There is substantial uncertainty both about data centre consumption today and in the future."

**D1c. Attributed to AI (world).** The IEA 2025 report: accelerated servers, "mainly driven by AI", are about 30%/year growth and almost half of the net increase to 2030 (VERIFIED). A split of the 485 TWh into about 155 TWh AI-focused and about 330 TWh non-AI comes from Our World in Data (PARTLY, secondary; not seen on the IEA page). That would be about 32% (my arithmetic).

**D2. United States: Lawrence Berkeley National Laboratory (LBNL), two reports, both read as PDFs.**
- 2025 Update (LBNL-2001758, June 2026, https://escholarship.org/uc/item/33m6w3x0), VERIFIED: "The updated estimate of data center electricity use in 2024 is 192 terawatt-hours (TWh), accounting for 4.7% of total U.S. electricity consumption." Reference Case 2030: 649 TWh, 11.8% of forecast US electricity. Sensitivity range 9.5% to 15.3%; compounded bounds 521 to 843 TWh. Excludes crypto mining. 2024 is the last historical year.
- AI share (US): in the Reference Case in 2030, "AI servers account for 84% of total server energy use and 55% of total data center energy use." For 2024, no AI-only share stated in what I extracted: NOT FOUND for 2024 in the update.
- 2024 Report to Congress (LBNL-2001637, Dec 2024, https://eta-publications.lbl.gov/publications/2024-lbnl-data-center-energy-usage-report), VERIFIED: 176 TWh in 2023, 4.4% of US electricity; 2028 range about 325 to 580 TWh, 6.7% to 12.0%. AI-accelerated servers grew "from less than 2 TWh in 2017 to more than 40 TWh in 2023" (about a quarter of 176, my arithmetic). The PDF copy I read was stamped "EMBARGOED REPORT"; the DOE release (https://www.energy.gov/articles/doe-releases-new-report-evaluating-increase-electricity-demand-data-centers, 20 Dec 2024) repeats the 4.4% and the 6.7 to 12% ranges (VERIFIED).
- Both are bottom-up models from equipment shipments, not metered totals.

---

## E. Scale of use

**E1. ChatGPT: 2.5 billion prompts per day, July 2025.** VERIFIED.
- Quote: "ChatGPT receives 2.5 billion prompts from global users every day."
- Source: TechCrunch, 21 Jul 2025, citing OpenAI to Axios. https://techcrunch.com/2025/07/21/chatgpt-users-send-2-5-billion-prompts-a-day/ (news report; OpenAI statement not read directly). About 330 million were from US users. Dec 2024: Altman said over 1 billion daily.
- Newer daily figure: NOT FOUND.

**E2. Users, Feb 2026.** VERIFIED. "ChatGPT has reached 900 million weekly active users, OpenAI announced Friday" (TechCrunch, 27 Feb 2026). https://techcrunch.com/2026/02/27/chatgpt-reaches-900m-weekly-active-users . Reports of 1 billion or more weekly users in mid-2026 are PARTLY (search summaries, inconsistent dates). Users are not prompts.

---

## F. Training text and copyright

**F1. What models were trained on, per their makers.**
- OpenAI, 30 Apr 2025 page, VERIFIED: "information that is publicly available on the internet", "information that we partner with third parties to access", and "information that our users, human trainers, and researchers provide or generate." https://openai.com/policies/how-chatgpt-and-our-foundation-models-are-developed/
- Anthropic, Privacy Center article dated 16 Mar 2026, VERIFIED: "Publicly available information via the Internet"; "Datasets that we obtain under commercial agreements with third party businesses"; data users or crowd workers provide; data users allow. https://privacy.claude.com/en/articles/7996885-how-do-you-use-personal-data-in-model-training
- Google, Meta, Mistral: NOT FOUND. Neither company publishes a list of books or sites for any of these.

**F2. Bartz v. Anthropic (US District Court, N.D. California).** Mixed ruling, then a settlement. Court order itself not read.
- 23 Jun 2025, Judge William Alsup: training on lawfully purchased books was fair use; downloading millions of books from pirate libraries was not. Reported by NPR (https://www.npr.org/2025/06/25/nx-s1-5445242, search summary only) and by The Next Web (VERIFIED, below).
- Settlement: US$1.5 billion, about half a million works, about US$3,000 per book. Final approval 20 Jul 2026 by Judge Araceli Martinez-Olguin. Quote: "The $1.5 billion settlement provides substantial benefits to the class in light of the novel claims asserted." Source: The Next Web, 21 Jul 2026, https://thenextweb.com/news/anthropic-1-5-billion-copyright-settlement-approved . VERIFIED for the page; news report.
- Status: final approval granted; payments can begin. Settlement sets no binding precedent. The release covers past conduct only (to 25 Aug 2025; search summary, PARTLY).

**F3. Thomson Reuters v. Ross Intelligence (US Court of Appeals, Third Circuit).** VERIFIED (news).
- Decided 29 Sep 2026: affirmed that copying Westlaw headnotes to train a competing legal search tool was not fair use. Quote: "In truth, this is no more than an ordinary copyright case." Source: Nieman Lab, 30 Sep 2026. https://www.niemanlab.org/2026/09/federal-appeals-court-upholds-thomson-reuters-landmark-ai-copyright-win/
- Scope: not a chatbot. Quote: "ROSS's AI platform cannot generate original expression." Described as the first federal appeals ruling rejecting fair use for AI training. Reportedly held under seal pending redactions (ipwatchdog, search summary, PARTLY).

**F4. New York Times et al. v. OpenAI and Microsoft (S.D.N.Y., Judge Stein, consolidated multi-district litigation).** PARTLY (search summaries; the Axios page returned 403).
- Most claims survived a motion to dismiss in 2025. Summary judgment on fair use has been briefed; the Justice Department backed the defendants in September 2026; amicus briefs followed in October. No ruling or trial date found as of late October 2026. Latest status after that: NOT FOUND.

**F5. Getty Images v. Stability AI (England and Wales).**
- High Court, 4 Nov 2025, Mrs Justice Joanna Smith, [2025] EWHC 2863 (Ch): date, judge and citation VERIFIED at https://www.judiciary.uk/judgments/getty-images-v-stability-ai/ . Outcome PARTLY (search summaries): Getty's secondary copyright claim failed because the model did not store infringing copies; Getty won only a narrow trade-mark point (watermarks); Getty had dropped its primary copyright claim.
- Appeal: Court of Appeal heard it in mid-November 2026; decision expected spring or summer 2027 (BCLP, 17 Nov 2026, VERIFIED: https://www.bclplaw.com/en-US/events-insights-news/key-ai-appeal-court-hearing-getty-v-stability-ai-flags-ai-model-training-and-use-conflicts-and-uk-v-eu-v-us-differences.html ). Image model, not a chatbot.

---

## G. Jobs (measured effects so far)

**G1. Finds an effect, concentrated on young workers: Stanford Digital Economy Lab (Brynjolfsson, Chandar, Chen), "Canaries in the Coal Mine?", version of 12 Aug 2026.** VERIFIED. https://digitaleconomy.stanford.edu/news/canariesaug26/
- Quote: employment for ages 22 to 25 in highly AI-exposed occupations "now stands about 19% below where it would be if it had kept pace" with less-exposed peers. Also: "We do not see widespread, economy-wide job displacement associated with AI."
- Measured: ADP payroll records, Nov 2022 through June 2026; mainly slower hiring, not more layoffs.
- Caveats (authors'): "These are descriptive patterns, not causal estimates of the effect of AI." The gap shrinks when education is controlled, and some trends predate generative AI.
- The headline number moved between versions: 15% at the July 2025 data (same page, VERIFIED); a 13% and a 16% figure from earlier versions (search summary, PARTLY).

**G2. Finds little or none: Humlum and Vestergaard, NBER Working Paper w33777, "Still Waters, Rapid Currents" (earlier title "Large Language Models, Small Labor Market Effects"), revised Mar 2026.** VERIFIED. https://www.nber.org/papers/w33777
- Quote: "precise null effects on earnings and recorded hours at both the worker and workplace levels." They rule out effects larger than 2% two years after ChatGPT's launch.
- Measured: Denmark, surveys of chatbot adoption linked to administrative records.
- Caveats: one country, first two years only; work shifted in tasks and occupational mix, not in pay or hours. Working paper (peer-review status not stated on page).

**G3. Finds little or none: Yale Budget Lab, ongoing updates.** PARTLY (search summaries; the pages returned no text). Updates in March and April 2026 said the data "continues to indicate no meaningful impact of AI on the labor market" and that occupational mix is changing faster than before but not by much. Measure: change in occupational mix using Current Population Survey data. The Lab says it will keep updating. https://budgetlab.yale.edu/research/evaluating-impact-ai-labor-market-current-state-affairs

---

## H. Public information and elections

**H1. Simon and Altay, Knight First Amendment Institute at Columbia, 7 Jul 2025, "Don't Panic (Yet)".** VERIFIED. https://knightcolumbia.org/research/dont-panic-yet-assessing-the-evidence-and-discourse-around-generative-ai-and-elections
- Examined: evidence from the 2023 to 2024 election cycle in broadly democratic countries. Finding: predicted outsized effects "did not happen" (as relayed). Caveats (authors'): much persuasion evidence is from paid-participant experiments; second-order harms such as crowding out news are not yet empirically tested; the authors say they were sceptical beforehand.

**H2. Alan Turing Institute, CETaS, 2024 reports on UK, European and US elections.** PARTLY (pages returned 403; search summaries only). Reported: the September 2024 report found AI did not change results in the UK and European elections and found 27 AI-enabled campaigns; the November 2024 report (13 Nov 2024) covered the US, with no conclusive evidence of changed results but moderate volumes of AI disinformation, including foreign-linked networks. https://cetas.turing.ac.uk/publications/ai-enabled-influence-operations-safeguarding-future-elections . Read the report before quoting.

**H3. Persuasion experiments: Nature and Science, 4 Dec 2025 (Rand and colleagues).** VERIFIED via Cornell news. https://www.news.cornell.edu/stories/2025/12/ai-chatbots-can-effectively-sway-voters-either-direction
- Quote: pro-Harris chatbot "moved likely Trump voters 3.9 points toward Harris" on a 100-point scale (US, about 2,300 people, 2024). In Canada (1,530) and Poland (2,118), about 10 points.
- Examined: survey participants who knew they were talking to an AI, not real campaigns. Chatbots advocating right-leaning candidates made more inaccurate claims in all three countries; more persuasive models were less accurate (UK study, about 77,000 people).

**H4. 2026 US midterms, AI-made political ads: Wesleyan Media Project.** VERIFIED (news).
- Early Sept count: 164 ads, at least US$80 million; "Almost 70% of the ads and 78% of the spending did not have a disclaimer." Quote from co-director Erika Franklin Fowler: "this is absolutely an undercount." Source: CT Mirror/WSHU, 8 Oct 2026. https://ctmirror.org/2026/10/08/wesleyan-project-report-ai-political-advertisements/ . Al Jazeera, 9 Oct 2026, reports Republican candidates and backers behind 80% of the ads.
- Examined: ads, not voter effects. Whether they changed any outcome: NOT FOUND. The election was 3 Nov 2026; I found no post-election assessment.

---

## Numbers that sources disagree on

- Energy per prompt: Google 0.24 Wh (median, Gemini, May 2025); OpenAI/Altman 0.34 Wh (average, no method); Microsoft Research 0.34 Wh (median, estimate); Epoch 0.3 Wh (Feb 2025), 0.6 Wh (Jul 2026, includes share of development); Jegham 0.42 Wh (short query); older about 3 Wh (de Vries 2023, via Epoch). Roughly 12 times apart from lowest to highest; the median/average and scope differences mean they are not like for like.
- Water per prompt: Google 0.26 mL (on-site only); OpenAI about 0.32 mL; Mistral 45 mL (400 tokens, life-cycle); Ren 500 mL per 10 to 50 responses, so 10 to 50 mL each (GPT-3, includes power-plant water; paper's table gives about 7.6 to 29 mL). Roughly 40 to 190 times between Google and Ren; different models and scope.
- World data-centre electricity 2025: IEA 485 TWh (crypto excluded) vs about 790 TWh from Energy Institute/S&P (includes crypto; via Our World in Data, PARTLY).
- IEA 2030 projection: 945 TWh (2025 report) vs 950 TWh (2026 report); base year moved from 2024 (415) to 2025 (485).
- US data-centre electricity: LBNL 2023 was 176 TWh (4.4%) in the 2024 report; the 2025 update revised earlier years "slightly below" and gives 192 TWh (4.7%) for 2024. 2028 projections: 325 to 580 TWh (2024 report) vs 464 TWh reference (2025 update). OWID's "5% of US electricity" is a rounding (PARTLY).
- Young-worker employment gap: 13%, 15%, 16%, 19% across Stanford versions.
- Wesleyan AI-ad totals: 164 ads and US$80M (Sept, VERIFIED) vs 220 ads and US$137M (late October, PARTLY via search summaries).

## Things I could not source

- Any per-prompt energy figure from Anthropic or Meta; Mistral's energy per response.
- Google, Meta, Mistral statements on training-data composition.
- The Alsup order itself; the Third Circuit opinion text; the High Court Getty judgment text (PDFs were unreadable or blocked). F2 to F5 rest on news and law-firm reports except where marked.
- Any status of NYT v. OpenAI after about late October 2026.
- A current (post-2009) Google search energy figure; Google's own 2009 post body.
- A page-verified LED wattage figure (9 W is from a search summary).
- IEA's own US figure for data centres (only LBNL and a secondary OWID line).
- CETaS reports read directly; Yale Budget Lab page text.
- A daily ChatGPT message count newer than July 2025.
- Any assessment of AI's role in the 3 Nov 2026 midterm results.
- Date of Altman's "Gentle Singularity" post from the page itself; exact IEA publication date of the 2025 and 2026 report pages.
