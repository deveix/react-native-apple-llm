import { NativeModules } from "react-native";

const { AppleLLMModule } = NativeModules;

if (!AppleLLMModule) {
  console.log("AppleLLM native module is not available");
  throw new Error("AppleLLM native module is not available");
}
import {
  FoundationModelsAvailability,
  LLMConfigOptions,
  LLMGenerateOptions,
  LLMGenerateTextOptions,
} from "./types";

/**
 * Check if Foundation Models (Apple Intelligence) are enabled and available.
 * Returns a string status: 'available', 'appleIntelligenceNotEnabled', 'modelNotReady', 'unavailable'.
 */
export const isFoundationModelsEnabled =
  async (): Promise<FoundationModelsAvailability> => {
    return AppleLLMModule.isFoundationModelsEnabled();
  };

/**
 * Set up the LLM session with optional instructions
 */
export const configureSession = async (
  options: LLMConfigOptions
): Promise<boolean> => {
  return AppleLLMModule.configureSession(options);
};

/**
 * Generate text using text parameter
 * Now only returns the final result; partials are not supported.
 */
export const generateText = async (
  options: LLMGenerateTextOptions
): Promise<any> => {
  return AppleLLMModule.generateText(options);
};

/**
 * Generate structured output using a JSON shape as the schema
 * Now only returns the final result; partials are not supported.
 */
export const generateStructuredOutput = async (
  options: LLMGenerateOptions
): Promise<any> => {
  return AppleLLMModule.generateStructuredOutput(options);
};

/**
 * Reset the LLM session
 */
export const resetSession = async (): Promise<boolean> => {
  return AppleLLMModule.resetSession();
};

export * from "./types";
