import type { TurboModule, CodegenTypes } from "react-native";
/**
 * Options for generateText
 */
export interface GenerateTextOptions {
    prompt: string;
}
/**
 * Options for generateWithTools
 */
export interface GenerateWithToolsOptions {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    toolTimeout?: number;
}
/**
 * Configuration options for the session
 */
export interface SessionConfig {
    instructions?: string;
}
/**
 * Options for generating structured output
 */
export interface GenerateStructuredOutputOptions {
    structure: Readonly<{
        [key: string]: Readonly<{}>;
    }>;
    prompt: string;
}
/**
 * Tool definition for registration
 */
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: Readonly<{
        [key: string]: Readonly<{}>;
    }>;
}
/**
 * Tool execution result
 */
export interface ToolResult {
    id: string;
    success: boolean;
    result?: string;
    error?: string;
}
/**
 * Event payload for text generation chunks
 */
export type TextGenerationChunkEvent = {
    chunk: string;
};
/**
 * Event payload for tool invocations
 */
export type ToolInvocationEvent = {
    name: string;
    id: string;
    parameters: Readonly<{
        [key: string]: Readonly<{}>;
    }>;
};
export interface Spec extends TurboModule {
    /**
     * Check if Foundation Models (Apple Intelligence) are enabled and available.
     * Returns a string status: 'available', 'appleIntelligenceNotEnabled', 'modelNotReady', 'unavailable'.
     */
    isFoundationModelsEnabled(): Promise<"available" | "appleIntelligenceNotEnabled" | "modelNotReady" | "unavailable">;
    /**
     * Configure the session with options
     */
    configureSession(config: SessionConfig): Promise<boolean>;
    /**
     * Generate text using text parameter
     */
    generateText(options: GenerateTextOptions): Promise<string>;
    /**
     * Generate structured output using a JSON shape as the schema
     */
    generateStructuredOutput(options: GenerateStructuredOutputOptions): Promise<Readonly<{}>>;
    /**
     * Generate text with tool calling capabilities
     */
    generateWithTools(options: GenerateWithToolsOptions): Promise<string>;
    /**
     * Register a tool that can be called by the LLM
     */
    registerTool(toolDefinition: ToolDefinition): Promise<boolean>;
    /**
     * Handle tool execution results from React Native
     */
    handleToolResult(result: ToolResult): Promise<boolean>;
    /**
     * Reset the session
     */
    resetSession(): Promise<boolean>;
    /**
     * Event emitter for tool invocations
     * Emitted when the LLM wants to invoke a tool
     */
    readonly onToolInvocation: CodegenTypes.EventEmitter<ToolInvocationEvent>;
}
declare const _default: Spec;
export default _default;
//# sourceMappingURL=NativeAppleLLMModule.d.ts.map