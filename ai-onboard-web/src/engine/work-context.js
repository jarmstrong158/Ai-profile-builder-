import { workContextFragments, toolDisplayNames, topicBreadthNames } from '../data/templates.js';

/**
 * Assemble work context paragraph from answers to specific questions.
 * Assembly order: Q3.1 → Q3.2 → Q4.1 → Q3.3 (tools) → Q4.2 → Q3.4 (topic breadth) → Q4.4
 */
export function assembleWorkContext(answers) {
  const parts = [];

  // Step 1: Lead sentence from Q3.1
  if (answers["3.1"] && workContextFragments["3.1"][answers["3.1"]]) {
    parts.push(workContextFragments["3.1"][answers["3.1"]]);
  }

  // Step 2: Frequency from Q3.2
  if (answers["3.2"] && workContextFragments["3.2"][answers["3.2"]]) {
    // This fragment starts with a space and is appended to previous
    const freq = workContextFragments["3.2"][answers["3.2"]];
    if (parts.length > 0) {
      parts[parts.length - 1] += freq;
    } else {
      parts.push(freq.trim());
    }
  }

  // Step 3: Work context from Q4.1
  if (answers["4.1"] && workContextFragments["4.1"][answers["4.1"]]) {
    parts.push(workContextFragments["4.1"][answers["4.1"]]);
  }

  // Step 4: Tools from Q3.3
  const tools = answers["3.3"];
  if (tools && Array.isArray(tools) && tools.length > 0) {
    // Check for special cases
    const hasOnlyPhone = tools.length === 1 && tools[0] === 8;
    const hasOnlyNotSure = tools.length === 1 && tools[0] === 9;

    if (hasOnlyPhone) {
      parts.push("They primarily use their phone and basic apps.");
    } else if (hasOnlyNotSure) {
      // omit
    } else {
      // Filter out option 8 and 9, get display names
      const toolNames = tools
        .filter(t => t >= 1 && t <= 7)
        .map(t => toolDisplayNames[t])
        .filter(Boolean);

      if (toolNames.length > 0) {
        parts.push(`Regular tools include ${formatList(toolNames)}.`);
      }
    }
  }

  // Step 5: Technical comfort from Q4.2
  if (answers["4.2"] && workContextFragments["4.2"][answers["4.2"]]) {
    parts.push(workContextFragments["4.2"][answers["4.2"]]);
  }

  // Step 6: Topic breadth from Q3.4
  const topics = answers["3.4"];
  if (topics && Array.isArray(topics) && topics.length > 0) {
    const hasOption5 = topics.includes(5);
    const hasOption6 = topics.includes(6);

    if (hasOption6) {
      // Option 6 supersedes everything
      parts.push("They bring a wide range of topics to AI conversations — expect anything from work tasks to personal projects to life decisions.");
    } else if (hasOption5 && topics.length === 1) {
      // Only option 5
      parts.push("They keep AI conversations focused on work.");
    } else {
      // Specific topics (ignore option 5 if mixed with others)
      const specificTopics = topics
        .filter(t => t >= 1 && t <= 4)
        .map(t => topicBreadthNames[t])
        .filter(Boolean);

      if (specificTopics.length > 0) {
        parts.push(`Beyond work, they also use AI for ${formatList(specificTopics)}.`);
      }
    }
  }

  // Step 7: Skill trajectory from Q4.4
  if (answers["4.4"] && workContextFragments["4.4"][answers["4.4"]]) {
    parts.push(workContextFragments["4.4"][answers["4.4"]]);
  }

  return parts.join(" ");
}

/**
 * Format a list of items with proper English: "X", "X and Y", "X, Y, and Z"
 */
function formatList(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
