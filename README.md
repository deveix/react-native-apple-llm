<a href="https://x.com/aykasem001" target="_blank">
  <img src="https://img.shields.io/badge/Follow_on_X-000000?logo=x&logoColor=white&style=flat-square" alt="Follow on X"/>
</a>

# React Native Apple LLM Plugin

A React Native Apple Intelligence plugin (LLM) for accessing Foundation Models on supported Apple devices. This plugin provides a simple interface to check model availability, configure sessions, and generate structured output using Apple LLM APIs.

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

#### Structure Property Fields

| Field         | Type                                                         | Description                                       |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| `type`        | `"string" \| "integer" \| "number" \| "boolean" \| "object"` | Optional. Defines the data type of the property   |
| `description` | `string`                                                     | Optional. Provides description for the property   |
| `enum`        | `string[]`                                                   | Optional. List of allowed values for the property |
| `properties`  | `StructureSchema`                                            | Optional. Nested structure for object types       |

#### Configuration Options

| Interface            | Field          | Type              | Description                                   |
| -------------------- | -------------- | ----------------- | --------------------------------------------- |
| `LLMConfigOptions`   | `instructions` | `string`          | Optional. System instructions for the session |
| `LLMGenerateOptions` | `structure`    | `StructureSchema` | Schema defining the expected output structure |
| `LLMGenerateOptions` | `prompt`       | `string`          | The prompt/question for the LLM               |

Where `StructureSchema` is a key-value mapping where each value is a `StructureProperty`:

```ts
type StructureSchema = {
  [key: string]: StructureProperty;
};
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
```

## TODO

- [ ] Streaming support using `Event Emitters`
- [ ] Tool creation and invocation support
- [ ] Schema as zod

## License

MIT
