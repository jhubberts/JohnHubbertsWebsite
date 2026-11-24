# Plan: design refresh of the site and the blog

Plan version: **v1, 2026-11-23**. Written for the agents that implement it. John reads the short
page built from this file, not this file. Nothing here is decided by John yet except where a line
says so.

This repository is public. Nothing in this file, in any file changed under this plan, or in a commit
message may identify John's mother (see `docs/ai-series/PLAN.md`, "Privacy rules").

## 1. What John asked for (2026-11-23)

New readers will be sent to the site by a link to the series "I Used AI to Teach My 70-Something Mom
How AI Works, From Scratch". The site, and the blog most of all, should look and behave polished:
look, feel and interactivity. Another session is changing the text and interactives of the lessons on
branch `ai-series-pilot`. John's words: "I have another session working on the actual content of the
lessons and those may change, so I don't want to mess with that much, but everything else on the
website is fair game."

## 2. Boundaries

John, 2026-11-23, after seeing the proposal: "the formatting around the MDX files or the components
inside the MDX files are absolutely yours to spruce up if you're so inclined". So the look of the
lesson components may change. Their wording, data and behaviour belong to the session working on
branch `ai-series-pilot`, which edits the same files.

**Do not edit:**

- The text of `src/content/blog/*.mdx`.
- `src/lib/ai-series/**` (data and logic) and `docs/ai-series/**`.

**Edit only for looks, and last** (after the shared pieces are in, and after rebasing on what the
content session has landed): `src/components/blog/how-ai-works/**`. Class names and layout only; no
wording, data or logic.

**May edit:** everything else, including `src/index.css` (typefaces, sizes), the page shell
(`src/App.tsx`, `src/components/layout/**`), `src/pages/**`, `src/components/blog/series-nav.tsx`,
`src/components/ai-series/try-it.tsx` (the frame every interactive sits in), `src/lib/series.ts`
(one added field only, see 5.3), `index.html`, `vite.config.ts`, build scripts.

## 3. Facts about the site today

Every line is labelled. "Verified" means the coordinator observed it on 2026-11-23, at commit
`631cd61`, in the dev server or with the command shown. "Inferred" means it follows from the code
and was not observed.

### Link previews and status codes

- Verified: `curl -s -o /dev/null -D - https://www.johnhubberts.com/blog/dijkstras-guitar` answers
  `301` with `location: /blog/dijkstras-guitar/`; following it answers **`404`**, with the home
  page's HTML as the body. Same for `/series/how-ai-works`. `/` answers `200`. A phone browser's
  user agent gets the same `404`. The browser still shows the page, because the 404 body is the app.
- Verified: that body's tags are `<title>John Hubberts</title>` and
  `<meta name="description" content="John Hubberts' Personal Website" />`. It has no `og:` or
  `twitter:` tags and no image (`index.html:1-17`).
- Verified: the page title is set only after the app runs (`src/lib/use-document-title.ts`).
- Not checked: what Messages, Slack, LinkedIn or any other app shows for a link that answers 404.
- Inferred: a file at `dist/blog/<slug>/index.html` would be served with `200`, because the host
  already redirects `/blog/<slug>` to `/blog/<slug>/`. The hosting rules are in the AWS Amplify
  console, not in this repository (`amplify.yml` has none).

### Chapter page on a phone (375 by 812, chapter 2, "A network that reads handwriting")

- Verified: four things come before the title: the "Back to Blog" link, the series box, the "Draft"
  label and the date (`src/pages/blog-post.tsx:21-43`).
- Verified: the chapter's first words start 543px down the 812px screen. The first interactive
  starts at 811px.
- Verified: running text is 16px with 28px line height.
- Verified: the theme button and the menu button in the top bar are 32 by 32px
  (`src/components/ui/button.tsx:30`, size `icon` is `size-8`). The series rule is 44px.
- Verified: the link to the next chapter is 14px text inside the series box, 147 by 44px.
- Seen twice, cause not found: in the dark theme, right after the page loads, the theme and menu
  icons in the top bar are almost invisible. After scrolling they are visible.

### Chapter page on a desktop (1440 wide)

- Verified, on chapter 0: the text column is 864px wide and a line holds about 104 characters
  (`blog-post.tsx:20`, `max-w-4xl` with `prose max-w-none`).

### Moving between pages

- Verified, tried once at 1440 wide: at the end of chapter 0 (scroll position 1428px), tapping the
  next chapter's link opens chapter 1 still scrolled to 1428px, not at its top. Nothing in `src/` resets the scroll position
  on navigation (no match for `ScrollRestoration` or `scrollTo` in page or layout code).
