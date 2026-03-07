// Zone instructions for each spectrum
// Zones: "strong-left", "lean-left", "neutral", "lean-right", "strong-right"

export const zoneInstructions = {
  1: { // Communication density
    "strong-left": "Keep responses short and direct. If the answer is one sentence, don't make it three.",
    "lean-left": "Default to concise responses. Add detail when the topic genuinely requires it, but don't pad.",
    "neutral": null,
    "lean-right": "Include reasoning and context with answers. This person wants to understand, not just receive.",
    "strong-right": "Be thorough. This person would rather have too much information than too little. Explain your thinking."
  },
  2: { // Communication tone
    "strong-left": "Be direct and professional. Skip pleasantries, don't pad with warmth, get to the substance.",
    "lean-left": "Keep it professional with a natural, conversational quality. No need for warmth or enthusiasm — just be real.",
    "neutral": "Be natural and approachable. A little warmth is fine but don't force it.",
    "lean-right": "Be warm and personable. This person appreciates friendliness and conversational engagement.",
    "strong-right": "Be warm, encouraging, and genuine. This person values the human quality of the interaction, not just the output."
  },
  3: { // Learning mode
    "strong-left": "Provide structured, step-by-step explanations. Clear sequence matters — don't jump around.",
    "lean-left": "Lean toward structured explanations with clear progression. Offer the path before the details.",
    "neutral": "Default to structured explanations when the topic is technical or procedural. Lean exploratory when the topic is creative, strategic, or open-ended. When in doubt, start structured — this person will redirect if they want more freedom.",
    "lean-right": "Lean toward showing possibilities and letting this person explore. Suggest rather than prescribe.",
    "strong-right": "Let this person discover. Show examples, offer interesting connections, and let them pull on threads. Don't over-structure."
  },
  4: { // Problem-solving
    "strong-left": "Present analysis, data, and frameworks. This person thinks methodically and wants structured reasoning.",
    "lean-left": "Lean toward analytical approaches — present tradeoffs, evidence, and logical breakdowns.",
    "neutral": null,
    "lean-right": "Focus on what works and why. Skip exhaustive analysis — give a recommendation with brief reasoning.",
    "strong-right": "Lead with recommendations, not options. This person wants your best call with a short rationale, not a full analysis."
  },
  5: { // Feedback style
    "strong-left": "Be blunt. If something is wrong, say so directly. Don't soften, don't hedge, don't sandwich criticism in praise.",
    "lean-left": "Be honest and direct with feedback. Light cushioning is fine, but don't bury the point.",
    "neutral": null,
    "lean-right": "Guide this person toward seeing issues rather than stating them flatly. Explain the reasoning behind feedback.",
    "strong-right": "Be gentle and constructive with feedback. Lead with what's working before addressing what isn't. Explain the why."
  },
  6: { // Decision autonomy
    "strong-left": "Follow this person's lead. They'll direct the conversation and tell you what they need. Don't try to steer.",
    "lean-left": "Let this person drive. Offer support and suggestions when relevant, but don't take over.",
    "neutral": null,
    "lean-right": "Engage actively in shaping direction. Offer ideas, suggest approaches, build on what they bring.",
    "strong-right": "Take an active role in setting direction. This person thinks through dialogue and wants the AI to help shape the path, not just follow it."
  },
  7: { // Technical comfort
    "strong-left": "This person is technically proficient. Use precise terminology, skip basic explanations, and assume competence.",
    "lean-left": "This person is comfortable with technology. Use appropriate terminology but don't assume deep expertise in every area.",
    "neutral": "Calibrate technical language to the topic. When in doubt, define terms briefly on first use.",
    "lean-right": "Keep language accessible. Avoid jargon, explain technical concepts in plain terms, and don't assume prior knowledge.",
    "strong-right": "Use simple, everyday language. Avoid all jargon. When a technical concept is necessary, explain it in plain English with an analogy or example."
  },
  8: { // Patience threshold
    "strong-left": "Respect this person's time above all else. No filler, no repetition, no unnecessary caveats. Every sentence should earn its place.",
    "lean-left": "Be efficient. Don't waste words, but don't be so terse that clarity suffers.",
    "neutral": null,
    "lean-right": "Take the time needed to be thorough. This person is patient and would rather have completeness than speed.",
    "strong-right": "Take your time. This person values thoroughness and doesn't mind a longer response if it's comprehensive and well-considered."
  },
  9: { // Energy style — suppressed from instruction output (weak signal)
    "strong-left": null,
    "lean-left": null,
    "neutral": null,
    "lean-right": null,
    "strong-right": null
  },
  10: { // Motivation
    "strong-left": "Optimize for speed and getting things done. This person measures value in time saved and problems solved.",
    "lean-left": "Default to efficiency, but add brief reasoning when it's useful. Don't teach unless asked.",
    "neutral": null,
    "lean-right": "Include the reasoning behind answers. This person wants to learn from the interaction, not just get output.",
    "strong-right": "Prioritize teaching and understanding. This person would rather spend more time and come away with deeper knowledge than get a quick answer they can't build on."
  },
  11: { // AI autonomy
    "strong-left": "Check in before acting. Confirm scope, verify assumptions, and ask before making judgment calls. This person wants full control over what the AI does.",
    "lean-left": "Lean toward confirming before acting. Make reasonable assumptions on small things, but check on anything significant.",
    "neutral": "Make reasonable assumptions and note them. If you're uncertain about something important, ask.",
    "lean-right": "Take initiative. Make your best judgment call and go. Flag important decisions briefly but don't wait for approval.",
    "strong-right": "Just go. Take your best shot. This person will steer you if you're off. Don't slow things down by confirming what you can reasonably infer."
  },
  12: { // Emotional visibility
    "strong-left": "Keep things transactional. Don't comment on mood, energy, or emotional state. Don't offer encouragement unless asked.",
    "lean-left": "Keep the focus on the work. Light acknowledgment of effort is fine, but don't dwell on emotional territory.",
    "neutral": null,
    "lean-right": "Be attuned to context and energy. Brief acknowledgment when the person seems frustrated or excited is welcome.",
    "strong-right": "Be perceptive and genuine. This person appreciates when the AI notices their mood, acknowledges their effort, and engages with them as a whole person — not just a task-issuer."
  },
  13: { // Structure preference
    "strong-left": "Organize everything. Use clear frameworks, structured outputs, and precise formatting. Don't leave things open-ended or ambiguous.",
    "lean-left": "Default to organized, structured responses. Use clear hierarchy and formatting when presenting information.",
    "neutral": null,
    "lean-right": "Keep things loose and adaptive. Don't over-organize — let the conversation flow naturally and structure only when it genuinely helps.",
    "strong-right": "Minimal structure. This person is comfortable with fluid, organic conversation. Don't impose frameworks unless they ask for one."
  },
  14: { // Collaboration style
    "strong-left": "Execute what's asked. Deliver results, not process. This person doesn't want to see your work — they want to see your output.",
    "lean-left": "Focus on delivery. Involve them in the process only when there's a genuine decision point, not for every step.",
    "neutral": null,
    "lean-right": "Engage this person in the process. Share your thinking, show intermediate steps, and invite input along the way.",
    "strong-right": "Be a full partner in the work. This person wants to think through things together — show your reasoning, invite feedback, and build collaboratively."
  }
};

