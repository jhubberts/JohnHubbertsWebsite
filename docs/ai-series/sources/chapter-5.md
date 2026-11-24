# Sources for chapter 5, "Where the examples come from" (new 2026-11-23)

The file `chapter-5.md` before 2026-11-23 held the sources for "Inside a chat window", which is now
chapter 9; that content moved to `chapter-9.md`. Researched by an agent on 2026-11-23. VERIFIED means
the quoted words were read on the source; PARTLY means a mirror, syndicated copy or excerpt.

| Claim | Status | Basis |
|---|---|---|
| Training: examples with answers, measure how wrong, adjust numbers | verified | Google ML glossary, "training": "The process of determining the ideal parameters (weights and biases) comprising a model"; Crash Course: "The goal of training a model is to minimize the loss" |
| A label is the right answer attached to an example | verified | Google glossary, "label": "the 'answer' or 'result' portion of an example" |
| Edgar Anderson measured the irises; setosa and versicolor grew in one pasture on the Gaspé Peninsula, 1935 | verified | Fisher 1936 p.179: "measured by Dr E. Anderson"; Unwin and Kleinman 2021 (Significance) on the Gaspé, "all from the same pasture" |
| MNIST: half Census Bureau employees, half high-school students | verified (dataset card); partly (LeCun text via mirror) | Hugging Face card: "Half of the image were drawn by Census Bureau employees and the other half by high school students" |
| ImageNet: about 15 million photos, 22,000 kinds; almost 50,000 people in 167 countries via Mechanical Turk | partly | Fei-Fei Li, TED 2015, read on a transcript mirror; TED's own summary (verified) says 15 million photos |
| GPT-2 learned from about 8 million web pages with no labels | verified | Radford et al. 2019: "without any explicit supervision"; "slightly over 8 million documents" |
| A 2024 model practiced on more than 15 trillion pieces of words | verified | Meta, Llama 3: "pretrained on over 15T tokens" |
| Models get 10,000 to 100,000 times more language than a child | verified | Frank 2023, Trends in Cognitive Sciences: "four or five orders of magnitude more language data than human children" |
| 2022: about 40 people wrote examples and ranked answers; a small model trained this way was preferred to one 100 times its size | verified | Ouyang et al. 2022 (InstructGPT): "about 40 contractors"; "1.3B parameter InstructGPT model are preferred to outputs from the 175B GPT-3, despite having over 100x fewer parameters" |
| Meta: other models wrote "the vast majority" of one 2024 model's example answers | verified | Meta, Llama 3.1 |
| Postings: remote, hourly, contract or part-time; writing questions and answers, checking facts, rating and ranking; about $17 to over $100 an hour | verified | DataAnnotation (generalist up to $50, experts up to $125+); Handshake MOVE (up to $17 to up to $150, "part-time"); Outlier (write questions, answers, rubrics, rate and rank) |
| 2025: OpenAI paid more than 100 former investment bankers $150 an hour to build financial models, aimed at junior bankers' routine work | verified (Fortune's copy of Bloomberg) | "more than 100 ex-investment bankers"; "paid $150 per hour" |
| 2021–22: Kenyan workers earned about $1.32 to $2 an hour labeling violent and abusive text for ChatGPT | verified | TIME, Jan 18, 2023 |
| Is it like teaching: nobody checks understanding; far more examples; learns mistakes; may train a replacement | writer's reasoning, from the facts above | The NYT (2026, via syndicated copy) reports experts hired to annotate in their own fields; not quoted on the page |

Not used (unverified): ImageNet's 14,197,122; Google raters' pay; xAI "temporary, about six months";
Bloomberg's "$400 an hour"; any government count of AI-training workers.
