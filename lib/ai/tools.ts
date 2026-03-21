import type Anthropic from "@anthropic-ai/sdk";

export const webSearchTool: Anthropic.Tool = {
  name: "web_search",
  description: "Search the web for current information on a topic.",
  input_schema: {
    type: "object" as const,
    properties: {
      query: { type: "string", description: "The search query" },
    },
    required: ["query"],
  },
};

export const codeExecutionTool: Anthropic.Tool = {
  name: "run_code",
  description: "Execute a code snippet and return the output. Supports Python.",
  input_schema: {
    type: "object" as const,
    properties: {
      language: { type: "string", enum: ["python"], description: "Programming language" },
      code: { type: "string", description: "Code to execute" },
    },
    required: ["language", "code"],
  },
};

export const calculatorTool: Anthropic.Tool = {
  name: "calculate",
  description: "Evaluate a mathematical expression and return the result.",
  input_schema: {
    type: "object" as const,
    properties: {
      expression: { type: "string", description: "Math expression to evaluate, e.g. '2 + 2 * 3'" },
    },
    required: ["expression"],
  },
};

export const ALL_TOOLS: Anthropic.Tool[] = [
  webSearchTool,
  codeExecutionTool,
  calculatorTool,
];

export function getToolsByName(names: string[]): Anthropic.Tool[] {
  return ALL_TOOLS.filter((t) => names.includes(t.name));
}
