type StructureProperty = {
  type?: "string" | "integer" | "number" | "boolean" | "object";
  description?: string;
  enum?: string[];
  properties?: StructureSchema;
};

type StructureField = StructureProperty;

export type StructureSchema = {
  [key: string]: StructureField;
};

export interface LLMConfigOptions {
  instructions?: string;
}

export interface LLMGenerateOptions {
  structure: StructureSchema;
  prompt: string;
}

export type FoundationModelsAvailability =
  | "available"
  | "appleIntelligenceNotEnabled"
  | "modelNotReady"
  | "unavailable";
