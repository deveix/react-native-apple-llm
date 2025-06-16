import { NativeModules } from "react-native";
const {
  AppleLLMModule
} = NativeModules;
if (!AppleLLMModule) {
  console.log("AppleLLM native module is not available");
  throw new Error("AppleLLM native module is not available");
}
/**
 * Check if Foundation Models (Apple Intelligence) are enabled and available.
 * Returns a string status: 'available', 'appleIntelligenceNotEnabled', 'modelNotReady', 'unavailable'.
 */
export const isFoundationModelsEnabled = async () => {
  return AppleLLMModule.isFoundationModelsEnabled();
};

/**
 * Set up the LLM session with optional instructions
 */
export const configureSession = async options => {
  return AppleLLMModule.configureSession(options);
};

/**
 * Generate structured output using a JSON shape as the schema
 * Now only returns the final result; partials are not supported.
 */
export const generateStructuredOutput = async options => {
  return AppleLLMModule.generateStructuredOutput(options);
};

/**
 * Reset the LLM session
 */
export const resetSession = async () => {
  return AppleLLMModule.resetSession();
};
//# sourceMappingURL=index.js.map