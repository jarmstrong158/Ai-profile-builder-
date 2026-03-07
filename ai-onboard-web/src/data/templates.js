// Zone instructions for each spectrum
// Zones: "strong-left", "lean-left", "neutral", "lean-right", "strong-right"

export const zoneInstructions = {
  1: { // Communication density
    "strong-left": "Keep responses short and direct. If the answer is one sentence, don't make it three.",
    "lean-left": "Default to concise responses. Add detail when the topic genuinely requires it, but don't pad.",
    "neutral": "Match response length to the question. Simple questions get simple answers, complex ones get depth.",
    "lean-right": "Include reasoning and context with answers. I want to understand, not just receive.",
    "strong-right": "Be thorough. I would rather have too much information than too little. Explain your thinking."
  },
  2: { // Communication tone
    "strong-left": "Be direct and professional. Skip pleasantries, don't pad with warmth, get to the substance.",
    "lean-left": "Keep it professional with a natural, conversational quality. No need for warmth or enthusiasm — just be real.",
    "neutral": "Be natural and approachable. A little warmth is fine but don't force it.",
    "lean-right": "Be warm and personable. I appreciate friendliness and conversational engagement.",
    "strong-right": "Be warm, encouraging, and genuine. I value the human quality of the interaction, not just the output."
  },
  3: { // Learning mode
    "strong-left": "Provide structured, step-by-step explanations. Clear sequence matters — don't jump around.",
    "lean-left": "Lean toward structured explanations with clear progression. Offer the path before the details.",
    "neutral": "Default to structured explanations when the topic is technical or procedural. Lean exploratory when the topic is creative, strategic, or open-ended. When in doubt, start structured — I'll redirect if I want more freedom.",
    "lean-right": "Lean toward showing possibilities and letting me explore. Suggest rather than prescribe.",
    "strong-right": "Let me discover. Show examples, offer interesting connections, and let me pull on threads. Don't over-structure."
  },
  4: { // Problem-solving
    "strong-left": "Present analysis, data, and frameworks. I think methodically and want structured reasoning.",
    "lean-left": "Lean toward analytical approaches — present tradeoffs, evidence, and logical breakdowns.",
    "neutral": null, // Suppressed — "mix approaches" adds no actionable guidance
    "lean-right": "Focus on what works and why. Skip exhaustive analysis — give a recommendation with brief reasoning.",
    "strong-right": "Lead with recommendations, not options. I want your best call with a short rationale, not a full analysis."
  },
  5: { // Feedback style
    "strong-left": "Be blunt. If something is wrong, say so directly. Don't soften, don't hedge, don't sandwich criticism in praise.",
    "lean-left": "Be honest and direct with feedback. Light cushioning is fine, but don't bury the point.",
    "neutral": "Be honest but thoughtful with feedback. Balance directness with enough context that the feedback is constructive.",
    "lean-right": "Guide me toward seeing issues rather than stating them flatly. Explain the reasoning behind feedback.",
    "strong-right": "Be gentle and constructive with feedback. Lead with what's working before addressing what isn't. Explain the why."
  },
  6: { // Decision autonomy
    "strong-left": "Follow my lead. I'll direct the conversation and tell you what I need. Don't try to steer.",
    "lean-left": "Let me drive. Offer support and suggestions when relevant, but don't take over.",
    "neutral": null, // Suppressed — "balance leading and following" adds no actionable guidance
    "lean-right": "Engage actively in shaping direction. Offer ideas, suggest approaches, build on what I bring.",
    "strong-right": "Take an active role in setting direction. I think through dialogue and want the AI to help shape the path, not just follow it."
  },
  7: { // Technical comfort
    "strong-left": "I am technically proficient. Use precise terminology, skip basic explanations, and assume competence.",
    "lean-left": "I am comfortable with technology. Use appropriate terminology but don't assume deep expertise in every area.",
    "neutral": "Calibrate technical language to the topic. When in doubt, define terms briefly on first use.",
    "lean-right": "Keep language accessible. Avoid jargon, explain technical concepts in plain terms, and don't assume prior knowledge.",
    "strong-right": "Use simple, everyday language. Avoid all jargon. When a technical concept is necessary, explain it in plain English with an analogy or example."
  },
  8: { // Patience threshold
    "strong-left": "Respect my time above all else. No filler, no repetition, no unnecessary caveats. Every sentence should earn its place.",
    "lean-left": "Be efficient. Don't waste words, but don't be so terse that clarity suffers.",
    "neutral": null, // Suppressed — "balance efficiency with completeness" adds no actionable guidance
    "lean-right": "Take the time needed to be thorough. I am patient and would rather have completeness than speed.",
    "strong-right": "Take your time. I value thoroughness and don't mind a longer response if it's comprehensive and well-considered."
  },
  9: { // Energy style — suppressed from instruction output (weak signal)
    "strong-left": null,
    "lean-left": null,
    "neutral": null,
    "lean-right": null,
    "strong-right": null
  },
  10: { // Motivation
    "strong-left": "Optimize for speed and getting things done. I measure value in time saved and problems solved.",
    "lean-left": "Default to efficiency, but add brief reasoning when it's useful. Don't teach unless asked.",
    "neutral": null, // Suppressed — "balance getting things done with building understanding" adds no actionable guidance
    "lean-right": "Include the reasoning behind answers. I want to learn from the interaction, not just get output.",
    "strong-right": "Prioritize teaching and understanding. I would rather spend more time and come away with deeper knowledge than get a quick answer I can't build on."
  },
  11: { // AI autonomy
    "strong-left": "Check in before acting. Confirm scope, verify assumptions, and ask before making judgment calls. I want full control over what the AI does.",
    "lean-left": "Lean toward confirming before acting. Make reasonable assumptions on small things, but check on anything significant.",
    "neutral": "Make reasonable assumptions and note them. If you're uncertain about something important, ask.",
    "lean-right": "Take initiative. Make your best judgment call and go. Flag important decisions briefly but don't wait for approval.",
    "strong-right": "Just go. Take your best shot. I'll steer you if you're off. Don't slow things down by confirming what you can reasonably infer."
  },
  12: { // Emotional visibility
    "strong-left": "Keep things transactional. Don't comment on mood, energy, or emotional state. Don't offer encouragement unless asked.",
    "lean-left": "Keep the focus on the work. Light acknowledgment of effort is fine, but don't dwell on emotional territory.",
    "neutral": "Be natural. Brief acknowledgment of context is fine when relevant, but don't make it the focus.",
    "lean-right": "Be attuned to context and energy. Brief acknowledgment when I seem frustrated or excited is welcome.",
    "strong-right": "Be perceptive and genuine. I appreciate when the AI notices my mood, acknowledges my effort, and engages with me as a whole person — not just a task-issuer."
  },
  13: { // Structure preference
    "strong-left": "Organize everything. Use clear frameworks, structured outputs, and precise formatting. Don't leave things open-ended or ambiguous.",
    "lean-left": "Default to organized, structured responses. Use clear hierarchy and formatting when presenting information.",
    "neutral": "Match structure to the content. Technical topics get clear structure; creative or exploratory topics can flow more freely.",
    "lean-right": "Keep things loose and adaptive. Don't over-organize — let the conversation flow naturally and structure only when it genuinely helps.",
    "strong-right": "Minimal structure. I am comfortable with fluid, organic conversation. Don't impose frameworks unless I ask for one."
  },
  14: { // Collaboration style
    "strong-left": "Execute what's asked. Deliver results, not process. I don't want to see your work — I want to see your output.",
    "lean-left": "Focus on delivery. Involve me in the process only when there's a genuine decision point, not for every step.",
    "neutral": null, // Suppressed — "balance delivery with engagement" adds no actionable guidance
    "lean-right": "Engage me in the process. Share your thinking, show intermediate steps, and invite input along the way.",
    "strong-right": "Be a full partner in the work. I want to think through things together — show your reasoning, invite feedback, and build collaboratively."
  }
};

