import { FoundationModelsAvailability, LLMConfigOptions, LLMGenerateOptions, LLMGenerateTextOptions, LLMGenerateWithToolsOptions, LLMGenerateTextStreamOptions, ToolDefinition } from "./types";
/**
 * Check if Foundation Models (Apple Intelligence) are enabled and available.
 * Returns a string status: 'available', 'appleIntelligenceNotEnabled', 'modelNotReady', 'unavailable'.
 */
export declare const isFoundationModelsEnabled: () => Promise<FoundationModelsAvailability>;
/**
 * Class-based session management for Apple LLM
 */
export declare class AppleLLMSession {
    private toolHandlers;
    private isConfigured;
    private activeToolListener?;
    /**
     * Configure the session with options and tools
     */
    configure(options: LLMConfigOptions, tools?: ToolDefinition[]): Promise<boolean>;
    /**
     * Generate text using text parameter
     */
    generateText(options: LLMGenerateTextOptions): Promise<string>;
    /**
     * Generate structured output using a JSON shape as the schema
     */
    generateStructuredOutput(options: LLMGenerateOptions): Promise<any>;
    /**
     * Generate text with tool calling capabilities
     */
    generateWithTools(options: LLMGenerateWithToolsOptions): Promise<any>;
    /**
     * Register a tool that can be called by the LLM
     */
    private registerTool;
    /**
     * Reset the session
     */
    reset(): Promise<boolean>;
    /**
     * Dispose of the session and clean up resources
     */
    dispose(): void;
    /**
     * Generate text as a ReadableStream
     */
    generateTextStream(options: LLMGenerateTextStreamOptions): ReadableStream<string>;
    private ensureConfigured;
}
/**
 * @deprecated Use AppleLLMSession class instead
 */
export declare const configureSession: (options: LLMConfigOptions, tools?: ToolDefinition[]) => Promise<boolean>;
/**
 * @deprecated Use AppleLLMSession class instead
 */
export declare const generateText: (options: LLMGenerateTextOptions) => Promise<any>;
/**
 * @deprecated Use AppleLLMSession class instead
 */
export declare const generateStructuredOutput: (options: LLMGenerateOptions) => Promise<any>;
/**
 * @deprecated Use AppleLLMSession class instead
 */
export declare const generateWithTools: (options: LLMGenerateWithToolsOptions) => Promise<any>;
/**
 * @deprecated Use AppleLLMSession class instead
 */
export declare const resetSession: () => Promise<boolean>;
export * from "./types";
//# sourceMappingURL=index.d.ts.map