- Verified: while a chapter's code loads, the page shows the series box, the word "Loading…", and
  the second series box directly under it, with the footer pulled up; then everything jumps when the
  chapter arrives (`blog-post.tsx:44`, `App.tsx:17-23`). In the dev server this lasted seconds; in a
  production build it is shorter and was not timed.
- Inferred: a reader whose device is set to dark sees the light theme for a moment on first load,
  because the `dark` class is added in a React effect after the app starts
  (`src/components/layout/theme-toggle.tsx:14-17`) and `index.html` has no script that sets it
  earlier.
- Verified: no code honours "reduce motion" (no match for `prefers-reduced-motion`, `motion-reduce`
  or `motion-safe` in `src/`). The home page has a typing effect and a bouncing arrow.

### Series

- Verified: nothing records which chapters a reader has read. The only things stored on the device
  are the theme (`theme`), the drafts switch (`site.showDrafts`) and the chapter 0 guesses
  (`how-ai-works.guesses.v1`).
- Verified: `docs/ai-series/PLAN.md` (chapter 0) says of the series page: "Also the hub: lists all
  chapters, marks which are read." The series page lists chapters and does not mark them
  (`src/pages/series-page.tsx`).
- Verified: chapter numbers are shown as plain numbers (`src/pages/series-page.tsx:27`,
  `src/components/blog/series-nav.tsx:59`).
- Verified: every interactive sits in a bordered card with a small grey uppercase "Try it" label
  (`src/components/ai-series/try-it.tsx:10-12`).
- Verified: the footer is one line, the copyright (`src/components/layout/footer.tsx`).
- Verified: all ten chapters have `draft: true`. In a production build a draft is hidden unless the
  device opened the site once with `?drafts=on` (`src/lib/drafts.ts`).

### Rest of the site

- Verified: the home page is a full-screen hero (photo, name, typing phrases, three icon buttons)
  and then a second full-screen section with three link cards. It does not mention the series
  (`src/pages/home-page.tsx`).
- Verified: the blog list is left-aligned in the page container while chapter pages are centred
  (`blog-index.tsx:52`, `blog-post.tsx:20`).
- Verified: one typeface, Geist, is used for everything; colours are the shadcn defaults tinted
  toward hue 270 (`src/index.css:9-76`).
- Verified: the production build's main script is 356 kB (114 kB compressed); each chapter is its own
  file of 3 to 34 kB; the largest data file a chapter loads is 229 kB (`next-words`).

Only chapters 0, 1 and 2 were opened. Chapters 3 to 9 were not looked at.

## 4. Design direction (proposed by Claude)

Two ideas, and the rest stays quiet.

**Chapter numbers are real handwritten digits.** The series has chapters 0 to 9, and the network in
chapter 2 reads the digits 0 to 9. Wherever a chapter number is shown (the series bar, the label
above a title, the series page, the next card, the preview picture) it is drawn from a real
28-by-28 handwritten digit out of the MNIST test collection, the same collection chapter 2's network
was tested on. `src/lib/ai-series/digits/fixture.json` already holds two such digits for each of 0
to 9 (`images[].label`, `images[].pixels`, 784 values each). The ten digits in a row are the
series' progress strip and its chapter picker.

**Words you read are in a serif typeface; things you operate keep the sans typeface.** The reader
can tell "read this" from "do this" without a label.

### 4.1 Colours

The palette does not change: white page and indigo accent (hue 270) in the light theme, deep
blue-black in the dark theme (`src/index.css:9-76`). So nothing inside a lesson interactive changes
colour. An earlier draft of this plan used a warm paper-coloured page; it was dropped because warm
cream with a serif face is the look most machine-made pages have now, and because it would have
recoloured every interactive.

### 4.2 Typefaces

- The running text of blog posts and page titles: **Source Serif 4** (variable, with optical size),
  from `@fontsource-variable/source-serif-4`.
- Navigation, labels, buttons and everything inside an interactive: **Geist**, as today.
- Scope the serif to the blog article's prose and to page titles. Anything inside `.not-prose`
  (which every `TryIt` frame is) stays in Geist.
- The proposal page lets John compare three choices for the running text on the same chapter:
  Source Serif 4, Atkinson Hyperlegible Next (a sans face designed by the Braille Institute for
  readers with low vision), and Geist as today. Build whichever he picks.

### 4.3 Text size and line length

- Phone: running text 18px with a line height of 1.65. Title 34px, weight 600, line height 1.1
  (weight 800, as today, if Geist is kept for titles). The top bar stays 56px tall.
- Desktop: running text 19px. The text column is at most 68 characters wide (`max-width: 68ch`).
  A `TryIt` frame may be wider than the text, up to 860px, centred on the same axis.