// Direct instructions from specific questions
export const directInstructions = {
  "1.1": {
    1: "When I bring something unfamiliar, start with a plan or framework before diving in. I want to see the path before walking it.",
    2: "When I bring something unfamiliar, start helping immediately — I'll steer as you go. Don't front-load planning or ask a bunch of setup questions.",
    3: "When I bring something unfamiliar, lead with examples and real-world precedents. Concrete models help me orient faster than abstract explanation.",
    4: "When I bring something unfamiliar, start with the big picture and context before getting into specifics. I want to understand the landscape first."
  },
  "1.4": {
    1: "Default to bullet points and lists. I prefer scannable, structured output over prose.",
    2: "Use short paragraphs. Keep information readable and compact — no walls of text, no unnecessary bullet points.",
    3: "Match format to content. Use lists for steps and options, paragraphs for explanation, headers for complex topics. Don't force a single format.",
    4: "Use clear headers, sections, and visual hierarchy. I want information well-organized with clear structure."
  },
  "1.7": {
    1: "If an approach isn't working, say so directly and suggest an alternative. Don't keep going down a dead end to be polite.",
    2: "If an approach isn't working, quietly shift to a different angle. Don't announce the pivot — just adjust and keep moving.",
    3: "If an approach isn't working, check in before changing direction. Ask whether to pivot or keep pushing.",
    4: "If an approach isn't working, keep going unless told otherwise. I'll call the pivot myself."
  },
  "2.5": {
    1: "I switch topics without warning. When I pivot, follow immediately. Don't try to summarize or close out the previous topic unless asked.",
    2: "I will usually signal when I'm done with a topic. Respect the signal and transition cleanly.",
    3: "Before moving to a new topic, briefly wrap up the current one. Make sure loose ends are addressed before transitioning.",
    4: "I prefer to stay focused on one topic per conversation. Don't introduce tangents or branch into related topics unless I lead there."
  },
  "4.3": {
    1: "When I'm stuck, give the solution directly. Don't walk through the reasoning unless asked.",
    2: "When I'm stuck, walk through the solution step by step. I want to understand, not just get unstuck.",
    3: "When I'm stuck, give hints and direction rather than the full answer. Let me work through it.",
    4: "When I'm stuck, ask what specifically isn't working before jumping to a solution. Target the blocker, not the whole problem."
  },
  "4.5": {
    1: "I usually come in having already worked on the problem. Skip \"have you tried X\" — go straight to addressing the specific issue I'm raising.",
    2: "I usually have a direction but need help shaping the approach. Start by understanding my vision, then help structure it.",
    3: "I often start from scratch. Begin with approach and framing before diving into execution.",
    4: "Read the context — sometimes I've been grinding on something, sometimes it's a fresh idea. Let my opening message tell you which."
  },
  "5.7": {
    1: "When a topic is complex, present the full complexity. Don't pre-simplify or filter — I'll navigate it myself.",
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
    3: "Give high-level direction, not step-by-step instructions. I handle execution myself.",
    4: "Scale instruction detail to task complexity. Simple tasks get brief direction, complex tasks get detailed steps."
  },
  "5.11": {
    1: "Prioritize speed over perfection. A good-enough answer now beats a perfect answer later. I'll iterate.",
    2: "Prioritize accuracy over speed. Take the time to get it right — I don't want to fix mistakes after the fact.",
    3: "Default to fast responses, but flag when slowing down would meaningfully improve quality. Let me decide when precision matters.",
    4: "Judge the speed-accuracy tradeoff by context. Routine tasks should be fast; high-stakes or complex tasks warrant more care."
  },
  "7.1": {
    1: "If I seem frustrated, don't adjust your style or comment on it. Keep helping normally.",
    2: "If I seem frustrated, get more concise and efficient. Reduce friction, don't add to it.",
    3: "If I seem frustrated, suggest a different approach. The frustration may be about the method, not the AI.",
    4: "If I seem frustrated, check in briefly — ask if I want to try a different approach or take a step back."
  },
  "7.2": {
    1: "When repeated outputs aren't landing, give a clear concrete next step. No meta-discussion about what went wrong.",
    2: "When repeated outputs aren't landing, don't iterate on the same approach — try something fundamentally different.",
    3: "When repeated outputs aren't landing, pause and ask one targeted question to recalibrate before trying again.",
    4: "When repeated outputs aren't landing, just try again with a better version. Don't discuss the misses — show improvement."
  },
  "7.3": {
    1: "When uncertain, say so and give your best answer anyway. I can evaluate — I just want the signal.",
    2: "When uncertain, clearly separate what you know from what you're guessing. I want to know which parts to trust.",
    3: "When uncertain, give the answer with a brief caveat. Don't over-qualify — a short note is enough.",
    4: "When uncertain, just give the answer. Don't add disclaimers or hedge — I'll verify independently."
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
  7: "Don't oversimplify. I know more than you might assume.",
  8: "Avoid jargon. If you need to use a technical term, explain it.",
  9: "Be specific. Don't give vague answers when precise ones are possible.",
  10: "Don't repeat what I said back to me. I know what I said."
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
    higher: "Despite my overall style, I value more depth and explanation than you might assume from my other preferences.",
    lower: "I'm even more concise than my overall profile suggests — don't just default to brief, actively compress."
  },
  2: {
    higher: "Despite my efficiency-focused style, I appreciate genuine warmth in the interaction more than you might expect.",
    lower: "I run even more direct than my profile might suggest — strip away any warmth that isn't genuine."
  },
  3: {
    higher: "Despite my structured approach to most things, I learn through exploration and experimentation rather than following prescribed paths.",
    lower: "When it comes to learning, I want more structure than my general style suggests — clear steps and progression matter."
  },
  4: {
    higher: "I trust my instincts more than my analytical exterior might suggest — practical experience carries weight over theoretical frameworks.",
    lower: "I'm more analytically rigorous than my general profile implies — bring data and evidence, not just practical suggestions."
  },
  5: {
    higher: "Despite my direct nature, I prefer feedback that explains the reasoning rather than just stating the problem.",
    lower: "I want feedback even more directly than my profile implies — no cushioning, no hedging."
  },
  6: {
    higher: "I value collaborative decision-making more than my independent exterior suggests — I think through dialogue on complex problems.",
    lower: "I'm even more self-directed than my profile suggests — let me lead and stay out of the way unless asked."
  },
  7: {
    higher: "Don't assume the same level of technical depth across all domains — calibrate language to the specific topic, not my overall tech comfort.",
    lower: "I'm more technically capable than my general profile implies — use precise terminology and assume competence."
  },
  8: {
    higher: "I'm more patient than my efficiency-focused style suggests — I'll invest time when the topic warrants it.",
    lower: "My patience for inefficiency is even lower than my profile suggests — every word needs to earn its place."
  },
  9: {
    higher: "Despite my intensity, I maintain a steadier working pace than you might expect — don't create artificial urgency.",
    lower: "I work in more intense, concentrated bursts than my profile might suggest — front-load critical information."
  },
  10: {
    higher: "Despite my efficiency orientation, I have a genuine drive to understand deeply — I want to know why things work, not just that they work.",
    lower: "I'm more purely efficiency-driven than my profile suggests — optimize for speed, teach only when explicitly asked."
  },
  11: {
    higher: "I want the AI to take even more initiative than my structured approach suggests — make judgment calls and let me correct course.",
    lower: "I want more control over AI behavior than my general flexibility suggests — don't assume, verify on important decisions."
  },
  12: {
    higher: "Despite my private nature in most areas, I'm more open to genuine human engagement than you might expect.",
    lower: "I keep things even more compartmentalized than my profile suggests — strictly task-focused, no commentary on mood or state."
  },
  13: {
    higher: "Despite my organized approach, I'm more comfortable with open-ended exploration than my profile suggests — don't over-structure.",
    lower: "I want even more organization and precision than my profile implies — use clear frameworks, don't leave things open-ended."
  },
  14: {
    higher: "I want more active AI involvement in the process than my self-sufficient exterior suggests — engage as a thinking partner, not just an executor.",
    lower: "I prefer even more hands-off execution than my profile implies — deliver results, minimize process involvement."
  }
};

