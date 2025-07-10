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
  GenerateWithToolsResponse,
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
 * Set up the LLM session with optional instructions and tools
 */
export const configureSession = async (
  options: LLMConfigOptions
): Promise<boolean> => {
  // Register tools if provided
  if (options.tools) {
    await Promise.all(options.tools.map(async (tool) => {
      await AppleLLMModule.registerTool(tool);
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
  return AppleLLMModule.resetSession();
};

// Tool handling
const toolHandlers = new Map<string, (parameters: any) => Promise<any>>();

/**
 * Register a tool that can be called by the LLM
 */
export const registerTool = async (
  toolDefinition: ToolDefinition,
  handler: (parameters: any) => Promise<any>
): Promise<boolean> => {
  // Store the handler for later execution
  toolHandlers.set(toolDefinition.name, handler);
  
  // Register the tool definition with the native module
  return AppleLLMModule.registerTool(toolDefinition);
};

/**
 * Generate text with tool calling capabilities
 */
export const generateWithTools = async (
  options: LLMGenerateWithToolsOptions
): Promise<GenerateWithToolsResponse> => {
  // Set up tool invocation listener
  const subscription = eventEmitter.addListener(
    'ToolInvocation',
    async (event: { name: string; id: string; parameters: any }) => {
      try {
        const handler = toolHandlers.get(event.name);
        if (!handler) {
          await AppleLLMModule.handleToolResult({
            id: event.id,
            success: false,
            error: `No handler registered for tool: ${event.name}`,
          });
          return;
        }
        
        const result = await handler(event.parameters);
        
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
  
  try {
    // Register all tools first if provided
    if (options.tools) {
      for (const tool of options.tools) {
        await AppleLLMModule.registerTool(tool);
      }
    }
    
    // Generate with tools
    const result = await AppleLLMModule.generateWithTools(options);
    return result;
  } finally {
    // Clean up listener
    subscription.remove();
  }
};

/**
 * Unregister a tool
 */
export const unregisterTool = (toolName: string): void => {
  toolHandlers.delete(toolName);
};

/**
 * Get all registered tool names
 */
export const getRegisteredTools = (): string[] => {
  return Array.from(toolHandlers.keys());
};

export * from "./types";