### 4.4 The handwritten digit component

New data file `src/lib/chapter-digits.json`: ten digits, one per label 0 to 9, copied by a script
from `fixture.json` (the first image of each label), each as 784 values rounded to two decimals. New
component `HandwrittenDigit` draws one as an inline SVG of squares filled with `currentColor` at the
pixel's value as opacity, so it follows the theme. It has an accessible name ("Chapter 2"); the
number is always also present as text nearby or in that name. Three states for the strip, told
apart by form as well as colour: read (solid tile with the digit cut out, plus a check mark
when the tile is 40px or larger), current (outlined tile), not yet read (digit only, no tile).

## 5. Changes, by part of the site

### 5.1 Link preview (highest value)

After `vite build`, a script writes one small HTML file per address that can be shared:
`dist/blog/<slug>/index.html` for every post, `dist/series/<slug>/index.html` for every series, and
`dist/blog/index.html`, `dist/projects/index.html`, `dist/about/index.html`. Each is a copy of
`dist/index.html` with these tags filled in from the post's frontmatter or the series definition:
`<title>`, `meta description`, `og:title`, `og:description`, `og:type`, `og:url`, `og:image`,
`twitter:card` (`summary_large_image`), and `link rel="canonical"`.

The same script draws one preview picture per post and per series, 1200 by 630, PNG, into
`dist/og/<slug>.png`: the page background, the title in Source Serif 4, a line above it ("How AI
Works · Chapter 2" for a chapter, "John Hubberts" for anything else), `johnhubberts.com` at the
bottom, and for a chapter its handwritten digit (4.4) drawn large at the right. A
series' picture shows the ten digits in a row instead. Use `satori` with `@resvg/resvg-js` as dev dependencies so the picture does not depend on
fonts installed on the build machine.

Draft posts get a file and a picture too. Drafts are already public in the repository and in the
built files (`src/lib/drafts.ts` says so); this lets John test a preview before publishing.

Acceptance: in `dist/`, every post and series has its HTML file with the right tags and a picture of
the right size (a test reads the files). On a deployed copy, `curl -sIL` for a chapter address ends
in `200`, not `404`. The second check needs a deploy and John's go-ahead.

### 5.2 Top of a chapter page

Order on a phone, top to bottom:

1. The site's top bar, as today, with 44px buttons.
2. **Series bar**, 44px, stays at the top of the screen while reading: the series' short name and
   the strip of ten handwritten digits (4.4), each about 22px. At that size a digit is too small to
   be a tap target, so the whole bar is one button that opens the chapter list, where each row is
   at least 44px tall. Only on posts that belong to a series.
3. A small label: the handwritten digit, the words "Chapter 2", and "Draft" when the post is a
   draft.
4. The title.
5. The chapter's text.

The "Back to Blog" link is removed from series chapters (the series bar leads back) and stays, as
small text, on posts that are not in a series. The date moves to the end of the post.

Acceptance: at 375 by 812, the first words of chapter 2 start less than 300px down the screen
(today 543px).

### 5.3 Series short name

`src/lib/series.ts` gains one optional field, `shortTitle`, set to `'How AI Works'` for this series.
This is new wording and it lands in a file the content session may also edit; keep the change to
that one line and one interface field.

### 5.4 End of a chapter

1. When the end of the article scrolls into view, the chapter is recorded as read on this device
   (5.5) and a line appears: "✓ Chapter 2 finished. Remembered on this device."
2. **Next card**, full width, at least 88px tall: the label "Next · Chapter 3", the next chapter's
   title, and its one-line description from its frontmatter. The whole card is the link.
3. Under it, two small links: the previous chapter's title, and "All 10 chapters".
4. The date.

All titles and descriptions come from existing data. No new sentences about a chapter are written.

### 5.5 Remembering what was read

New module `src/lib/series-progress.ts`, tested, storing the set of read chapter numbers per series
in `localStorage` under `series-progress.v1`, with the same never-throw handling as
`src/lib/drafts.ts`. It never leaves the device.

### 5.6 Series page (`/series/how-ai-works`)

Title in the serif face; the existing description; the strip of ten handwritten digits; one button, "Start with
chapter 0" or "Continue with chapter N" (the lowest unread chapter); then the chapter rows as today,
each led by its handwritten digit in place of the plain number, with a "✓ Read" mark when read.
The mark is a glyph and a word, never colour alone.

### 5.7 The "Try it" frame (`src/components/ai-series/try-it.tsx`)

The label "Try it" becomes a filled chip in the soft accent colour with a pointing-hand icon. The
frame's background is the card colour. On a phone it
still reaches both edges of the screen. The component's props do not change.

### 5.8 Moving between pages

- A new page opens at its top. Back and forward restore the earlier position.
- The next chapter's code is requested when the Next card scrolls into view, so tapping it does not
  show "Loading…".
- While any page's code loads, a placeholder of the page's shape holds the height, so nothing jumps.
- Pages cross-fade using the browser's View Transitions where the browser has them (React Router's
  `viewTransition`). No cross-fade when the device asks for reduced motion.