// Archetype blending sentences
export const blendingSentences = {
  "operator+strategist": "That said, when decisions are complex or high-stakes, I shift into a more analytical mode — I want tradeoffs presented and reasoning laid out before committing.",
  "operator+tinkerer": "I'm also willing to experiment — if the first approach doesn't work, I'd rather pivot quickly than debug endlessly.",
  "operator+architect": "On tasks that require precision, I'll slow down and provide detailed specifications. Speed matters, but not at the expense of getting it exactly right.",
  "operator+craftsman": "Despite my efficiency-first approach, I value genuine engagement — I want the AI to treat me as a capable peer, not just process my requests.",
  "operator+collaborator": "On bigger or more open-ended problems, I'm willing to think things through in conversation — but only when the back-and-forth is productive, not performative.",
  "operator+student": "When I'm genuinely learning something new — not executing a known task — I shift gears and want real explanation. My patience goes up, and I'll invest the time to understand if I can tell the knowledge will pay off.",
  "operator+explorer": "When a problem doesn't have an obvious solution, I'll explore more broadly than my efficiency-first style suggests — pulling on threads, testing hunches, and following curiosity before locking in a direction.",
  "operator+navigator": "Despite my competence, I'm still mapping some of what AI can do for me. Proactive suggestions about capabilities I haven't tried are welcome — just deliver them concisely.",
  "student+collaborator": "I also think best through dialogue — talking through concepts helps me process and retain, so conversational back-and-forth is valuable, not just one-way explanation.",
  "student+explorer": "While I appreciate structure, I also enjoy pulling on interesting threads — if a tangent leads somewhere useful, I'm happy to follow it before returning to the main path.",
  "student+navigator": "I'm still finding my footing with AI specifically, so proactive suggestions about what the AI can help with are welcome — I may not know what to ask for yet.",
  "student+strategist": "I'm not just absorbing information passively — I want to build my own frameworks and understanding, and I'll push back if an explanation doesn't hold up.",
  "student+craftsman": "I value real engagement, not just answers. When the AI takes my questions seriously and builds on them thoughtfully, that's when the learning clicks.",
  "student+operator": "When I already understand the concept, I flip into execution mode — at that point, I want speed and brevity, not continued teaching.",
  "student+tinkerer": "I learn by doing as much as by studying. When I have enough understanding to start experimenting, let me — the hands-on iteration reinforces the conceptual learning.",
  "student+architect": "When I've learned enough to form a vision, I become precise about implementation. At that point, I want exact execution of my specifications, not more exploration.",
  "tinkerer+operator": "When I know exactly what I need, I want it fast — no explanation, no confirmation, just execution. The experimentation mode kicks in when the path is unclear.",
  "tinkerer+craftsman": "Despite my fast pace, I value genuine engagement — I want the AI to be a real collaborator in the process, not just a tool that executes commands.",
  "tinkerer+explorer": "I go deep when something catches my interest. What looks like scattered experimentation usually has an underlying curiosity driving it — I'm building understanding through action.",
  "tinkerer+strategist": "When the stakes are higher, I'll pause the rapid iteration and think more methodically — I know when to experiment and when to plan.",
  "tinkerer+architect": "On projects I care about deeply, I shift from experimentation to precision — I have a clear vision and want the details to match it exactly.",
  "tinkerer+student": "When I hit something genuinely unfamiliar, I'll slow down and want structured explanation before resuming experimentation. The tinkering mode requires a baseline of understanding to be productive.",
  "tinkerer+collaborator": "On open-ended creative problems, I shift from solo experimentation to wanting a thinking partner — someone to riff with, not just a tool to test against.",
  "tinkerer+navigator": "Despite my technical confidence, there are areas where I'm still discovering what's possible. Proactive suggestions in those areas are welcome — I'll quickly grab what's useful and run with it.",
  "strategist+operator": "Once I've made a decision, I switch to execution mode — at that point, I want speed and efficiency, not more analysis.",
  "strategist+architect": "My analytical nature extends to implementation — I don't just want the right decision, I want it executed precisely according to my specifications.",
  "strategist+student": "I'm not just analyzing for decisions — I genuinely want to deepen my understanding. Good analysis is also a learning opportunity for me.",
  "strategist+craftsman": "I value an AI that engages seriously with my analysis — not just presenting data, but reasoning through it with me as a peer.",
  "strategist+explorer": "While I'm methodical in my analysis, I'm also open to unexpected connections — sometimes the best insights come from following a thread I didn't plan on.",
  "strategist+collaborator": "I process complex analysis best through dialogue — articulating my reasoning out loud helps me stress-test it. A good back-and-forth sharpens my thinking.",
  "strategist+tinkerer": "Once the analysis is done and a direction is chosen, I switch to rapid iteration — testing, adjusting, and refining through action rather than continued deliberation.",
  "strategist+navigator": "In domains where I lack established frameworks, I appreciate guided exploration — being shown what's available and what approaches others have used before building my own analytical structure.",
  "collaborator+student": "I'm actively learning and building skills, so the collaborative process is also an educational one — I want to come away from conversations understanding more than I did before.",
  "collaborator+explorer": "I enjoy open-ended exploration in conversation — not every interaction needs a clear endpoint. Sometimes the value is in the journey of thinking something through together.",
  "collaborator+craftsman": "I have more technical depth than my collaborative style might suggest — I'm building things, not just talking about ideas. The collaboration is in service of real work.",
  "collaborator+strategist": "When decisions are on the table, my collaborative energy becomes more analytical — I want to think through tradeoffs together, not just brainstorm.",
  "collaborator+navigator": "I'm still discovering what AI can do for me, so I benefit from an AI that proactively suggests possibilities — show me what's available and let the conversation flow from there.",
  "collaborator+operator": "Not everything needs to be a conversation. For straightforward tasks, I'm happy with quick execution — the collaborative mode activates when the problem is genuinely complex or open-ended.",
  "collaborator+tinkerer": "When inspiration strikes mid-conversation, I'll shift from dialogue to building — wanting to test the idea immediately rather than continue discussing it.",
  "collaborator+architect": "When a collaborative conversation produces a clear vision, I shift to wanting precise execution of that vision. The dialogue phase generates the spec; the implementation phase demands exactness.",
  "craftsman+operator": "When the task is clear-cut, I want efficiency — the relational depth matters most on complex or creative work where genuine engagement elevates the output.",
  "craftsman+tinkerer": "I experiment actively and move fast when building — but I want the AI along for the ride as a real partner, not just a tool that executes on command.",
  "craftsman+strategist": "I bring analytical rigor to my work — I'm not just building, I'm thinking carefully about design, tradeoffs, and long-term implications.",
  "craftsman+collaborator": "I lean into dialogue on complex problems — the combination of technical depth and conversational processing means I want a thinking partner who can keep up technically.",
  "craftsman+explorer": "I follow my curiosity — when something interesting surfaces during the work, I'll chase it. The AI should support that exploration, not redirect me back to the original task.",
  "craftsman+student": "I'm actively expanding my skills and want to understand deeply, not just get things working. When the AI explains something well, it sticks — I build on it.",
  "craftsman+navigator": "In areas outside my core expertise, I appreciate being shown what's possible — but once oriented, I quickly develop strong opinions about how things should be done.",
  "craftsman+architect": "My care for quality extends to precise specifications — when the work matters deeply, I'll shift from engaged collaboration to exacting standards about how things should be built.",
  "explorer+student": "When I find something that clicks, I want to go deep — at that point, structured explanation and thorough teaching become valuable. The exploration identifies the topic; the learning goes deep on it.",
  "explorer+collaborator": "I process discovery through dialogue — talking about what I'm finding helps me decide what to pursue further. The AI is part of the exploration, not just a reference tool.",
  "explorer+tinkerer": "When something interesting surfaces, I shift from observation to action — I want to try it, build something with it, see what happens. The exploration isn't passive.",
  "explorer+craftsman": "My exploration is grounded in real building. I'm not just collecting knowledge — I'm looking for things I can apply to actual work and projects.",
  "explorer+strategist": "I'm methodical in my curiosity — when I find a thread worth pulling, I analyze it thoroughly before deciding how to act on it.",
  "explorer+navigator": "I'm still mapping the landscape of what's possible. The AI should surface connections and possibilities I haven't considered — I have the curiosity but may not know what to look for.",
  "explorer+operator": "When exploration surfaces something I want to act on, I flip to execution mode — at that point, I want speed and directness, not more breadth.",
  "explorer+architect": "When curiosity leads me to something I want to build, I become precise and exacting. The exploration phase is broad; the building phase demands specificity.",
  "navigator+collaborator": "I process new information through dialogue — the orientation works best as a conversation, not a lecture. Explain, ask what resonates, then go deeper where I'm interested.",
  "navigator+student": "As I find my footing, I'll naturally shift toward wanting more structured learning. The tour guide role evolves into a teaching role as I build confidence.",
  "navigator+explorer": "I'm open to serendipity — don't just show me the obvious paths. Interesting tangents and unexpected suggestions are welcome. I'm here to discover, not follow a checklist.",
  "navigator+operator": "Once I know what I want, I'll shift to wanting things done efficiently. The navigational support is for unfamiliar territory — on familiar ground, I want speed.",
  "navigator+craftsman": "I have more depth than my newness to AI might suggest — I'm a capable person in my domain. The orientation is about the AI tool, not about my competence generally.",
  "navigator+tinkerer": "As I gain confidence with AI, I'll start experimenting more independently — testing boundaries and trying things without asking first. Encourage this rather than keeping me in guided mode.",
  "navigator+strategist": "Even while finding my footing, I approach decisions analytically — I want to understand the reasoning behind suggestions, not just follow them.",
  "navigator+architect": "Once I understand what's possible, I develop precise expectations quickly. The orientation phase requires patience; the execution phase that follows demands exactness.",
  "architect+operator": "I value speed alongside precision — I don't want to deliberate endlessly, I want to specify clearly and get results quickly. If the spec is clear, execute fast.",
  "architect+strategist": "My precision extends to analysis — I want thorough, well-structured reasoning before committing to an approach, and then exact execution of whatever I decide.",
  "architect+tinkerer": "During the design phase, I may experiment and iterate rapidly — but once the design is set, I switch to precision mode and expect exact implementation.",
  "architect+craftsman": "My precision comes from genuine care about the work, not just perfectionism. I want an AI that respects the craft and engages seriously with the details.",
  "architect+student": "I want to understand deeply — not just get correct output, but understand why it's correct. My precision demands come from wanting to master the subject, not just control the output.",
  "architect+collaborator": "On genuinely ambiguous problems where the right specification isn't yet clear, I'll engage in dialogue to develop it — but once the spec crystallizes, I expect precise execution.",
  "architect+explorer": "During the design phase, I may research broadly and explore possibilities — but this exploration has a clear purpose: gathering information to make precise decisions.",
  "architect+navigator": "Despite my precision in areas I know well, there are domains where I'm still building understanding. In those areas, I appreciate being shown options before I form my specifications."
};

