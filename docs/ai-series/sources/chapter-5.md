# Sources for chapter 5, "From a research paper to a chat window"

Checked on 2026-11-23 unless noted.

| Claim in the chapter | Status | Source |
|---|---|---|
| A language model works out what is likely to come next | chapter 3's subject | Chapter 3 is not written yet; this sentence must match it |
| The model is a file of numbers and using it does not change it | author's knowledge | True of how these models are run: answering does not update the numbers. No citation gathered. Add one before publishing. |
| Each message sends the whole conversation again, starting with instructions the user does not see | author's knowledge | How chat interfaces to these models work. No citation gathered. Add the provider's own documentation before publishing. |
| The example conversation | written for the page | The page says so. The arithmetic is checked: half of 2 cups is 1 cup; half of 3/4 cup is 3/8 cup, which is 6 tablespoons; 1.5 times the recipe is 3 cups of flour and 1 and 1/8 cups of sugar. |
| The word counts shown per turn | verified | Computed by `src/lib/ai-series/chat/chat-script.ts` and asserted in its test |
| John's course was files on his laptop | John to confirm | Claude's assumption |
| John used Claude, made by Anthropic | verified | This project |
| Business products: not used for training unless the customer allows it | verified, primary source | Anthropic Privacy Center, "Is my data used for model training?" (commercial), page dated August 18, 2026: "By default, we will not use your inputs or outputs from our commercial products" |
| Personal plans: you choose whether chats are used for training | verified, primary source | Anthropic Privacy Center, consumer training article, page dated March 16, 2026: "You choose to allow us to use your chats and coding sessions to improve Claude". The page also lists conversations flagged for safety review as used regardless; the chapter covers this under "exceptions" only for storage. See the note below. |
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