- `index.html` gets a short inline script that sets the `dark` class before the first paint, and the
  `theme-color` tag follows the theme.
- The home page's typing effect and bouncing arrow stop when the device asks for reduced motion.

### 5.9 Home page

Keep the photo, the name, the typing phrases and the three icon buttons (John's). Make the hero as
tall as its content, not the whole screen. Directly under it: one featured card for the series
(title, description, "Start reading"), then the three existing link cards in one compact row. Remove
the second full-screen section.

### 5.10 Blog list, Projects, About, footer, not-found page

Same centred column and title style as chapter pages. In the blog list the series card shows the
strip of ten handwritten digits. The footer gains the GitHub, LinkedIn and email links that the home page already
has.

## 6. Work packages

Run in this order. Packages on the same line touch different files and may run at the same time.
Agents do not start dev servers, commit, push or switch branches. The coordinator checks each result
in a browser at 375px and 1440px, in both themes, before the next package starts.

1. **Link preview** (5.1). Opus. Files: `scripts/` (new), `package.json`, `index.html` head tags.
2. **Typefaces, text size, handwritten digit** (4.2 to 4.4). Sonnet. Files: `src/index.css`,
   `package.json`, `src/lib/chapter-digits.json` (new), `scripts/extract-chapter-digits.mjs` (new),
   `src/components/blog/handwritten-digit.tsx` (new). Then the coordinator opens all ten chapters
   in both themes and lists anything that now looks wrong.
3. **Chapter page** (5.2 to 5.5). Opus. Files: `src/pages/blog-post.tsx`,
   `src/components/blog/series-nav.tsx` (replaced by series bar and next card),
   `src/lib/series-progress.ts` (new, with tests), `src/lib/series.ts` (one field).
4. **"Try it" frame** (5.7), Sonnet, `src/components/ai-series/try-it.tsx`; and **series page and
   blog list** (5.6, 5.10 part), Sonnet, `src/pages/series-page.tsx`, `src/pages/blog-index.tsx`.
5. **Moving between pages** (5.8). Opus. Files: `src/App.tsx`, `index.html`,
   `src/components/layout/theme-toggle.tsx`, `src/components/typing-effect.tsx`.
6. **Home, Projects, About, footer, not-found** (5.9, 5.10). Sonnet. Files: `src/pages/home-page.tsx`,
   `projects-page.tsx`, `about-page.tsx`, `not-found.tsx`, `src/components/layout/footer.tsx`,
   `nav-bar.tsx`.
7. Before a pull request: rebase on `origin/master`, `npm run lint`, `npm test`, `npm run build`,
   then `/simplify` and `/code-edit`.

## 7. Not checked

- What each messaging or social app shows today for a chapter link (only the server's answer was
  checked).
- Whether the host serves `dist/blog/<slug>/index.html` with `200` (inferred).
- How the serif face and 18px text look across the ten chapters. No chapter has been rendered with
  them.
- Whether a 28-by-28 digit is readable at 22px, its size in the series bar, on a real phone. Not
  tried.
- Whether 18px serif text reads better than 16px sans for the series' intended reader on her own
  phone and tablet. Nobody has tried it.
- The dark-theme flash on first load (inferred from the code).
- Chapters 3 to 9 on a phone.
- Timing of the "Loading…" state in a production build.

## 8. Decided by John

- 2026-11-23: running text is **Source Serif 4** (his answer to the proposal page's typeface
  choice). This also settles that changing the shared typeface, text size and "Try it" frame is in
  bounds.
- 2026-11-23: the formatting around the lessons and the components inside them may be restyled
  (section 2).

- 2026-11-23: "I'm adding more chapters, so we'll shoot past 0-9". Nothing may assume ten chapters
  or one-digit chapter numbers. A chapter number of 10 or more is drawn from two handwritten digits
  (a repeated digit, as in 11, uses the second sample of that digit). The series bar shows the row
  of digits on a phone only while the series has at most ten chapters; past that it shows the open
  chapter and a count of read chapters, and the full row from 640px wide.

## 9. Open choices for John

1. A deploy to check the link preview, since deploying is a push to `master`.
