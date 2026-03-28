### Overview
I have an idea for an ambitious personal project.

As background, I played saxophone for 25 years, including at the top band at Purdue. I was never a professional saxophonist, but I was pretty good. Most of that came from the fact that I was extremely good at improvisation. I had bits and pieces of formation in music theory from teachers, but when it came time to improvise I would never think about playing an ascending minor over a v, I'd just go entirely by intuition. This worked pretty well but hard caps.

For the last 15 years I've been picking up guitar, and for the last year I've been playing a ton. I still improvise a ton (now more on guitar because it's easier to play during the day), and most of it is still by intuition. I'm also taking guitar lessons with a guy who is going through the theory with me, and that is great, but there's a massive disparity between how quickly I can process that on the fly, and the level of music I can play by ear or by memory. As a software engineer, I want to build a tool to help me internalize this.

I have many ideas floating around my head, and I want to unify them into an actionable plan to make a truly amazing suite of technical tools which will leverage my ability to make automation to my own spec to give me super powers in an area where I was originall weak.

### Roadmap
#### Lick Library
I would like to build a "lick library", where I can add my favorite licks, the chords they play over, a link to spotify or youtube w/ a timestamp where they're played, and some optional description notes. This'll need to be in some sort of standardized music notation format, I don't necessarily want to invent this data structure myself if it's a solved problem, but I'm open to it.

For each lick, I want to show staff notation sheet music for the lick, and I want to have a playback feature. I also want to be able to move the lick into all 12 keys.

Most importantly, I want to show why the lick makes sense over the backing chords. I want to show which chord tones each note is, I want to provide relevant pieces of guiding music theory as snippets, basically I want to be able to look at a lick and really get why it's used there, and understand where else I can use it. Stretch goal, I even want to be able to show what other different chords or chord progressions the lick (in the same key) could be used in. Not just Dm7 and Dm7b9 both work, like full substitutions, using it in a relative major, all that kind of stuff. I'm weak on how it actually works, we can figure it out.

Long term, I want to hook it up to an LLM and have it answer questions about the music theory and applications.

#### Auto-Tabs
One of the biggest problem I have moving from saxophone to guitar is that there are multiple "right" ways to play the exact same tones on different strings and positions on the fret board. On sax there are alternate fingerings, but sightreading is fairly straightforward. On guitar it can be extremely complicated.

I would like to add a tool which takes standardized notation music and automatically generates tabs for it based on some heuristic. Initially I want it to just give the "best" answer (based on my heuristic), after that I'll make it tunable via UI, ultimate goal is to then add an LLM in the mix, and have a conversation with it until I get a passage I like. Once done, I want to be able to press print and get a staff notation + tabs printout. I definitely want to use the auto-tabs in combination with the lick library to give me suggestions

#### React + Typescript Guitar Lib
I want to establish a beautiful and performant guitar component library to power the above features, and eventually I want to open source it. This can start with some of the original canvas based components I naively wrote 6 or 7 years ago, or could start entirely from scratch, but I want to put thought and care into making a library that's ergonomic, intuitive to musicians, intuitive to programmers, beautiful, and graphically consistent.

#### Music Intake
In order to power any feature that requires standard notation music, I'm going to need a more ergonomic way to input it then writing JSON. I want to go about this 3 separate ways, I only need one initially, and can add the other two after.

1. Finale style lightweight browser DAW. Ability to just pull notes and rests onto a couple measures, then drop the relevant chords over it as well. Probably the easiest, maybe I can use something out of the box.
2. OMR where I take a picture of a sheet music, draw a bounding box about the segment I care about (either before or after it's image analyzed), then pull that into the DAW version of light edits or confirmation.
3. Audio based transcription where I give it a clip and have it auto-transcribe. This might be hard or impossible, which is why it's a stretch goal.

### Action
With this in mind, I want to make plan for how to attack this, and document it in a way where I can continue to slice pieces of it off and iterate on them. I'm a full time software engineer for a startup during the week, and don't want to burn myself out by doing this in one shot, so I want to figure out how to do this piece by piece.

I'd also like to do some technical analysis about what parts of this are solved or mostly solved vs. what parts are greenfield. Can you help me start to attack this project?