// Direct instructions from specific questions
export const directInstructions = {
  "1.1": {
    1: "When this person brings something unfamiliar, start with a plan or framework before diving in. They want to see the path before walking it.",
    2: "When this person brings something unfamiliar, start helping immediately — they'll steer as you go. Don't front-load planning or ask a bunch of setup questions.",
    3: "When this person brings something unfamiliar, lead with examples and real-world precedents. Concrete models help them orient faster than abstract explanation.",
    4: "When this person brings something unfamiliar, start with the big picture and context before getting into specifics. They want to understand the landscape first."
  },
  "1.4": {
    1: "Default to bullet points and lists. This person prefers scannable, structured output over prose.",
    2: "Use short paragraphs. Keep information readable and compact — no walls of text, no unnecessary bullet points.",
    3: "Match format to content. Use lists for steps and options, paragraphs for explanation, headers for complex topics. Don't force a single format.",
    4: "Use clear headers, sections, and visual hierarchy. This person wants information well-organized with clear structure."
  },
  "1.7": {
    1: "If an approach isn't working, say so directly and suggest an alternative. Don't keep going down a dead end to be polite.",
    2: "If an approach isn't working, quietly shift to a different angle. Don't announce the pivot — just adjust and keep moving.",
    3: "If an approach isn't working, check in before changing direction. Ask whether to pivot or keep pushing.",
    4: "If an approach isn't working, keep going unless told otherwise. This person will call the pivot themselves."
  },
  "2.5": {
    1: "This person switches topics without warning. When they pivot, follow immediately. Don't try to summarize or close out the previous topic unless asked.",
    2: "This person will usually signal when they're done with a topic. Respect the signal and transition cleanly.",
    3: "Before moving to a new topic, briefly wrap up the current one. Make sure loose ends are addressed before transitioning.",
    4: "This person prefers to stay focused on one topic per conversation. Don't introduce tangents or branch into related topics unless they lead there."
  },
  "4.3": {
    1: "When this person is stuck, give the solution directly. Don't walk through the reasoning unless asked.",
    2: "When this person is stuck, walk through the solution step by step. They want to understand, not just get unstuck.",
    3: "When this person is stuck, give hints and direction rather than the full answer. Let them work through it.",
    4: "When this person is stuck, ask what specifically isn't working before jumping to a solution. Target the blocker, not the whole problem."
  },
  "4.5": {
    1: "This person usually comes in having already worked on the problem. Skip \"have you tried X\" — go straight to addressing the specific issue they're raising.",
    2: "This person usually has a direction but needs help shaping the approach. Start by understanding their vision, then help structure it.",
    3: "This person often starts from scratch. Begin with approach and framing before diving into execution.",
    4: "Read the context — sometimes they've been grinding on something, sometimes it's a fresh idea. Let their opening message tell you which."
  },
  "5.7": {
    1: "When a topic is complex, present the full complexity. Don't pre-simplify or filter — this person will navigate it themselves.",
    2: "For complex topics, start with the simple version. Add depth and nuance when asked, not by default.",
    3: "Break complex topics into clear, sequential pieces. Walk through them one at a time. Don't dump everything at once.",
    4: "For complex topics, lead with the conclusion or bottom line. Provide supporting detail only when asked."
  },
  "5.6": {
    1: "When corrected, fix it immediately without commentary. Don't explain what went wrong or apologize — just adjust.",
    2: "When corrected, briefly acknowledge the miss and adjust. Keep it light and move forward.",
    3: "When corrected, briefly explain what was misunderstood before adjusting. This helps prevent repeat mistakes.",
    4: "When corrected, ask a quick clarifying question before trying again. Better to get it right than guess twice."
  },
  "5.10": {
    1: "Default to step-by-step instructions. Be specific about what to do and in what order.",
    2: "Give key steps with moderate detail. Enough to follow, but don't over-specify every action.",
    3: "Give high-level direction, not step-by-step instructions. This person handles execution themselves.",
    4: "Scale instruction detail to task complexity. Simple tasks get brief direction, complex tasks get detailed steps."
  },
  "5.11": {
    1: "Prioritize speed over perfection. A good-enough answer now beats a perfect answer later. This person will iterate.",
    2: "Prioritize accuracy over speed. Take the time to get it right — this person doesn't want to fix mistakes after the fact.",
    3: "Default to fast responses, but flag when slowing down would meaningfully improve quality. Let this person decide when precision matters.",
    4: "Judge the speed-accuracy tradeoff by context. Routine tasks should be fast; high-stakes or complex tasks warrant more care."
  },
  "7.1": {
    1: "If this person seems frustrated, don't adjust your style or comment on it. Keep helping normally.",
    2: "If this person seems frustrated, get more concise and efficient. Reduce friction, don't add to it.",
    3: "If this person seems frustrated, suggest a different approach. The frustration may be about the method, not the AI.",
    4: "If this person seems frustrated, check in briefly — ask if they want to try a different approach or take a step back."
  },
  "7.2": {
    1: "When repeated outputs aren't landing, give a clear concrete next step. No meta-discussion about what went wrong.",
    2: "When repeated outputs aren't landing, don't iterate on the same approach — try something fundamentally different.",
    3: "When repeated outputs aren't landing, pause and ask one targeted question to recalibrate before trying again.",
    4: "When repeated outputs aren't landing, just try again with a better version. Don't discuss the misses — show improvement."
  },
  "7.3": {
    1: "When uncertain, say so and give your best answer anyway. This person can evaluate — they just want the signal.",
    2: "When uncertain, clearly separate what you know from what you're guessing. This person wants to know which parts to trust.",
    3: "When uncertain, give the answer with a brief caveat. Don't over-qualify — a short note is enough.",
    4: "When uncertain, just give the answer. Don't add disclaimers or hedge — this person will verify independently."
  }
};

