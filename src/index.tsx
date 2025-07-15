import { NativeModules, NativeEventEmitter } from "react-native";

const { AppleLLMModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(AppleLLMModule);

if (!AppleLLMModule) {
  console.log("AppleLLM native module is not available");
  throw new Error("AppleLLM native module is not available");
}
import {
  FoundationModelsAvailability,
  LLMConfigOptions,
  LLMGenerateOptions,
  LLMGenerateTextOptions,
  LLMGenerateWithToolsOptions,
  ToolDefinition,
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
 * Set up the LLM session 
 */
export const configureSession = async (
  options: LLMConfigOptions,
  tools?: ToolDefinition[]
): Promise<boolean> => {
  if (tools) {
    await Promise.all(tools.map(async (tool) => {
      await registerTool(tool);
    }));
  }
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
  toolHandlers.clear();
  return AppleLLMModule.resetSession();
};

// Tool handling
const toolHandlers = new Map<string, (parameters: any) => Promise<any>>();

/**
 * Register a tool that can be called by the LLM
 */
const registerTool = async (
  toolDefinition: ToolDefinition,
): Promise<boolean> => {
  // map the name to the handler 
  toolHandlers.set(toolDefinition.schema.name, toolDefinition.handler);
  
  // Register the tool definition with the native module
  return AppleLLMModule.registerTool(toolDefinition.schema);
};

/**
 * Generate text with tool calling capabilities
 */
export const generateWithTools = async (
  options: LLMGenerateWithToolsOptions
): Promise<any> => {

  // start listening for tool calls
  const subscription = eventEmitter.addListener(
    'ToolInvocation',
    async (event: { name: string; id: string; parameters: any }) => {
      try {
        const handler = toolHandlers.get(event.name);
        if (!handler) { // fail fast if no handler is registered 
          await AppleLLMModule.handleToolResult({
            id: event.id,
            success: false,
            error: `No handler registered for tool: ${event.name}`,
          });
          return;
        }
        
        const result = await handler(event.parameters); // event.parameters is json style
        
        await AppleLLMModule.handleToolResult({
          id: event.id,
          success: true,
          result,
        });
      } catch (error) {
        await AppleLLMModule.handleToolResult({
          id: event.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  // generate with tools
  const result = await AppleLLMModule.generateWithTools(options);
  subscription.remove(); // clean up listener 
  return result;
};


export * from "./types";
