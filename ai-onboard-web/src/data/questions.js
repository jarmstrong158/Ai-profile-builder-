export const sections = [
  {
    id: 1,
    title: "How You Think",
    questions: [
      {
        id: "1.1",
        text: "When you're facing something new and unfamiliar, what's your first move?",
        type: "single",
        options: [
          { value: 1, text: "Break it down — figure out the pieces before jumping in" },
          { value: 2, text: "Dive in and figure it out as I go — I learn by doing" },
          { value: 3, text: "Find someone who's already done it and learn from their approach" },
          { value: 4, text: "Get the big picture first, then decide where to start" }
        ]
      },
      {
        id: "1.2",
        text: "When someone's explaining something and it's not clicking, what helps most?",
        type: "single",
        options: [
          { value: 1, text: "Show me a real example — I get it faster when I can see it in action" },
          { value: 2, text: "Say it a different way — sometimes different words make it land" },
          { value: 3, text: "Start from the top — give me the big picture before the details" },
          { value: 4, text: "Let me try it and mess up — I learn more from doing than listening" }
        ]
      },
      {
        id: "1.3",
        text: "When someone points out a mistake you made, what's most useful to you?",
        type: "single",
        options: [
          { value: 1, text: "Be direct — tell me what's wrong and how to fix it so I can move on" },
          { value: 2, text: "Walk me through it — I want to understand why it's wrong, not just that it's wrong" },
          { value: 3, text: "Flag it, but give me a sec to look at it myself before jumping into the fix" },
          { value: 4, text: "Depends on how big the mistake is" }
        ]
      },
      {
        id: "1.4",
        text: "When you're learning something new, which sounds most like you?",
        type: "single",
        options: [
          { value: 1, text: "I grind at it until it clicks — repetition and persistence are how I learn" },
          { value: 2, text: "I need a clear path — steps, structure, a sense of progression" },
          { value: 3, text: "I pick things up fast when I can connect them to something I already know" },
          { value: 4, text: "I learn best in conversation — talking it through with someone helps me process" }
        ]
      },
      {
        id: "1.5",
        text: "When you're working through a decision, how do you usually get there?",
        type: "single",
        options: [
          { value: 1, text: "Research first — I want data and facts before I commit" },
          { value: 2, text: "Gut feeling backed by experience — I've usually got a sense of the right call" },
          { value: 3, text: "Talk it out — hearing myself explain the options helps me decide" },
          { value: 4, text: "Weigh the tradeoffs — I think about what I'm gaining and what I'm giving up" }
        ]
      },
      {
        id: "1.6",
        text: "When you're working on something important, what role do other people usually play?",
        type: "single",
        options: [
          { value: 1, text: "I make the calls, but I'll pull people in for specific pieces — execution, not direction" },
          { value: 2, text: "I work through it with someone — thinking out loud helps me get to a better answer" },
          { value: 3, text: "I keep it to myself until I've got something worth showing" },
          { value: 4, text: "It depends — some things I need input on, some things I've already got figured out" }
        ]
      },
      {
        id: "1.7",
        text: "When you've got a lot on your plate, how do you figure out what to tackle first?",
        type: "single",
        options: [
          { value: 1, text: "I already know — I've got a system, or at least a running priority list in my head" },
          { value: 2, text: "I go with whatever feels most urgent or has the most momentum right now" },
          { value: 3, text: "I need to get it out of my head first — write it down, map it out, then decide" },
          { value: 4, text: "I just pick one thing and go — if I overthink the order I lose steam" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "How You Communicate",
    questions: [
      {
        id: "2.1",
        text: "When you ask a simple question and get a three-paragraph answer, how does that land?",
        type: "single",
        options: [
          { value: 1, text: "Annoying — I asked a question, not for an essay" },
          { value: 2, text: "Fine if the extra context is actually useful, annoying if it's filler" },
          { value: 3, text: "I'd rather have too much information than not enough" },
          { value: 4, text: "Depends on the topic — sometimes I want depth, sometimes I just need the answer" }
        ]
      },
      {
        id: "2.2",
        text: "Imagine you asked an AI \"How do I fix a leaky faucet?\" — which response would you prefer to get back?",
        type: "single",
        options: [
          { value: 1, text: "\"Usually it's a worn washer. Turn off the water supply, unscrew the handle, replace the washer, reassemble. YouTube 'faucet washer replacement' for your specific model.\"" },
          { value: 2, text: "\"Most leaky faucets come down to a worn-out washer or O-ring. Here's what I'd suggest — first, turn off the water supply under the sink. Then you'll want to carefully remove the handle. I'd recommend watching a quick video for your specific faucet type so you can see exactly what you're working with.\"" },
          { value: 3, text: "\"Nine times out of ten it's the washer. Here's the fix: shut off water, pull the handle, swap the washer. Takes ten minutes. If that doesn't solve it, it might be the valve seat — that's a slightly bigger job but still doable.\"" }
        ]
      },
      {
        id: "2.3",
        text: "When you're messaging someone — texting, Slack, whatever — which is most like you?",
        type: "single",
        options: [
          { value: 1, text: "Short and direct — I say what I need to say" },
          { value: 2, text: "Full sentences, but I keep it tight — clear and to the point" },
          { value: 3, text: "I tend to explain my reasoning so they understand where I'm coming from" },
          { value: 4, text: "Totally depends who I'm talking to" }
        ]
      },
      {
        id: "2.4",
        text: "Pleasantries and small talk in a work context — where do you fall?",
        type: "single",
        options: [
          { value: 1, text: "Skip it — let's get to the point" },
          { value: 2, text: "A little warmth goes a long way, but don't overdo it" },
          { value: 3, text: "I appreciate it — makes the interaction feel more human" },
          { value: 4, text: "I don't really notice either way, it doesn't affect me" }
        ]
      },
      {
        id: "2.5",
        text: "When you're done with a topic in a conversation, how do you usually move on?",
        type: "single",
        options: [
          { value: 1, text: "I just jump to the next thing — keep up" },
          { value: 2, text: "I'll say thanks or signal I'm done before switching" },
          { value: 3, text: "I like to wrap up the current topic before starting a new one" },
          { value: 4, text: "I tend to stay on one topic per conversation" }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "What You Need the AI For",
    questions: [
      {
        id: "3.1",
        text: "What best describes why you're here?",
        type: "single",
        options: [
          { value: 1, text: "I want help with work — tasks, writing, problem-solving, getting things done faster" },
          { value: 2, text: "I'm trying to learn something new or build a skill" },
          { value: 3, text: "Creative stuff — writing, projects, brainstorming, building things" },
          { value: 4, text: "A mix of everything — I'll bring whatever I'm working on" },
          { value: 5, text: "Honestly, I'm still figuring out what AI can actually do for me" }
        ]
      },
      {
        id: "3.2",
        text: "How often do you see yourself using AI?",
        type: "single",
        options: [
          { value: 1, text: "Daily — it's becoming part of how I work" },
          { value: 2, text: "A few times a week when something comes up" },
          { value: 3, text: "Here and there when I'm stuck on something specific" },
          { value: 4, text: "This is pretty new to me — I'm just getting started" }
        ]
      },
      {
        id: "3.3",
        text: "What tools or platforms are part of your regular routine?",
        type: "multi",
        instruction: "Pick all that apply (separate with commas), or press Enter to skip:",
        skippable: true,
        options: [
          { value: 1, text: "Microsoft Office (Word, Excel, Outlook, Teams)" },
          { value: 2, text: "Google Workspace (Docs, Sheets, Gmail, Drive)" },
          { value: 3, text: "Programming or scripting (Python, JavaScript, etc.)" },
          { value: 4, text: "Design tools (Photoshop, Canva, Figma, etc.)" },
          { value: 5, text: "Project management (Trello, Asana, Jira, etc.)" },
          { value: 6, text: "Social media or content platforms" },
          { value: 7, text: "Accounting or business software (QuickBooks, NetSuite, etc.)" },
          { value: 8, text: "I mostly just use my phone and basic apps" },
          { value: 9, text: "Not sure what's relevant here" }
        ]
      },
      {
        id: "3.4",
        text: "Beyond work, what kinds of things do you bring to AI conversations?",
        type: "multi",
        instruction: "Pick all that apply (separate with commas), or press Enter to skip:",
        skippable: true,
        exclusivityRules: {
          5: [1, 2, 3, 4, 6],
          6: [1, 2, 3, 4, 5]
        },
        options: [
          { value: 1, text: "Hobbies or personal projects" },
          { value: 2, text: "Learning and self-improvement" },
          { value: 3, text: "Creative writing or brainstorming" },
          { value: 4, text: "Personal decisions or life planning" },
          { value: 5, text: "Just work stuff — I keep it professional" },
          { value: 6, text: "Whatever's on my mind — the range is wide" }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Your Work & Life Context",
    questions: [
      {
        id: "4.1",
        text: "Which best describes your day-to-day?",
        type: "single",
        options: [
          { value: 1, text: "I manage people, operations, or logistics" },
          { value: 2, text: "I do technical or hands-on work — building, coding, engineering, fixing" },
          { value: 3, text: "I do creative or communication-focused work — writing, design, marketing, media" },
          { value: 4, text: "I work in healthcare, education, or a helping profession" },
          { value: 5, text: "I work in sales, finance, or business strategy" },
          { value: 6, text: "I do research, analysis, or problem-solving work" },
          { value: 7, text: "I'm in school or actively studying something" },
          { value: 8, text: "I'm exploring my options or in a transition" },
          { value: 9, text: "I'd rather keep this general" }
        ]
      },
      {
        id: "4.2",
        text: "How comfortable are you with technology?",
        type: "single",
        options: [
          { value: 1, text: "I build things with it — scripts, automations, custom tools, code" },
          { value: 2, text: "Very comfortable — I pick up new software and systems quickly" },
          { value: 3, text: "Solid with the tools I use every day, less confident with unfamiliar ones" },
          { value: 4, text: "I can follow clear instructions, but I'm not going to wing it on something technical" }
        ]
      },
      {
        id: "4.3",
        text: "When you're stuck on something and can't figure it out, what's your usual move?",
        type: "single",
        options: [
          { value: 1, text: "Dig in — search for answers, read documentation, keep grinding until it clicks" },
          { value: 2, text: "Phone a friend — find someone who's dealt with it and get their take" },
          { value: 3, text: "Experiment — try different approaches and see what happens" },
          { value: 4, text: "Step away and come back fresh — I think better after a break" }
        ]
      },
      {
        id: "4.4",
        text: "How do you feel about your current skill set?",
        type: "single",
        options: [
          { value: 1, text: "I'm solid at what I do and looking to go deeper" },
          { value: 2, text: "I'm good at my core work but want to branch into new areas" },
          { value: 3, text: "I'm actively building new skills — a lot is still coming together" },
          { value: 4, text: "I'm early in my journey — I know the direction, still building the foundation" }
        ]
      },
      {
        id: "4.5",
        text: "When you bring a problem to the AI, what's the situation usually look like?",
        type: "single",
        options: [
          { value: 1, text: "I've already been working on it — I need help with a specific piece I'm stuck on" },
          { value: 2, text: "I have a general sense of what I want but haven't started yet — I need help shaping it" },
          { value: 3, text: "I'm starting from scratch — I need help figuring out the approach" },
          { value: 4, text: "It varies — sometimes I'm deep in it, sometimes I'm bringing a fresh idea" }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "How You Want the AI to Behave",
    questions: [
      {
        id: "5.1",
        text: "When the AI isn't sure what you mean, what should it do?",
        type: "single",
        options: [
          { value: 1, text: "Take its best shot — I'll correct it if it's off" },
          { value: 2, text: "Ask me one focused question to clarify, then go" },
          { value: 3, text: "Ask what it needs to get it right — I'd rather it understands me before starting" }
        ]
      },
      {
        id: "5.2",
        text: "How do you feel about the AI pushing back on your ideas?",
        type: "single",
        options: [
          { value: 1, text: "I want honesty — if my idea has a problem, tell me straight" },
          { value: 2, text: "I'm open to pushback if you explain the reasoning" },
          { value: 3, text: "I'd rather it help me execute what I'm asking — I'll decide if it needs rethinking" },
          { value: 4, text: "Depends on the stakes — small stuff just do it, big stuff challenge me" }
        ]
      },
      {
        id: "5.3",
        text: "How much explanation do you want with your answers?",
        type: "single",
        options: [
          { value: 1, text: "Just the answer — I'll ask if I need more" },
          { value: 2, text: "Brief reasoning so I understand the \"why\" behind it" },
          { value: 3, text: "Thorough breakdown — I want to learn from the answer, not just use it" },
          { value: 4, text: "Match it to the question — simple question, simple answer; complex question, go deep" }
        ]
      },
      {
        id: "5.4",
        text: "When the AI gets something wrong, what's the best recovery?",
        type: "single",
        options: [
          { value: 1, text: "Acknowledge it, fix it, move on — don't dwell" },
          { value: 2, text: "Tell me what went wrong so I understand the miss" },
          { value: 3, text: "Just give me the right answer — I don't need a postmortem" },
          { value: 4, text: "Depends on whether it's a small slip or a big miss" }
        ]
      },
      {
        id: "5.5",
        text: "How do you feel about encouragement from the AI?",
        type: "single",
        options: [
          { value: 1, text: "Skip it — I'm here to get things done, not get a pep talk" },
          { value: 2, text: "Fine in small doses when it's genuine — don't force it" },
          { value: 3, text: "I appreciate it — positive feedback keeps me motivated" },
          { value: 4, text: "I don't really care either way" }
        ]
      },
      {
        id: "5.6",
        text: "When the AI gives you a response that's not what you wanted, what's your move?",
        type: "single",
        options: [
          { value: 1, text: "Tell it directly what was wrong and what I want instead" },
          { value: 2, text: "Try rephrasing my original question" },
          { value: 3, text: "Give it more context about what I'm actually trying to do" },
          { value: 4, text: "Start over with a cleaner ask" }
        ]
      },
      {
        id: "5.7",
        text: "When a topic is genuinely complicated, what do you want from the AI?",
        type: "single",
        options: [
          { value: 1, text: "Give me the full complexity — I'll sort through it myself" },
          { value: 2, text: "Start simple and add layers as I ask for it" },
          { value: 3, text: "Break it into manageable pieces and walk me through them" },
          { value: 4, text: "Give me the bottom line and I'll dig deeper if I need to" }
        ]
      },
      {
        id: "5.8",
        text: "You're in the middle of a task and the AI notices something you might have missed. What's the move?",
        type: "single",
        options: [
          { value: 1, text: "Flag it — I'd rather get pulled off track for a second than miss something important" },
          { value: 2, text: "Mention it at the end — finish what I asked for first, then bring it up" },
          { value: 3, text: "Keep it to yourself unless I ask — I'll handle the big picture" },
          { value: 4, text: "Ask me first — \"hey, I noticed something, want me to go into it?\"" }
        ]
      },
      {
        id: "5.9",
        text: "How closely do you want to be involved while the AI works on something for you?",
        type: "single",
        options: [
          { value: 1, text: "Give me the end result — I don't need to see your work unless I ask" },
          { value: 2, text: "Show me checkpoints along the way — I want to course-correct before you go too far" },
          { value: 3, text: "Walk me through your thinking as you go — I want to follow the process" },
          { value: 4, text: "Depends on the task — sometimes I want full visibility, sometimes just surprise me with the result" }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Boundaries & Friction Points",
    questions: [
      {
        id: "6.1",
        text: "Which of these would get under your skin?",
        type: "multi",
        instruction: "Pick all that apply (separate with commas), or press Enter to skip:",
        skippable: true,
        options: [
          { value: 1, text: "Excessive apologizing — \"I'm so sorry\" after every small thing" },
          { value: 2, text: "Unnecessary disclaimers and warnings I didn't ask for" },
          { value: 3, text: "Too formal or stiff — feels like talking to a corporate email" },
          { value: 4, text: "Too chatty or casual — I'm not looking for a buddy" },
          { value: 5, text: "Asking too many questions before actually helping" },
          { value: 6, text: "Long responses when I wanted something short" },
          { value: 7, text: "Oversimplifying things I already understand" },
          { value: 8, text: "Using jargon without explaining it" },
          { value: 9, text: "Being vague when I need a specific answer" },
          { value: 10, text: "Repeating things I already said back to me" }
        ]
      },
      {
        id: "6.2",
        text: "What's the one thing that would make you stop using an AI tool?",
        type: "single",
        options: [
          { value: 1, text: "It wastes my time with fluff instead of being useful" },
          { value: 2, text: "It talks down to me or treats me like I don't know anything" },
          { value: 3, text: "It can't keep up with what I'm actually asking for" },
          { value: 4, text: "It feels fake — overly enthusiastic, performative, not genuine" },
          { value: 5, text: "It keeps making the same mistakes even after I correct it" }
        ]
      },
      {
        id: "6.3",
        text: "Is there anything else you want the AI to know about how to work with you?",
        type: "text",
        instruction: "(Type your response, or press Enter to skip)"
      }
    ]
  },
  {
    id: 7,
    title: "Your Energy & Headspace",
    optional: true,
    questions: [
      {
        id: "7.1",
        text: "When you're having a rough day and you bring a task to the AI, what would help most?",
        type: "single",
        options: [
          { value: 1, text: "Keep it business as usual — I don't need the AI to read my mood" },
          { value: 2, text: "Be a little more patient — shorter answers, less back-and-forth" },
          { value: 3, text: "Check in briefly if I seem off, but don't make it a thing" },
          { value: 4, text: "I wouldn't notice either way — I just want the task done" }
        ]
      },
      {
        id: "7.2",
        text: "When something isn't working and you're getting frustrated, what helps you push through?",
        type: "single",
        options: [
          { value: 1, text: "A clear next step — just tell me exactly what to do" },
          { value: 2, text: "Reassurance that I'm on the right track, even if it's hard" },
          { value: 3, text: "A different angle — if this approach isn't working, suggest another one" },
          { value: 4, text: "Space — let me step back and come back to it" }
        ]
      },
      {
        id: "7.3",
        text: "How do you generally manage your energy throughout the day?",
        type: "single",
        options: [
          { value: 1, text: "I go hard and recharge later — bursts of focus then downtime" },
          { value: 2, text: "Steady pace — I like consistency and routine" },
          { value: 3, text: "It depends on the day — some days I'm on, some days I'm not" },
          { value: 4, text: "I'm usually running on fumes — efficiency matters because I don't have a lot of extra bandwidth" }
        ]
      }
    ]
  },
  {
    id: 8,
    title: "Goals",
    questions: [
      {
        id: "8.1",
        text: "What would make AI feel like a win for you?",
        type: "single",
        options: [
          { value: 1, text: "Saves me time — I get things done faster" },
          { value: 2, text: "Helps me learn — I come away understanding more than I did before" },
          { value: 3, text: "Improves my output — better writing, better decisions, better work" },
          { value: 4, text: "Gives me a thinking partner — someone to bounce ideas off of" },
          { value: 5, text: "Honestly not sure yet — I'm still figuring that out" }
        ]
      }
    ]
  }
];

export const SECTION_7_INDEX = 6;

export function getTotalQuestions(includeSection7 = true) {
  return sections.reduce((total, section) => {
    if (!includeSection7 && section.id === 7) return total;
    return total + section.questions.length;
  }, 0);
}