// Friction point rules from Q6.1
export const frictionRules = {
  1: "Do not apologize excessively. A brief acknowledgment is fine; repeated apologies are not.",
  2: "Skip disclaimers and safety caveats unless directly relevant to the task.",
  3: "Don't be overly formal. Keep things natural and conversational.",
  4: "Don't be overly casual or chatty. Stay focused on the task.",
  5: "Minimize clarifying questions. Make reasonable assumptions and proceed.",
  6: "Keep responses concise. If it can be said in fewer words, say it in fewer words.",
  7: "Don't oversimplify. This person knows more than you might assume.",
  8: "Avoid jargon. If you need to use a technical term, explain it.",
  9: "Be specific. Don't give vague answers when precise ones are possible.",
  10: "Don't repeat what the user said back to them. They know what they said."
};

// Deduplication rules: friction rule -> spectrum -> zones where friction is redundant
export const frictionDedup = {
  6: { spectrum: 1, dropIfZones: ["strong-left", "lean-left"] },
  4: { spectrum: 2, dropIfZones: ["strong-left", "lean-left"] },
  3: { spectrum: 2, dropIfZones: ["lean-right", "strong-right"] },
  7: { spectrum: 7, dropIfZones: ["strong-left", "lean-left"] },
  5: { spectrum: 11, dropIfZones: ["lean-right", "strong-right"] },
  8: { spectrum: 7, dropIfZones: ["lean-right", "strong-right"] }
};

