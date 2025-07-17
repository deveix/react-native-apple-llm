import { NativeModules, NativeEventEmitter } from "react-native";
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
 * Class-based session management for Apple LLM
 */
export class AppleLLMSession {
  toolHandlers = new Map();
  isConfigured = false;
  constructor() {
    this.eventEmitter = new NativeEventEmitter(AppleLLMModule);
  }

  /**
   * Configure the session with options and tools
   */
  async configure(options, tools) {
    // Clear existing tools
    this.toolHandlers.clear();

    // Register new tools
    if (tools) {
      await Promise.all(tools.map(async tool => {
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
  async generateText(options) {
    this.ensureConfigured();
    return AppleLLMModule.generateText(options);
  }

  /**
   * Generate structured output using a JSON shape as the schema
   */
  async generateStructuredOutput(options) {
    this.ensureConfigured();
    return AppleLLMModule.generateStructuredOutput(options);
  }

  /**
   * Generate text with tool calling capabilities
   */
  async generateWithTools(options) {
    this.ensureConfigured();

    // Clean up any existing listener
    if (this.activeToolListener) {
      this.activeToolListener.remove();
    }

    // Set up tool call listener
    this.activeToolListener = this.eventEmitter.addListener('ToolInvocation', async event => {
      try {
        const handler = this.toolHandlers.get(event.name);
        if (!handler) {
          await AppleLLMModule.handleToolResult({
            id: event.id,
            success: false,
            error: `No handler registered for tool: ${event.name}`
          });
          return;
        }
        const result = await handler(event.parameters);
        await AppleLLMModule.handleToolResult({
          id: event.id,
          success: true,
          result
        });
      } catch (error) {
        await AppleLLMModule.handleToolResult({
          id: event.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
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
  async registerTool(toolDefinition) {
    // Map the name to the handler
    this.toolHandlers.set(toolDefinition.schema.name, toolDefinition.handler);

    // Register the tool definition with the native module
    return AppleLLMModule.registerTool(toolDefinition.schema);
  }

  /**
   * Reset the session
   */
  async reset() {
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
  dispose() {
    this.toolHandlers.clear();
    if (this.activeToolListener) {
      this.activeToolListener.remove();
      this.activeToolListener = undefined;
    }
    this.isConfigured = false;
  }
  ensureConfigured() {
    if (!this.isConfigured) {
      throw new Error('Session must be configured before use. Call configure() first.');
    }
  }
}

// Backward compatibility - global instance
let defaultSession = null;

/**
 * Get or create the default session instance
 */
const getDefaultSession = () => {
  if (!defaultSession) {
    defaultSession = new AppleLLMSession();
  }
  return defaultSession;
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
export const configureSession = async (options, tools) => {
  return getDefaultSession().configure(options, tools);
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
export const generateText = async options => {
  return getDefaultSession().generateText(options);
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
export const generateStructuredOutput = async options => {
  return getDefaultSession().generateStructuredOutput(options);
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
export const generateWithTools = async options => {
  return getDefaultSession().generateWithTools(options);
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
export const resetSession = async () => {
  return getDefaultSession().reset();
};
export * from "./types";
//# sourceMappingURL=index.js.map