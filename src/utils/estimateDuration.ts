import { TaskPriority } from "../types/task";

/**
 * Keyword-based task duration estimator.
 *
 * Designed for the kind of tasks a typical to-do app user creates:
 * students, self-improvement, work, chores and errands. Each keyword maps to a
 * rough baseline in minutes drawn from how long that activity usually takes.
 * The estimate combines the heaviest matching keyword with a small additive
 * bump for extra matches, then scales by the task's priority.
 *
 * This is intentionally a transparent heuristic (not ML): it is fast, runs
 * offline, and is easy to reason about and test.
 */

type KeywordRule = {
  minutes: number;
  keywords: string[];
};

// Ordered loosely from longer to shorter activities. Keywords are matched as
// whole words (case-insensitive) against the task title + description + category.
const KEYWORD_RULES: KeywordRule[] = [
  // Study / academic
  { minutes: 180, keywords: ["thesis", "dissertation", "research paper", "research"] },
  { minutes: 150, keywords: ["essay", "assignment", "report", "project", "presentation", "coursework"] },
  { minutes: 120, keywords: ["study", "revise", "revision", "exam", "midterm", "final", "lecture", "tutorial"] },
  { minutes: 90, keywords: ["homework", "quiz", "reading", "read", "notes", "summary", "flashcards"] },

  // Work / professional
  { minutes: 90, keywords: ["meeting", "interview", "workshop", "deck", "proposal", "budget"] },
  { minutes: 60, keywords: ["email", "emails", "report", "review", "plan", "draft", "spreadsheet"] },
  { minutes: 45, keywords: ["call", "standup", "sync", "follow up", "follow-up", "reply"] },

  // Self-improvement / fitness / wellbeing
  { minutes: 60, keywords: ["gym", "workout", "exercise", "run", "running", "yoga", "training", "meditate", "meditation"] },
  { minutes: 45, keywords: ["walk", "stretch", "journal", "practice", "learn", "course", "lesson"] },

  // Chores / errands / personal
  { minutes: 90, keywords: ["clean", "cleaning", "laundry", "tidy", "organize", "organise", "declutter"] },
  { minutes: 60, keywords: ["cook", "cooking", "meal", "grocery", "groceries", "shopping", "shop"] },
  { minutes: 30, keywords: ["dishes", "vacuum", "errand", "errands", "pay", "bill", "bills", "book", "appointment"] },
  { minutes: 15, keywords: ["call", "text", "message", "water", "feed", "quick", "buy", "pick up", "pickup"] },
];

const PRIORITY_MULTIPLIER: Record<TaskPriority, number> = {
  high: 1.25, // high-priority tasks tend to be larger / more involved
  medium: 1,
  low: 0.85,
};

// Used when no keyword matches at all.
const DEFAULT_BASE_MINUTES = 30;

// Clamp so estimates stay sensible.
const MIN_MINUTES = 5;
const MAX_MINUTES = 8 * 60;

function roundToFive(minutes: number): number {
  return Math.max(MIN_MINUTES, Math.round(minutes / 5) * 5);
}

function containsKeyword(haystack: string, keyword: string): boolean {
  // Word-boundary-ish match that also handles multi-word keywords.
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i");
  return pattern.test(haystack);
}

export type DurationEstimate = {
  minutes: number;
  matchedKeywords: string[];
};

/**
 * Estimate how long a task will take, in minutes.
 */
export function estimateTaskDuration(input: {
  title?: string;
  description?: string;
  category?: string;
  priority?: TaskPriority;
}): DurationEstimate {
  const haystack = [input.title, input.description, input.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let baseMinutes = 0;
  let additionalMinutes = 0;
  const matchedKeywords: string[] = [];

  for (const rule of KEYWORD_RULES) {
    for (const keyword of rule.keywords) {
      if (containsKeyword(haystack, keyword)) {
        matchedKeywords.push(keyword);
        // The single heaviest rule sets the base; further matches add a little.
        if (rule.minutes > baseMinutes) {
          additionalMinutes += baseMinutes * 0.15;
          baseMinutes = rule.minutes;
        } else {
          additionalMinutes += rule.minutes * 0.15;
        }
        break; // one match per rule is enough
      }
    }
  }

  if (baseMinutes === 0) {
    baseMinutes = DEFAULT_BASE_MINUTES;
  }

  const priority = input.priority ?? "medium";
  const raw = (baseMinutes + additionalMinutes) * PRIORITY_MULTIPLIER[priority];
  const clamped = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, raw));

  return {
    minutes: roundToFive(clamped),
    matchedKeywords,
  };
}

/**
 * Format a minutes value into a friendly label, e.g. "1 hr 30 min".
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) {
    return "—";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} min`;
  }

  if (mins === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${mins} min`;
}