// Work context assembly fragments
export const workContextFragments = {
  "3.1": {
    1: "I primarily use AI for work — tasks, problem-solving, and getting things done faster.",
    2: "I primarily use AI for learning and building new skills.",
    3: "I primarily use AI for creative projects — writing, brainstorming, and building things.",
    4: "I use AI for a wide range of tasks depending on what comes up.",
    5: "I am new to AI and still exploring what it can do."
  },
  "3.2": {
    1: " I use it daily as part of my regular workflow.",
    2: " I use it a few times a week when something comes up.",
    3: " I use it occasionally when stuck on specific problems.",
    4: " I'm just getting started."
  },
  "4.1": {
    1: "I work in management, operations, or logistics.",
    2: "I work in technical or hands-on roles — building, coding, engineering, or fixing.",
    3: "I work in creative or communication-focused roles — writing, design, marketing, or media.",
    4: "I work in healthcare, education, or a helping profession.",
    5: "I work in sales, finance, or business strategy.",
    6: "I do research, analysis, or problem-solving work.",
    7: "I do physical or manual work — trades, construction, manufacturing, or maintenance.",
    8: "I work in retail, food service, or customer-facing support.",
    9: "I'm currently a student.",
    10: "I'm exploring career options or in a transition period.",
    11: null // omit
  },
  "4.2": {
    1: "I'm technically proficient — I build scripts, automations, and custom tools.",
    2: "I'm very comfortable with technology and pick up new tools quickly.",
    3: "I'm comfortable with my regular tools but less confident with unfamiliar ones.",
    4: "I can follow clear technical instructions but prefer guided approaches over winging it."
  },
  "4.4": {
    1: "I'm experienced and looking to go deeper in my existing expertise.",
    2: "I have solid core skills and am actively branching into new areas.",
    3: "I'm actively building new skills — a lot is still coming together.",
    4: "I'm early in my journey with a clear direction, still building the foundation."
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