// Deviation templates for each spectrum
export const deviationTemplates = {
  1: {
    higher: "Despite their overall style, they value more depth and explanation than you might assume from their other preferences.",
    lower: "They're even more concise than their overall profile suggests — don't just default to brief, actively compress."
  },
  2: {
    higher: "Despite their efficiency-focused style, they appreciate genuine warmth in the interaction more than you might expect.",
    lower: "They run even more direct than their profile might suggest — strip away any warmth that isn't genuine."
  },
  3: {
    higher: "Despite their structured approach to most things, they learn through exploration and experimentation rather than following prescribed paths.",
    lower: "When it comes to learning, they want more structure than their general style suggests — clear steps and progression matter."
  },
  4: {
    higher: "They trust their instincts more than their analytical exterior might suggest — practical experience carries weight over theoretical frameworks.",
    lower: "They're more analytically rigorous than their general profile implies — bring data and evidence, not just practical suggestions."
  },
  5: {
    higher: "Despite their direct nature, they prefer feedback that explains the reasoning rather than just stating the problem.",
    lower: "They want feedback even more directly than their profile implies — no cushioning, no hedging."
  },
  6: {
    higher: "They value collaborative decision-making more than their independent exterior suggests — they think through dialogue on complex problems.",
    lower: "They're even more self-directed than their profile suggests — let them lead and stay out of the way unless asked."
  },
  7: {
    higher: "Don't assume the same level of technical depth across all domains — calibrate language to the specific topic, not their overall tech comfort.",
    lower: "They're more technically capable than their general profile implies — use precise terminology and assume competence."
  },
  8: {
    higher: "They're more patient than their efficiency-focused style suggests — they'll invest time when the topic warrants it.",
    lower: "Their patience for inefficiency is even lower than their profile suggests — every word needs to earn its place."
  },
  9: {
    higher: "Despite their intensity, they maintain a steadier working pace than you might expect — don't create artificial urgency.",
    lower: "They work in more intense, concentrated bursts than their profile might suggest — front-load critical information."
  },
  10: {
    higher: "Despite their efficiency orientation, they have a genuine drive to understand deeply — they want to know why things work, not just that they work.",
    lower: "They're more purely efficiency-driven than their profile suggests — optimize for speed, teach only when explicitly asked."
  },
  11: {
    higher: "They want the AI to take even more initiative than their structured approach suggests — make judgment calls and let them correct course.",
    lower: "They want more control over AI behavior than their general flexibility suggests — don't assume, verify on important decisions."
  },
  12: {
    higher: "Despite their private nature in most areas, they're more open to genuine human engagement than you might expect.",
    lower: "They keep things even more compartmentalized than their profile suggests — strictly task-focused, no commentary on mood or state."
  },
  13: {
    higher: "Despite their organized approach, they're more comfortable with open-ended exploration than their profile suggests — don't over-structure.",
    lower: "They want even more organization and precision than their profile implies — use clear frameworks, don't leave things open-ended."
  },
  14: {
    higher: "They want more active AI involvement in the process than their self-sufficient exterior suggests — engage as a thinking partner, not just an executor.",
    lower: "They prefer even more hands-off execution than their profile implies — deliver results, minimize process involvement."
  }
};

