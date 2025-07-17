import { NativeModules, NativeEventEmitter } from "react-native";

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
 * Class-based session management for Apple LLM
 */
export class AppleLLMSession {
  private toolHandlers = new Map<string, (parameters: any) => Promise<any>>();
  private eventEmitter: NativeEventEmitter;
  private isConfigured = false;
  private activeToolListener?: any;

  constructor() {
    this.eventEmitter = new NativeEventEmitter(AppleLLMModule);
  }

  /**
   * Configure the session with options and tools
   */
  async configure(
    options: LLMConfigOptions,
    tools?: ToolDefinition[]
  ): Promise<boolean> {
    // Clear existing tools
    this.toolHandlers.clear();
    
    // Register new tools
    if (tools) {
      await Promise.all(tools.map(async (tool) => {
        await this.registerTool(tool);
      }));
    }

    const success = await AppleLLMModule.configureSession(options);
    this.isConfigured = success;
    return success;
  }

  /**
   * Generate text using text parameter
   */
  async generateText(options: LLMGenerateTextOptions): Promise<any> {
    this.ensureConfigured();
    return AppleLLMModule.generateText(options);
  }

  /**
   * Generate structured output using a JSON shape as the schema
   */
  async generateStructuredOutput(options: LLMGenerateOptions): Promise<any> {
    this.ensureConfigured();
    return AppleLLMModule.generateStructuredOutput(options);
  }

  /**
   * Generate text with tool calling capabilities
   */
  async generateWithTools(options: LLMGenerateWithToolsOptions): Promise<any> {
    this.ensureConfigured();
    
    // Clean up any existing listener
    if (this.activeToolListener) {
      this.activeToolListener.remove();
    }

    // Set up tool call listener
    this.activeToolListener = this.eventEmitter.addListener(
      'ToolInvocation',
      async (event: { name: string; id: string; parameters: any }) => {
        try {
          const handler = this.toolHandlers.get(event.name);
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
      const result = await AppleLLMModule.generateWithTools(options);
      return result;
    } finally {
      // Clean up listener
      if (this.activeToolListener) {
        this.activeToolListener.remove();
        this.activeToolListener = undefined;
      }
    }
  }

  /**
   * Register a tool that can be called by the LLM
   */
  private async registerTool(toolDefinition: ToolDefinition): Promise<boolean> {
    // Map the name to the handler
    this.toolHandlers.set(toolDefinition.schema.name, toolDefinition.handler);
    
    // Register the tool definition with the native module
    return AppleLLMModule.registerTool(toolDefinition.schema);
  }

  /**
   * Reset the session
   */
  async reset(): Promise<boolean> {
    this.toolHandlers.clear();
    this.isConfigured = false;
    
    // Clean up any active listeners
    if (this.activeToolListener) {
      this.activeToolListener.remove();
      this.activeToolListener = undefined;
    }

    return AppleLLMModule.resetSession();
  }

  /**
   * Dispose of the session and clean up resources
   */
  dispose(): void {
    this.toolHandlers.clear();
    if (this.activeToolListener) {
      this.activeToolListener.remove();
      this.activeToolListener = undefined;
    }
    this.isConfigured = false;
  }

  private ensureConfigured(): void {
    if (!this.isConfigured) {
      throw new Error('Session must be configured before use. Call configure() first.');
    }
  }
}

// Backward compatibility - global instance
let defaultSession: AppleLLMSession | null = null;

/**
 * Get or create the default session instance
 */
const getDefaultSession = (): AppleLLMSession => {
  if (!defaultSession) {
    defaultSession = new AppleLLMSession();
  }
  return defaultSession;
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
export const configureSession = async (
  options: LLMConfigOptions,
  tools?: ToolDefinition[]
): Promise<boolean> => {
  return getDefaultSession().configure(options, tools);
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
export const generateText = async (
  options: LLMGenerateTextOptions
): Promise<any> => {
  return getDefaultSession().generateText(options);
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
export const generateStructuredOutput = async (
  options: LLMGenerateOptions
): Promise<any> => {
  return getDefaultSession().generateStructuredOutput(options);
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
export const generateWithTools = async (
  options: LLMGenerateWithToolsOptions
): Promise<any> => {
  return getDefaultSession().generateWithTools(options);
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
export const resetSession = async (): Promise<boolean> => {
  return getDefaultSession().reset();
};

export * from "./types";
