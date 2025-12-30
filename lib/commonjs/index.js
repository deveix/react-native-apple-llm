"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  isFoundationModelsEnabled: true,
  AppleLLMSession: true,
  configureSession: true,
  generateText: true,
  generateStructuredOutput: true,
  generateWithTools: true,
  resetSession: true
};
exports.resetSession = exports.isFoundationModelsEnabled = exports.generateWithTools = exports.generateText = exports.generateStructuredOutput = exports.configureSession = exports.AppleLLMSession = void 0;
var _reactNative = require("react-native");
var _events = require("events");
var _types = require("./types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
const {
  AppleLLMModule
} = _reactNative.NativeModules;
if (!AppleLLMModule) {
  console.log('AppleLLM native module is not available');
  throw new Error('AppleLLM native module is not available');
}
/**
 * Check if Foundation Models (Apple Intelligence) are enabled and available.
 * Returns a string status: 'available', 'appleIntelligenceNotEnabled', 'modelNotReady', 'unavailable'.
 */
const isFoundationModelsEnabled = async () => {
  return AppleLLMModule.isFoundationModelsEnabled();
};

/**
 * Class-based session management for Apple LLM
 */
exports.isFoundationModelsEnabled = isFoundationModelsEnabled;
class AppleLLMSession {
  toolHandlers = new Map();
  isConfigured = false;
  constructor() {
    this.eventEmitter = new _reactNative.NativeEventEmitter(AppleLLMModule);
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
    const listener = this.eventEmitter.addListener('TextGenerationChunk', _event => {
      // Chunks are emitted via events for the stream to consume
      const stream = options.stream;
      if (stream) stream.emit('data', _event.chunk);
    });
    try {
      const result = await AppleLLMModule.generateText({
        prompt: options.prompt,
        stream: options.stream
      });
      return result;
    } finally {
      listener.remove();
    }
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

    // Set up streaming listener if stream is provided
    const streamListener = options.stream ? this.eventEmitter.addListener('TextGenerationChunk', _event => {
      const stream = options.stream;
      if (stream) stream.emit('data', _event.chunk);
    }) : null;

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
      // Clean up listeners
      if (streamListener) {
        streamListener.remove();
      }
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

  /**
   * Generate text as a ReadableStream
   */
  generateTextStream(options) {
    this.ensureConfigured();
    return new ReadableStream({
      start: async controller => {
        const streamEmitter = new _events.EventEmitter();
        streamEmitter.on('data', chunk => {
          controller.enqueue(chunk);
        });
        const listener = this.eventEmitter.addListener('TextGenerationChunk', event => {
          streamEmitter.emit('data', event.chunk);
        });
        try {
          await AppleLLMModule.generateText({
            prompt: options.prompt,
            stream: streamEmitter
          });
          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          listener.remove();
          streamEmitter.removeAllListeners();
        }
      }
    });
  }
  ensureConfigured() {
    if (!this.isConfigured) {
      throw new Error('Session must be configured before use. Call configure() first.');
    }
  }
}

// Backward compatibility - global instance
exports.AppleLLMSession = AppleLLMSession;
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
const configureSession = async (options, tools) => {
  return getDefaultSession().configure(options, tools);
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
exports.configureSession = configureSession;
const generateText = async options => {
  return getDefaultSession().generateText(options);
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
exports.generateText = generateText;
const generateStructuredOutput = async options => {
  return getDefaultSession().generateStructuredOutput(options);
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
exports.generateStructuredOutput = generateStructuredOutput;
const generateWithTools = async options => {
  return getDefaultSession().generateWithTools(options);
};

/**
 * @deprecated Use AppleLLMSession class instead
 */
exports.generateWithTools = generateWithTools;
const resetSession = async () => {
  return getDefaultSession().reset();
};
exports.resetSession = resetSession;
//# sourceMappingURL=index.js.map