/**
 * Supplementary questions for Team Mode only.
 * Presented AFTER core questions on first take, BEFORE core on retakes.
 * These do NOT feed the 14 spectrums — stored as behavioral data for dashboard.
 */

export const supplementaryQuestions = [
  {
    id: "S0",
    text: "Before we start — how much have you used AI tools outside of work (personal projects, home use, curiosity)?",
    type: "single",
    metric: "prior_experience",
    options: [
      { value: 1, text: "Regularly — I use AI tools in my personal life" },
      { value: 2, text: "Occasionally — I've played around with it" },
      { value: 3, text: "Not really — this is mostly new to me" }
    ]
  },
  {
    id: "S1",
    text: "In the last two weeks, how often did you use AI tools for work?",
    type: "single",
    metric: "adoption_frequency",
    options: [
      { value: 1, text: "Every day or almost every day" },
      { value: 2, text: "Several times a week" },
      { value: 3, text: "A couple of times" },
      { value: 4, text: "Once or not at all" }
    ]
  },
  {
    id: "S2",
    text: "What did you mostly use AI for in the last two weeks?",
    type: "multi",
    metric: "use_case_breadth",
    instruction: "Pick all that apply:",
    options: [
      { value: 1, text: "Writing or editing (emails, documents, reports)" },
      { value: 2, text: "Research or finding information" },
      { value: 3, text: "Brainstorming or generating ideas" },
      { value: 4, text: "Data analysis or working with spreadsheets" },
      { value: 5, text: "Coding or technical tasks" },
      { value: 6, text: "Summarizing or reviewing documents" },
      { value: 7, text: "Creating presentations or visual content" },
      { value: 8, text: "I tried but didn't find it useful for my tasks" },
      { value: 9, text: "I didn't use it" }
    ]
  },
  {
    id: "S3",
    text: "When you used AI in the last two weeks, how often did you get a result you could actually use?",
    type: "single",
    metric: "success_rate",
    numericalMap: { 1: 4, 2: 3, 3: 2, 4: 1, 5: null },
    options: [
      { value: 1, text: "Almost always — it nails it or gets close enough to work with" },
      { value: 2, text: "More often than not — usually useful with some tweaking" },
      { value: 3, text: "About half the time — hit or miss" },
      { value: 4, text: "Rarely — I usually end up doing it myself anyway" },
      { value: 5, text: "I didn't use it enough to say" }
    ]
  },
  {
    id: "S4",
    text: "What's the biggest thing getting in the way of AI being more useful to you right now?",
    type: "single",
    metric: "primary_barrier",
    options: [
      { value: 1, text: "I'm not sure what to ask it or how to phrase things" },
      { value: 2, text: "It doesn't understand my specific work context well enough" },
      { value: 3, text: "The output quality isn't good enough for my standards" },
      { value: 4, text: "I don't have time to learn how to use it properly" },
      { value: 5, text: "I don't trust the output enough to rely on it" },
      { value: 6, text: "Nothing major — it's working well for me" },
      { value: 7, text: "I'm not really using it yet" }
    ]
  },
  {
    id: "S5",
    text: "Compared to two weeks ago, how do you feel about using AI for your work?",
    type: "single",
    metric: "confidence_trajectory",
    options: [
      { value: 1, text: "More confident — I'm getting better at it" },
      { value: 2, text: "About the same" },
      { value: 3, text: "Less confident — I've hit some walls" },
      { value: 4, text: "This is my first time taking this" }
    ]
  },
  {
    id: "S6",
    text: "In the last two weeks, did AI save you meaningful time on any task?",
    type: "single",
    metric: "time_impact",
    numericalMap: { 1: 4, 2: 3, 3: 2, 4: 1, 5: null },
    options: [
      { value: 1, text: "Yes — it noticeably sped up something that would have taken me longer on my own" },
      { value: 2, text: "Somewhat — it helped but I still spent a lot of time adjusting the output" },
      { value: 3, text: "Not really — it took about as long as doing it myself would have" },
      { value: 4, text: "It actually cost me time — I would have been faster without it" },
      { value: 5, text: "I didn't use it enough to say" }
    ]
  },
  {
    id: "S7",
    text: "In the last two weeks, did you learn anything about using AI from a coworker, or share something you learned?",
    type: "single",
    metric: "knowledge_sharing",
    options: [
      { value: 1, text: "Yes — someone showed me something useful" },
      { value: 2, text: "Yes — I shared a tip or technique with someone else" },
      { value: 3, text: "Both — I learned from others and shared my own tips" },
      { value: 4, text: "No — I've mostly been figuring it out on my own" },
      { value: 5, text: "I haven't been using it enough for this to come up" }
    ]
  }
];