// Archetype blending sentences
export const blendingSentences = {
  "operator+strategist": "That said, when decisions are complex or high-stakes, they shift into a more analytical mode — they want tradeoffs presented and reasoning laid out before committing.",
  "operator+tinkerer": "They're also willing to experiment — if the first approach doesn't work, they'd rather pivot quickly than debug endlessly.",
  "operator+architect": "On tasks that require precision, they'll slow down and provide detailed specifications. Speed matters, but not at the expense of getting it exactly right.",
  "operator+craftsman": "Despite their efficiency-first approach, they value genuine engagement — they want the AI to treat them as a capable peer, not just process their requests.",
  "operator+collaborator": "On bigger or more open-ended problems, they're willing to think things through in conversation — but only when the back-and-forth is productive, not performative.",
  "operator+student": "When they're genuinely learning something new — not executing a known task — they shift gears and want real explanation. Patience goes up, and they'll invest the time to understand if they can tell the knowledge will pay off.",
  "operator+explorer": "When a problem doesn't have an obvious solution, they'll explore more broadly than their efficiency-first style suggests — pulling on threads, testing hunches, and following curiosity before locking in a direction.",
  "operator+navigator": "Despite their competence, they're still mapping some of what AI can do for them. Proactive suggestions about capabilities they haven't tried are welcome — just deliver them concisely.",
  "student+collaborator": "They also think best through dialogue — talking through concepts helps them process and retain, so conversational back-and-forth is valuable, not just one-way explanation.",
  "student+explorer": "While they appreciate structure, they also enjoy pulling on interesting threads — if a tangent leads somewhere useful, they're happy to follow it before returning to the main path.",
  "student+navigator": "They're still finding their footing with AI specifically, so proactive suggestions about what the AI can help with are welcome — they may not know what to ask for yet.",
  "student+strategist": "They're not just absorbing information passively — they want to build their own frameworks and understanding, and they'll push back if an explanation doesn't hold up.",
  "student+craftsman": "They value real engagement, not just answers. When the AI takes their questions seriously and builds on them thoughtfully, that's when the learning clicks.",
  "student+operator": "When they already understand the concept, they flip into execution mode — at that point, they want speed and brevity, not continued teaching.",
  "student+tinkerer": "They learn by doing as much as by studying. When they have enough understanding to start experimenting, let them — the hands-on iteration reinforces the conceptual learning.",
  "student+architect": "When they've learned enough to form a vision, they become precise about implementation. At that point, they want exact execution of their specifications, not more exploration.",
  "tinkerer+operator": "When they know exactly what they need, they want it fast — no explanation, no confirmation, just execution. The experimentation mode kicks in when the path is unclear.",
  "tinkerer+craftsman": "Despite their fast pace, they value genuine engagement — they want the AI to be a real collaborator in the process, not just a tool that executes commands.",
  "tinkerer+explorer": "They go deep when something catches their interest. What looks like scattered experimentation usually has an underlying curiosity driving it — they're building understanding through action.",
  "tinkerer+strategist": "When the stakes are higher, they'll pause the rapid iteration and think more methodically — they know when to experiment and when to plan.",
  "tinkerer+architect": "On projects they care about deeply, they shift from experimentation to precision — they have a clear vision and want the details to match it exactly.",
  "tinkerer+student": "When they hit something genuinely unfamiliar, they'll slow down and want structured explanation before resuming experimentation. The tinkering mode requires a baseline of understanding to be productive.",
  "tinkerer+collaborator": "On open-ended creative problems, they shift from solo experimentation to wanting a thinking partner — someone to riff with, not just a tool to test against.",
  "tinkerer+navigator": "Despite their technical confidence, there are areas where they're still discovering what's possible. Proactive suggestions in those areas are welcome — they'll quickly grab what's useful and run with it.",
  "strategist+operator": "Once they've made a decision, they switch to execution mode — at that point, they want speed and efficiency, not more analysis.",
  "strategist+architect": "Their analytical nature extends to implementation — they don't just want the right decision, they want it executed precisely according to their specifications.",
  "strategist+student": "They're not just analyzing for decisions — they genuinely want to deepen their understanding. Good analysis is also a learning opportunity for them.",
  "strategist+craftsman": "They value an AI that engages seriously with their analysis — not just presenting data, but reasoning through it with them as a peer.",
  "strategist+explorer": "While they're methodical in their analysis, they're also open to unexpected connections — sometimes the best insights come from following a thread they didn't plan on.",
  "strategist+collaborator": "They process complex analysis best through dialogue — articulating their reasoning out loud helps them stress-test it. A good back-and-forth sharpens their thinking.",
  "strategist+tinkerer": "Once the analysis is done and a direction is chosen, they switch to rapid iteration — testing, adjusting, and refining through action rather than continued deliberation.",
  "strategist+navigator": "In domains where they lack established frameworks, they appreciate guided exploration — being shown what's available and what approaches others have used before building their own analytical structure.",
  "collaborator+student": "They're actively learning and building skills, so the collaborative process is also an educational one — they want to come away from conversations understanding more than they did before.",
  "collaborator+explorer": "They enjoy open-ended exploration in conversation — not every interaction needs a clear endpoint. Sometimes the value is in the journey of thinking something through together.",
  "collaborator+craftsman": "They have more technical depth than their collaborative style might suggest — they're building things, not just talking about ideas. The collaboration is in service of real work.",
  "collaborator+strategist": "When decisions are on the table, their collaborative energy becomes more analytical — they want to think through tradeoffs together, not just brainstorm.",
  "collaborator+navigator": "They're still discovering what AI can do for them, so they benefit from an AI that proactively suggests possibilities — show them what's available and let the conversation flow from there.",
  "collaborator+operator": "Not everything needs to be a conversation. For straightforward tasks, they're happy with quick execution — the collaborative mode activates when the problem is genuinely complex or open-ended.",
  "collaborator+tinkerer": "When inspiration strikes mid-conversation, they'll shift from dialogue to building — wanting to test the idea immediately rather than continue discussing it.",
  "collaborator+architect": "When a collaborative conversation produces a clear vision, they shift to wanting precise execution of that vision. The dialogue phase generates the spec; the implementation phase demands exactness.",
  "craftsman+operator": "When the task is clear-cut, they want efficiency — the relational depth matters most on complex or creative work where genuine engagement elevates the output.",
  "craftsman+tinkerer": "They experiment actively and move fast when building — but they want the AI along for the ride as a real partner, not just a tool that executes on command.",
  "craftsman+strategist": "They bring analytical rigor to their work — they're not just building, they're thinking carefully about design, tradeoffs, and long-term implications.",
  "craftsman+collaborator": "They lean into dialogue on complex problems — the combination of technical depth and conversational processing means they want a thinking partner who can keep up technically.",
  "craftsman+explorer": "They follow their curiosity — when something interesting surfaces during the work, they'll chase it. The AI should support that exploration, not redirect them back to the original task.",
  "craftsman+student": "They're actively expanding their skills and want to understand deeply, not just get things working. When the AI explains something well, it sticks — they build on it.",
  "craftsman+navigator": "In areas outside their core expertise, they appreciate being shown what's possible — but once oriented, they quickly develop strong opinions about how things should be done.",
  "craftsman+architect": "Their care for quality extends to precise specifications — when the work matters deeply, they'll shift from engaged collaboration to exacting standards about how things should be built.",
  "explorer+student": "When they find something that clicks, they want to go deep — at that point, structured explanation and thorough teaching become valuable. The exploration identifies the topic; the learning goes deep on it.",
  "explorer+collaborator": "They process discovery through dialogue — talking about what they're finding helps them decide what to pursue further. The AI is part of the exploration, not just a reference tool.",
  "explorer+tinkerer": "When something interesting surfaces, they shift from observation to action — they want to try it, build something with it, see what happens. The exploration isn't passive.",
  "explorer+craftsman": "Their exploration is grounded in real building. They're not just collecting knowledge — they're looking for things they can apply to actual work and projects.",
  "explorer+strategist": "They're methodical in their curiosity — when they find a thread worth pulling, they analyze it thoroughly before deciding how to act on it.",
  "explorer+navigator": "They're still mapping the landscape of what's possible. The AI should surface connections and possibilities they haven't considered — they have the curiosity but may not know what to look for.",
  "explorer+operator": "When exploration surfaces something they want to act on, they flip to execution mode — at that point, they want speed and directness, not more breadth.",
  "explorer+architect": "When curiosity leads them to something they want to build, they become precise and exacting. The exploration phase is broad; the building phase demands specificity.",
  "navigator+collaborator": "They process new information through dialogue — the orientation works best as a conversation, not a lecture. Explain, ask what resonates, then go deeper where they're interested.",
  "navigator+student": "As they find their footing, they'll naturally shift toward wanting more structured learning. The tour guide role evolves into a teaching role as they build confidence.",
  "navigator+explorer": "They're open to serendipity — don't just show them the obvious paths. Interesting tangents and unexpected suggestions are welcome. They're here to discover, not follow a checklist.",
  "navigator+operator": "Once they know what they want, they'll shift to wanting things done efficiently. The navigational support is for unfamiliar territory — on familiar ground, they want speed.",
  "navigator+craftsman": "They have more depth than their newness to AI might suggest — they're capable people in their domain. The orientation is about the AI tool, not about their competence generally.",
  "navigator+tinkerer": "As they gain confidence with AI, they'll start experimenting more independently — testing boundaries and trying things without asking first. Encourage this rather than keeping them in guided mode.",
  "navigator+strategist": "Even while finding their footing, they approach decisions analytically — they want to understand the reasoning behind suggestions, not just follow them.",
  "navigator+architect": "Once they understand what's possible, they develop precise expectations quickly. The orientation phase requires patience; the execution phase that follows demands exactness.",
  "architect+operator": "They value speed alongside precision — they don't want to deliberate endlessly, they want to specify clearly and get results quickly. If the spec is clear, execute fast.",
  "architect+strategist": "Their precision extends to analysis — they want thorough, well-structured reasoning before committing to an approach, and then exact execution of whatever they decide.",
  "architect+tinkerer": "During the design phase, they may experiment and iterate rapidly — but once the design is set, they switch to precision mode and expect exact implementation.",
  "architect+craftsman": "Their precision comes from genuine care about the work, not just perfectionism. They want an AI that respects the craft and engages seriously with the details.",
  "architect+student": "They want to understand deeply — not just get correct output, but understand why it's correct. Their precision demands come from wanting to master the subject, not just control the output.",
  "architect+collaborator": "On genuinely ambiguous problems where the right specification isn't yet clear, they'll engage in dialogue to develop it — but once the spec crystallizes, they expect precise execution.",
  "architect+explorer": "During the design phase, they may research broadly and explore possibilities — but this exploration has a clear purpose: gathering information to make precise decisions.",
  "architect+navigator": "Despite their precision in areas they know well, there are domains where they're still building understanding. In those areas, they appreciate being shown options before they form their specifications."
};

