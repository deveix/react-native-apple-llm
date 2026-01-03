import { EventEmitter } from "events";
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
    type: "string" | "integer" | "number" | "boolean" | "object";
    description: string;
    name: string;
    enum?: string[];
}
export interface ToolSchema {
    name: string;
    description: string;
    parameters: {
        [key: string]: ToolParameter;
    };
}
export interface ToolDefinition {
    handler: (parameters: any) => Promise<any>;
    schema: ToolSchema;
}
export interface LLMConfigOptions {
    instructions?: string;
}
export interface LLMGenerateOptions {
    structure: StructureSchema;
    prompt: string;
}
export interface LLMGenerateTextOptions {
    prompt: string;
    stream?: EventEmitter;
}
export interface LLMGenerateTextStreamOptions {
    prompt: string;
}
export interface LLMGenerateWithToolsOptions {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    toolTimeout?: number;
    stream?: EventEmitter;
}
export interface ToolCall {
    name: string;
    parameters: any;
    id: string;
}
export type FoundationModelsAvailability = "available" | "appleIntelligenceNotEnabled" | "modelNotReady" | "unavailable";
//# sourceMappingURL=types.d.ts.map