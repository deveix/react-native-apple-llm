# React Native Apple LLM Plugin

A React Native plugin to access Apple Intelligence Foundation Model framework using native on-device LLM APIs. This module lets you check model availability, create sessions, generate structured outputs (JSON), and generate with tools using Apple's LLMs, all from React Native. **Note that this is a beta feature, so bugs and compatibility issues may rise. Issues are welcome**.

## Features

- **On-device Apple Intelligence** - Access Apple's Foundation Models locally
- **Privacy-focused** - All processing happens on-device, no data sent to servers
- **Structured JSON output** - Generate structured data with JSON schemas
- **Text generation** - Create human-like text responses
- **Session management** - Configure and manage LLM sessions
- **TypeScript support** - Full type safety and IntelliSense
- **Custom tools** - User defined tool-box available for LLM use 

## Requirements

- iOS 26.0
- Xcode 26
- Apple Intelligence enabled device (iPhone 15 Pro, iPhone 16 series, M1+ iPad/Mac) or simulator (MacOS 26 required)

<div align="center">

[![mit licence](https://img.shields.io/dub/l/vibe-d.svg?style=for-the-badge)](https://github.com/deveix/react-native-apple-llm/blob/main/LICENSE.md)
[![npm version](https://img.shields.io/npm/v/react-native-apple-llm?style=for-the-badge)](https://www.npmjs.com/package/react-native-apple-llm)
[![npm downloads](https://img.shields.io/npm/dt/react-native-apple-llm.svg?style=for-the-badge)](https://www.npmjs.org/package/react-native-apple-llm)
[![npm downloads](https://img.shields.io/npm/dm/react-native-apple-llm.svg?style=for-the-badge)](https://www.npmjs.org/package/react-native-apple-llm)

</div>

<a href="https://x.com/aykasem001" target="_blank">
  <img src="https://img.shields.io/badge/Follow_on_X-000000?logo=x&logoColor=white&style=flat-square" alt="Follow on X"/>
</a>

## Installation

1. Install the package:

```sh
npm install react-native-apple-llm
# or
yarn add react-native-apple-llm
# or
pnpm add react-native-apple-llm
```

2. Link the native module (if not autolinked):

```sh
npx pod-install
# or if using CocoaPods directly
cd ios && pod install
```

## Use Cases

This plugin is perfect for building:

- **AI-powered mobile apps** with privacy-first approach
- **Chatbots and virtual assistants** that work offline
- **Content generation tools** for social media and blogs
- **Data extraction and structuring** from user input
- **Smart forms** that auto-fill based on natural language
- **Educational apps** with personalized AI tutoring
- **Accessibility tools** with intelligent text processing

## Quick Start

```tsx
import {
  isFoundationModelsEnabled,
  AppleLLMSession,
} from "react-native-apple-llm";

// Check if Apple Intelligence is available
const checkAvailability = async () => {
  const status = await isFoundationModelsEnabled();
  console.log("Apple Intelligence status:", status);
};

// Generate simple text
const generateSimpleText = async () => {
  const session = new AppleLLMSession();
  await session.configure({
    instructions: "You are a helpful assistant.",
  });

  const response = await session.generateText({
    prompt: "Explain React Native in one sentence",
  });

  console.log(response);
  session.dispose();
};
```
## Tool Usage 

```tsx
import {
  AppleLLMSession,
  ToolDefinition,
  ToolSchema
} from "react-native-apple-llm";

// Define your tools
const weatherSchema: ToolSchema = {
  name: 'weather',
  description: 'Get the current weather in a given location',
  parameters: {
    city: {
      type: 'string',
      description: 'The city to get the weather for',
      name: 'city'
    }
  }
};

const weatherHandler = async (param: any) => {
  return `The weather in ${param.city.value} is severe thunderstorms. Take shelter immediately.`;
};

const weatherTool: ToolDefinition = {
  schema: weatherSchema, 
  handler: weatherHandler
};

// Use with session, don't forget to check availability first like above
const session = new AppleLLMSession();
await session.configure({
  instructions: "You are a helpful assistant.",
}, [weatherTool]);

const response = await session.generateWithTools({
  prompt: "What is the weather in Monrovia, California?",
}); 

console.log(response);
session.dispose();
```

## Streaming

The library supports streaming text generation in two ways, allowing you to display results as they're being generated:

### Method 1: Using `generateTextStream()` with async iteration

```tsx
import { AppleLLMSession } from 'react-native-apple-llm';

const streamExample = async () => {
  const session = new AppleLLMSession();
  await session.configure({
    instructions: 'You are an amazing storyteller.',
  });

  // Use generateTextStream for streaming responses
  const result = await session.generateTextStream({
    prompt: 'Tell me a story (in less than 100 words).',
  });

  // Iterate through the stream chunks
  for await (const chunk of result) {
    console.log(chunk); // Each chunk contains the full response text so far
    // Update your UI with the chunk
  }

  session.dispose();
};
```

### Method 2: Using EventEmitter with `generateText()` or `generateWithTools()`

Both `generateText()` and `generateWithTools()` accept an optional `stream` parameter that receives chunks via events:

```tsx
import { AppleLLMSession } from 'react-native-apple-llm';
import { EventEmitter } from 'events';

const streamWithEventEmitter = async () => {
  const session = new AppleLLMSession();
  await session.configure({
    instructions: 'You are a helpful assistant.',
  });

  // Create an EventEmitter for streaming
  const streamEmitter = new EventEmitter();

  // Listen for data events
  streamEmitter.on('data', (chunk: string) => {
    console.log('Received chunk:', chunk);
    // Update your UI with the chunk
  });

  // Pass the emitter to generateText or generateWithTools
  await session.generateText({
    prompt: 'Explain React Native in detail.',
    stream: streamEmitter,
  });

  session.dispose();
};
```

## TODO

- [ ] Schema as zod
- [ ] Function calling capabilities

## API Reference

### AppleLLMSession Class 

The `AppleLLMSession` class provides context and tool management for each isolated session:

#### Constructor

```tsx
const session = new AppleLLMSession();
```

#### `configure(options: LLMConfigOptions, tools?: ToolDefinition[]): Promise<boolean>`

Configures the session with instructions and optional tools.

```tsx
await session.configure({
  instructions: "You are a helpful assistant.",
}, [weatherTool]);
```

#### `generateText(options: LLMGenerateTextOptions): Promise<any>`

Generates natural text responses.

```tsx
const response = await session.generateText({
  prompt: "Explain React Native",
});
```

#### `generateStructuredOutput(options: LLMGenerateOptions): Promise<any>`

Generates structured JSON output.

```tsx
const data = await session.generateStructuredOutput({
  structure: { name: { type: "string" } },
  prompt: "Extract name from: John Smith",
});
```

#### `generateWithTools(options: LLMGenerateWithToolsOptions): Promise<any>`

Generates text with tool calling capabilities.

```tsx
const response = await session.generateWithTools({
  prompt: "What's the weather like?",
});
```

#### `reset(): Promise<boolean>`

Resets the session state.

```tsx
await session.reset();
```

#### `dispose(): void`

Cleans up resources and event listeners.

```tsx
session.dispose();
```

### Global Functions

#### `isFoundationModelsEnabled(): Promise<FoundationModelsAvailability>`

Checks if Foundation Models (Apple Intelligence) are enabled and available on the device.

**Returns:**

- `"available"` - Apple Intelligence is ready to use
- `"appleIntelligenceNotEnabled"` - User needs to enable Apple Intelligence in Settings
- `"modelNotReady"` - Model is downloading or preparing (or mysterious system issues)
- `"unavailable"` - Device doesn't support Apple Intelligence

```tsx
const status = await isFoundationModelsEnabled();
if (status === "available") {
  // Proceed with LLM operations
}
```

### Legacy Functions (Deprecated)

> **Deprecated**: These functions are maintained for backward compatibility but are deprecated. Use the `AppleLLMSession` class instead for better session management.

#### `configureSession(options: LLMConfigOptions): Promise<boolean>` 

**Deprecated**: Use `AppleLLMSession.configure()` instead.

Configures the LLM session with system instructions and behavior.

```tsx
// Deprecated
await configureSession({
  instructions: "You are an expert React Native developer.",
});

// Recommended
const session = new AppleLLMSession();
await session.configure({
  instructions: "You are an expert React Native developer.",
});
```

#### `generateStructuredOutput(options: LLMGenerateOptions): Promise<any>` 

**Deprecated**: Use `AppleLLMSession.generateStructuredOutput()` instead.

```tsx
// Deprecated
const userInfo = await generateStructuredOutput({
  structure: {
    name: { type: "string", description: "User's full name" },
    age: { type: "number", description: "User's age" },
  },
  prompt: "Extract user information: John is 25 years old",
});

// Recommended
const session = new AppleLLMSession();
await session.configure({ instructions: "Extract user data." });
const userInfo = await session.generateStructuredOutput({
  structure: {
    name: { type: "string", description: "User's full name" },
    age: { type: "number", description: "User's age" },
  },
  prompt: "Extract user information: John is 25 years old",
});
```

#### `generateText(options: LLMGenerateTextOptions): Promise<string>` 

**Deprecated**: Use `AppleLLMSession.generateText()` instead.

```tsx
// Deprecated
const explanation = await generateText({
  prompt: "Explain the benefits of on-device AI processing",
});

// Recommended
const session = new AppleLLMSession();
await session.configure({ instructions: "Be helpful and informative." });
const explanation = await session.generateText({
  prompt: "Explain the benefits of on-device AI processing",
});
```

#### `resetSession(): Promise<boolean>` 

**Deprecated**: Use `AppleLLMSession.reset()` instead.

```tsx
// Deprecated
await resetSession();

// Recommended
await session.reset();
```

### Types

#### StructureProperty

Defines a property in your JSON schema:

```tsx
interface StructureProperty {
  type?: "string" | "integer" | "number" | "boolean" | "object";
  description?: string;
  enum?: string[];
  properties?: StructureSchema;
}
```

#### StructureSchema

A key-value mapping for defining structured output:

```tsx
type StructureSchema = {
  [key: string]: StructureProperty;
};
```

#### Configuration Options

```tsx
interface LLMConfigOptions {
  instructions?: string;
}

interface LLMGenerateOptions {
  structure: StructureSchema;
  prompt: string;
}

interface LLMGenerateTextOptions {
  prompt: string;
}

interface LLMGenerateWithToolsOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  toolTimeout?: number; // in milliseconds
}
```
#### Tool Definition

```tsx
interface ToolSchema {
  name: string;
  description: string;
  parameters: { [key: string]: ToolParameter };
}
interface ToolDefinition {
  handler: (parameters: any) => Promise<any>; // parameter should always look like a json 
  schema: ToolSchema;
}
```

## Troubleshooting

### Common Issues

**Apple Intelligence not available:**

```tsx
const status = await isFoundationModelsEnabled();
if (status === "appleIntelligenceNotEnabled") {
  // Guide user to enable Apple Intelligence in Settings > Apple Intelligence & Siri
}
```

**Model not ready:**

```tsx
if (status === "modelNotReady") {
  // Apple Intelligence is downloading. Ask user to wait and try again. Or double check the device is properly configured
}
```

**Device not supported:**

```tsx
if (status === "unavailable") {
  // Device doesn't support Apple Intelligence. Consider fallback options.
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Clone the repository
2. Install dependencies: `yarn install`
3. Build the project: `yarn build`
4. Link the library: `npm link`
5. Get the example project found [here](https://github.com/ecoArcGaming/foundation-model-react-native-test) (or your own project).
6. Add the library `npm link react-native-apple-llm`   

## License

MIT License - see [LICENSE.md](LICENSE.md) for details.

## Related Projects

- [Apple's Foundation Models Documentation](https://developer.apple.com/documentation/foundationmodels/)
- [React Native Documentation](https://reactnative.dev/)

---

<div align="center">

**Star this repo if you find it helpful!**

Created by [Ahmed Kasem](https://github.com/deveix), [Erik](https://github.com/ecoArcGaming), and future contributors!

</div>