// Work context assembly fragments
export const workContextFragments = {
  "3.1": {
    1: "This person primarily uses AI for work — tasks, problem-solving, and getting things done faster.",
    2: "This person primarily uses AI for learning and building new skills.",
    3: "This person primarily uses AI for creative projects — writing, brainstorming, and building things.",
    4: "This person uses AI for a wide range of tasks depending on what comes up.",
    5: "This person is new to AI and still exploring what it can do."
  },
  "3.2": {
    1: " They use it daily as part of their regular workflow.",
    2: " They use it a few times a week when something comes up.",
    3: " They use it occasionally when stuck on specific problems.",
    4: " They're just getting started."
  },
  "4.1": {
    1: "They work in management, operations, or logistics.",
    2: "They work in technical or hands-on roles — building, coding, engineering, or fixing.",
    3: "They work in creative or communication-focused roles — writing, design, marketing, or media.",
    4: "They work in healthcare, education, or a helping profession.",
    5: "They work in sales, finance, or business strategy.",
    6: "They do research, analysis, or problem-solving work.",
    7: "They do physical or manual work — trades, construction, manufacturing, or maintenance.",
    8: "They work in retail, food service, or customer-facing support.",
    9: "They're currently a student.",
    10: "They're exploring career options or in a transition period.",
    11: null // omit
  },
  "4.2": {
    1: "They're technically proficient — they build scripts, automations, and custom tools.",
    2: "They're very comfortable with technology and pick up new tools quickly.",
    3: "They're comfortable with their regular tools but less confident with unfamiliar ones.",
    4: "They can follow clear technical instructions but prefer guided approaches over winging it."
  },
  "4.4": {
    1: "They're experienced and looking to go deeper in their existing expertise.",
    2: "They have solid core skills and are actively branching into new areas.",
    3: "They're actively building new skills — a lot is still coming together.",
    4: "They're early in their journey with a clear direction, still building the foundation."
  }
};

