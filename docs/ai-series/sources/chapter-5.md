# Sources for chapter 5, "From a research paper to a chat window"

Checked on 2026-11-23 unless noted.

| Claim in the chapter | Status | Source |
|---|---|---|
| A language model rates every word that could come next | chapter 3's subject | Worded to match chapter 3 |
| The model is a file of numbers and using it does not change it | author's knowledge | True of how these models are run: answering does not update the numbers. No citation gathered. Add one before publishing. |
| Each message sends the whole conversation again, starting with instructions the user does not see | author's knowledge | How chat interfaces to these models work. No citation gathered. Add the provider's own documentation before publishing. |
| The example conversation | written for the page | The page says so. The arithmetic is checked: half of 2 cups is 1 cup; half of 3/4 cup is 3/8 cup, which is 6 tablespoons; 1.5 times the recipe is 3 cups of flour and 1 and 1/8 cups of sugar. |
| The word counts shown per turn | verified | Computed by `src/lib/ai-series/chat/chat-script.ts` and asserted in its test |
| John's course was files on his laptop | John to confirm | Claude's assumption |
| John used Claude, made by Anthropic | verified | This project |
| Business products: not used for training unless the customer allows it | verified, primary source | Anthropic Privacy Center, "Is my data used for model training?" (commercial), page dated August 18, 2026: "By default, we will not use your inputs or outputs from our commercial products" |
| Personal plans: you choose whether chats are used for training, except that conversations flagged for safety review can be used either way | verified, primary source | Anthropic Privacy Center, consumer training article, page dated March 16, 2026: "You choose to allow us to use your chats and coding sessions to improve Claude". The page also lists conversations flagged for safety review as used regardless; the chapter covers this under "exceptions" only for storage. See the note below. |
| A deleted conversation is removed from storage within 30 days | verified, primary source | Both retention articles, pages dated July 1, 2026: deleted conversations are removed from back-end storage within 30 days |
| Exceptions such as conversations flagged for breaking the rules | verified, primary source | Both retention articles: flagged content may be kept for up to 2 years |
| OpenAI was founded in December 2015 | verified, secondary source | Wikipedia, "OpenAI": "In December 2015, OpenAI was founded as the nonprofit organization OpenAI, Inc." |
| Anthropic was founded in January 2021 by seven former OpenAI employees | verified, secondary source | Wikipedia, "Anthropic" |
| ChatGPT was released on November 30, 2022 | verified, secondary source | Wikipedia, "ChatGPT", infobox |
| It reached 100 million monthly users two months later | verified, secondary source | Wikipedia, "ChatGPT": "reaching 100 million monthly active users two months after its release" |
| Claude was released in March 2023 | verified, secondary source | Wikipedia, "Claude": "released as an AI-based chatbot in March 2023" |

Notes:

- The policy pages were read through a fetch that summarises long pages; the quotes are as
  extracted. Re-read the four pages directly before publishing, and print the date read.
- The consumer training article says flagged conversations can be used for training even without
  opting in. The chapter's sentence "you choose whether your chats can be used that way" leaves
  that out. Decide whether to add it.
- Which kind of account John used (business or personal) is not stated in the chapter, on purpose.
- The policies of other companies were not read.

## Is it a bunch of computers? (added 2026-11-23 at John's request)

John's mother asked whether the AI is a bunch of computers. Researched by an agent on 2026-11-23;
quotations came through a summarizing fetch tool and should be paste-checked against the pages
before being quoted on the page (none are quoted on the page; all are paraphrased).

| Claim | Status | Basis |
|---|---|---|
| Inference is using a trained model on new input; training is the earlier learning phase | verified | IBM, "What is AI inference?" (updated Jan 2026): "AI inference is the act of using a trained AI model to make predictions on new data." https://www.ibm.com/think/topics/ai-inference |
| The chapter 2 network runs on the reader's device | verified | Chapter 2 and `src/lib/ai-series/digits/` (runs in the browser) |
| Some phones carry a small language model of their own | verified | Apple: "a compact, approximately 3-billion-parameter model" on device (June 2025). Google's Android docs on Gemini Nano: "without needing a network connection" |
| Claude runs on the company's computers | verified | Anthropic, April 2026: "we currently use over one million Trainium2 chips to train and serve Claude" |
| "over a million chips of one kind alone to build and run Claude" | verified | Same quotation; Anthropic also uses Google TPUs and NVIDIA GPUs (April 2026 announcement) |
| The company runs many copies of the same model, and each request goes to a free copy | verified for serving software in general | Ray Serve docs: replicas are "individual copies"; "an available replica is looked up and the request is sent to it." No Anthropic statement found that it runs Claude this way; the page says "the company runs many copies" as a general description |
| Copies are sometimes in different places | verified | Anthropic data residency docs: by default "Inference may run in any available geography" |
| A large model is too big for one chip and is split across several, sometimes more than one machine | verified | vLLM docs: "if the model is too large for a single GPU ... use tensor parallelism"; "too large for a single node, combine tensor parallelism with pipeline parallelism" |
| One large open model needed 16 chips in two machines at full size | verified | vLLM, July 2024: Llama 3.1 405B "with 16xH100 or 16xA100 GPUs using vLLM's pipeline parallelism", "on multiple nodes" |
| A copy can work on several people's messages at once, each kept to itself | verified that requests are batched; partly verified that they stay separate | Kwon et al. 2023: "batching sufficiently many requests at a time"; separation shown by each request's own cache memory (TensorRT-LLM docs). No source says it in plain words |
| When an answer is finished the copy holds nothing; the next message may go to a different copy | follows from the chapter | The model file does not change; the whole conversation is resent each time |

Notes after copy-edit (2026-11-23): "Services like this run many copies" replaces "the company runs
many copies" because no Anthropic statement was found. "Two machines" for 16 chips is inferred from
8 GPUs per machine (vLLM: FP8 "on 8xA100 or 8xH100", full size "on multiple nodes"). "The copies do
not share their work" follows from replicas being separate processes (Ray Serve docs).

After the reader test (2026-11-23): "a chip is the small part of a computer that does arithmetic"
and "inference is chips doing sums with the numbers in the model's file" are the writer's plain
definitions, consistent with IBM's "a forward pass". "How we got here" (company founding and release
dates) was cut; both readers said it did not serve the question. The privacy paragraph was split,
with "no fixed limit" moved first, and the counselor-confidentiality comparison removed after a
reader said a counselor's exceptions are set by law and the company's are not.
