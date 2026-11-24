# Author guide for "How AI Works"

Rules for every chapter of the series. They come from two places: the Field Guide that John wrote for
operator.roboto.ai (its README, "How to write a page" and "Getting it right"), and what the blind
readers asked for in every round of testing on 2026-11-23. A copy-editor or a writer applies all of
them; where a rule and a chapter disagree, the rule wins unless John said otherwise.

## Who reads it

One reader: a curious woman in her early 70s with no computing background and a science
background, who reads on a phone, does not read long text, and learns by seeing and
trying. A second reader matters too: the same person, tired, in the evening, reading the first
sentence of each paragraph and letting her eyes slide over the rest. Every chapter must work for
both.

## Shape of a chapter

- One question, in bold, near the top; the chapter answers it in a closing bold "So ...?" paragraph.
- Something to try or watch on the first phone screen, or the first thing after a short opening.
- Under about 700 words of prose and about 7 phone screens. Split a chapter rather than pass that.
- Headings are plain statements or questions, not puns.
- A chapter can stand alone: name a company, a model or a person in words the first time it
  appears in that chapter ("Hugging Face, a company whose website stores AI models"), even if an
  earlier chapter did.

## Sentences and paragraphs

- Say what the thing is in the first two sentences, in words she already knows.
- The first sentence of every paragraph carries its point. "That raises a puzzle." and "My mom asked
  me this too." carry nothing; put the point there instead.
- Explain by mechanism and example, with real numbers and units. "The network has 25,818 numbers"
  teaches more than "the network is large".
- Plain, literal words. No metaphors where a literal phrase exists, no drama, no praise of the
  technology, no "not X, but Y", no rhetorical questions except the chapter's own question.
- One comparison per idea, and keep it. If chapter 11's harness is a pharmacist, it does not become
  a lock later without saying so.
- Comparisons from science and everyday life are welcome. Check them: a reader who knows the
  field will notice a loose one.
- Short paragraphs. Bullets for parallel items. A table when items share the same fields.
- Present tense for how things work; past tense for what happened. American English.

## Terms

- Define a term the first time it appears in the chapter, or link it to the glossary with
  `<Term id="...">`. Link the first use in a chapter, not every use.
- Never use a term the series has not defined. Words that caught readers: run, code, program,
  chip, file, model, parameter, token, agent, harness, safeguard, inference, training, label.
- Banned on the page: token, logit, embedding, vector, tensor, softmax, temperature, parameter
  (say "number"), layer and head (except where the chapter defines them), sampling, probability
  (say "in 100").

## Honesty

- Check every fact against a primary source: the paper, the company's own page, the standard, the
  regulator. Wikipedia is a way to find sources, not a source for a specific figure.
- If sources disagree, or a number varies widely, say so on the page.
- Label the author's opinion as his ("This part is my own reasoning").
- A figure that cuts against the author's own claim is answered, not left standing.
- A picked example says it was picked, and how typical it is.
- A company's own figure says it is the company's own figure.
- An AI made by a company writing about that company says so.

## Pointing

- Never point at something the reader may not have opened or reached: "the last row", "if you
  pressed", "the picture above" when it is inside a collapsed section.
- Refer back by name and chapter: "the counselor in chapter 9", not "as we saw".

## Citations

- Cite every specific number, date, named fact, quotation, and claim about what a company's rules
  say, with a footnote after the sentence: `...in 2019.[^gpt2]` and at the end
  `[^gpt2]: OpenAI, [GPT-2 model card](https://...), 2019.`
- Name footnotes for what they are (`[^nobel-2024]`), not by number; the page numbers them.
- A general explanation needs one source for the section, not one a sentence.
- A source is a page someone opened and read that states the claim. Record it, with the quotation,
  in `docs/ai-series/sources/chapter-N.md`.
- A figure the page worked out itself says so, and cites its inputs.

## John's own voice

John adds his own opinions in `<JohnsThoughts>` boxes between paragraphs. Never write inside one,
and never put words in his mouth elsewhere without his say-so; where the prose must speak for him
(the "I" of the series), keep to what he has written or said and flag anything new to him.

## Privacy

Nothing that identifies John's mother: no school, employer, town, exact age, or the people around
her. "Somebody I know", not a named relation. The repository is public.