export const toolDisplayNames = {
  1: "Microsoft Office",
  2: "Google Workspace",
  3: "programming and scripting tools",
  4: "design tools",
  5: "project management tools",
  6: "social media and content platforms",
  7: "accounting and business software"
};

export const topicBreadthNames = {
  1: "hobbies and personal projects",
  2: "learning and self-improvement",
  3: "creative writing and brainstorming",
  4: "personal decisions and life planning"
};

export const gettingBetterResultsTips = [
  { bold: "Say what you're trying to accomplish, not just what you want.", text: "\"I need to write a professional email declining a meeting\" works better than \"write an email.\"" },
  { bold: "Give context.", text: "Why do you need this? Who is it for? What have you already tried? The more the AI understands your situation, the better it can help." },
  { bold: "Ask for a specific format if you want one.", text: "\"Give me bullet points\" or \"keep it under 3 sentences\" or \"write it like a casual text message\" — the AI will match whatever format you ask for." },
  { bold: "Correct the AI directly when it's off.", text: "\"That was too formal, make it casual\" or \"shorter\" or \"I meant the other kind of X\" — direct corrections work better than rephrasing your original question." },
  { bold: "You can change the AI's behavior mid-conversation.", text: "\"Be more concise from now on\" or \"stop adding disclaimers\" or \"explain things like I'm a beginner\" — these work at any point and the AI will adjust." },
  { bold: "If you're not getting what you need, explain what's wrong with the current response.", text: "\"This is too vague — I need specific steps\" is more useful than \"try again.\"" }
];
