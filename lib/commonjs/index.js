"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetSession = exports.isFoundationModelsEnabled = exports.generateStructuredOutput = exports.configureSession = void 0;
var _reactNative = require("react-native");
const {
  AppleLLMModule
} = _reactNative.NativeModules;
if (!AppleLLMModule) {
  console.log("AppleLLM native module is not available");
  throw new Error("AppleLLM native module is not available");
}
/**
 * Check if Foundation Models (Apple Intelligence) are enabled and available.
 * Returns a string status: 'available', 'appleIntelligenceNotEnabled', 'modelNotReady', 'unavailable'.
 */
const isFoundationModelsEnabled = async () => {
  return AppleLLMModule.isFoundationModelsEnabled();
};

/**
 * Set up the LLM session with optional instructions
 */
exports.isFoundationModelsEnabled = isFoundationModelsEnabled;
const configureSession = async options => {
  return AppleLLMModule.configureSession(options);
};

/**
 * Generate structured output using a JSON shape as the schema
 * Now only returns the final result; partials are not supported.
 */
exports.configureSession = configureSession;
const generateStructuredOutput = async options => {
  return AppleLLMModule.generateStructuredOutput(options);
};

/**
 * Reset the LLM session
 */
exports.generateStructuredOutput = generateStructuredOutput;
const resetSession = async () => {
  return AppleLLMModule.resetSession();
};
exports.resetSession = resetSession;
//# sourceMappingURL=index.js.map