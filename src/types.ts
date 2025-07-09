export type StructureProperty = {
  type?: "string" | "integer" | "number" | "boolean" | "object";
  description?: string;
  enum?: string[];
  properties?: StructureSchema;
};

export type StructureSchema = {
  [key: string]: StructureProperty;
};

export interface ToolParameter {
  type: "string" | "integer" | "number" | "boolean" | "object" | "array";
  description: string;
  name: string;
  enum?: string[]; 
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: { [key: string]: ToolParameter };
}

export interface LLMConfigOptions {
  instructions?: string;
  tools?: ToolDefinition[];
}

export interface LLMGenerateOptions {
  structure: StructureSchema;
  prompt: string;
}

export interface LLMGenerateTextOptions {
  prompt: string;
}

export interface LLMGenerateWithToolsOptions {
  prompt: string;
  tools: ToolDefinition[];
  maxToolCalls?: number;
}

export type FoundationModelsAvailability =
  | "available"
  | "appleIntelligenceNotEnabled"
  | "modelNotReady"
  | "unavailable";
