import { GoogleGenerativeAI } from "@google/generative-ai";

export type DetailLevel = "simple" | "detailed" | "step-by-step";

const STEP_COUNTS: Record<DetailLevel, string> = {
  simple: "3 to 4",
  detailed: "5 to 6",
  "step-by-step": "7 to 10",
};

export async function breakdownGoal(
  title: string,
  description: string,
  detailLevel: DetailLevel
): Promise<string[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const stepCount = STEP_COUNTS[detailLevel];

  const prompt = `Break down the following goal into ${stepCount} clear, actionable subtasks.
${description ? `Description: ${description}` : ""}
Goal: "${title}"

Rules:
- Each subtask should be a short, concrete action (under 10 words)
- Start each subtask with a verb (e.g. "Research", "Write", "Review")
- Return ONLY a valid JSON array of strings, nothing else

Example output: ["Research the topic", "Create an outline", "Write the first draft"]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const match = text.match(/\[[\s\S]*?\]/);
  if (!match) {
    throw new Error("Could not parse subtasks from AI response.");
  }

  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
    throw new Error("Unexpected AI response format.");
  }

  return parsed as string[];
}
