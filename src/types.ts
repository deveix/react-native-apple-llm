export type StructureProperty = {
  type?: "string" | "integer" | "number" | "boolean" | "object";
  description?: string;
  enum?: string[];
  properties?: StructureSchema;
};

export type StructureSchema = {
  [key: string]: StructureProperty;
};

export interface LLMConfigOptions {
  instructions?: string;
}

export interface LLMGenerateOptions {
  structure: StructureSchema;
  prompt: string;
}

export interface LLMGenerateTextOptions {
  prompt: string;
}

export type FoundationModelsAvailability =
  | "available"
  | "appleIntelligenceNotEnabled"
  | "modelNotReady"
  | "unavailable";
