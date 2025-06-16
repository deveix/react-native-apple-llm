# react-native-apple-llm

A React Native plugin for accessing Apple Intelligence Foundation Models (LLM) on supported Apple devices. This module provides a simple interface to check model availability, configure sessions, and generate structured output using Apple LLM APIs.

## Installation

1. Install the package:

```sh
npm install react-native-apple-llm
# or
yarn add react-native-apple-llm
```

2. Link the native module (if not autolinked):

```sh
npx pod-install
```

## API

### Methods

#### `isFoundationModelsEnabled(): Promise<FoundationModelsAvailability>`

Checks if Foundation Models (Apple Intelligence) are enabled and available.
Returns one of:

- `"available"`
- `"appleIntelligenceNotEnabled"`
- `"modelNotReady"`
- `"unavailable"`

#### `configureSession(options: LLMConfigOptions): Promise<boolean>`

Configures the LLM session with optional instructions.

- `options.instructions` (optional): string with system instructions for the session.

#### `generateStructuredOutput(options: LLMGenerateOptions): Promise<any>`

Generates structured output using a JSON schema.

- `options.structure`: Record<string, any> — expected schema shape
- `options.prompt`: string — prompt/question for the LLM

#### `resetSession(): Promise<boolean>`

Resets the LLM session.

### Types

```ts
export interface LLMConfigOptions {
  instructions?: string;
}

export interface LLMGenerateOptions {
  structure: Record<string, any>; // expected schema shape
  prompt: string;
}

export type FoundationModelsAvailability =
  | "available"
  | "appleIntelligenceNotEnabled"
  | "modelNotReady"
  | "unavailable";
```

## Example Usage

```tsx
import {
  isFoundationModelsEnabled,
  configureSession,
  generateStructuredOutput,
} from "react-native-apple-llm";

async function runLLM() {
  try {
    const status = await isFoundationModelsEnabled();
    if (status === "unavailable") {
      console.log("[AppleLLM] Apple Intelligence is not available");
      return;
    }

    await configureSession({
      instructions: "You are a helpful assistant. Return structured JSON.",
    });

    const structure = {
      answer: { type: "string", description: "The answer to the question" },
      confidence: { type: "number", description: "Confidence score" },
    };
    const prompt = "What is the capital of France?";
    const result = await generateStructuredOutput({
      structure,
      prompt,
    });
    console.log("[AppleLLM] Final result:", result);
    /* 
      [AppleLLM] Final result:
      {
        confidence: { value: 1 },
        answer: { value: 'Paris' }
      }
    */
  } catch (err) {
    console.log("[AppleLLM] Error:", err);
  }
}

// Call runLLM() in your component or useEffect
```

## License

MIT
