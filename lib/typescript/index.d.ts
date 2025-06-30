import { FoundationModelsAvailability, LLMConfigOptions, LLMGenerateOptions, LLMGenerateTextOptions } from "./types";
/**
 * Check if Foundation Models (Apple Intelligence) are enabled and available.
 * Returns a string status: 'available', 'appleIntelligenceNotEnabled', 'modelNotReady', 'unavailable'.
 */
export declare const isFoundationModelsEnabled: () => Promise<FoundationModelsAvailability>;
/**
 * Set up the LLM session with optional instructions
 */
export declare const configureSession: (options: LLMConfigOptions) => Promise<boolean>;
/**
 * Generate text using text parameter
 * Now only returns the final result; partials are not supported.
 */
export declare const generateText: (options: LLMGenerateTextOptions) => Promise<any>;
/**
 * Generate structured output using a JSON shape as the schema
 * Now only returns the final result; partials are not supported.
 */
export declare const generateStructuredOutput: (options: LLMGenerateOptions) => Promise<any>;
/**
 * Reset the LLM session
 */
export declare const resetSession: () => Promise<boolean>;
export * from "./types";
//# sourceMappingURL=index.d.ts.map