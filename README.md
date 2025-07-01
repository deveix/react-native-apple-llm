# React Native Apple LLM Plugin

A React Native plugin to access Apple Intelligence Foundation Models using native on-device LLM APIs. This module lets you check model availability, create sessions, generate structured outputs (JSON), and text using Apple's LLMs, all from React Native.

## 🚀 Features

- **On-device Apple Intelligence** - Access Apple's Foundation Models locally
- **Privacy-focused** - All processing happens on-device, no data sent to servers
- **Structured JSON output** - Generate structured data with JSON schemas
- **Text generation** - Create human-like text responses
- **Session management** - Configure and manage LLM sessions
- **TypeScript support** - Full type safety and IntelliSense
- **iOS 18+ support** - Works with latest Apple Intelligence features
- **React Native 0.70+** - Compatible with modern React Native versions

## 📱 Requirements

- iOS 26.0
- Xcode 26
- Apple Intelligence enabled device (iPhone 15 Pro, iPhone 16 series, M1+ iPad/Mac)

<a href="https://x.com/aykasem001" target="_blank">
  <img src="https://img.shields.io/badge/Follow_on_X-000000?logo=x&logoColor=white&style=flat-square" alt="Follow on X"/>
</a>

<div align="center">

[![mit licence](https://img.shields.io/dub/l/vibe-d.svg?style=for-the-badge)](https://github.com/deveix/react-native-apple-llm/blob/main/LICENSE.md)
[![npm version](https://img.shields.io/npm/v/react-native-apple-llm?style=for-the-badge)](https://www.npmjs.com/package/react-native-apple-llm)
[![npm downloads](https://img.shields.io/npm/dt/react-native-apple-llm.svg?style=for-the-badge)](https://www.npmjs.org/package/react-native-apple-llm)
[![npm downloads](https://img.shields.io/npm/dm/react-native-apple-llm.svg?style=for-the-badge)](https://www.npmjs.org/package/react-native-apple-llm)

</div>

## 📦 Installation

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

## 🎯 Use Cases

This plugin is perfect for building:

- **AI-powered mobile apps** with privacy-first approach
- **Chatbots and virtual assistants** that work offline
- **Content generation tools** for social media and blogs
- **Data extraction and structuring** from user input
- **Smart forms** that auto-fill based on natural language
- **Educational apps** with personalized AI tutoring
- **Accessibility tools** with intelligent text processing

## 🚀 Quick Start

```tsx
import {
  isFoundationModelsEnabled,
  configureSession,
  generateText,
} from "react-native-apple-llm";

// Check if Apple Intelligence is available
const checkAvailability = async () => {
  const status = await isFoundationModelsEnabled();
  console.log("Apple Intelligence status:", status);
};

// Generate simple text
const generateSimpleText = async () => {
  await configureSession({
    instructions: "You are a helpful assistant.",
  });

  const response = await generateText({
    prompt: "Explain React Native in one sentence",
  });

  console.log(response);
};
```

## 📋 TODO

- [ ] Streaming support using `Event Emitters`
- [ ] Tool creation and invocation support
- [ ] Schema as zod
- [ ] Image input support for multimodal interactions
- [ ] Function calling capabilities
- [ ] Custom model fine-tuning integration

## 📚 API Reference

### Methods

#### `isFoundationModelsEnabled(): Promise<FoundationModelsAvailability>`

Checks if Foundation Models (Apple Intelligence) are enabled and available on the device.

**Returns:**

- `"available"` - Apple Intelligence is ready to use
- `"appleIntelligenceNotEnabled"` - User needs to enable Apple Intelligence in Settings
- `"modelNotReady"` - Model is downloading or preparing
- `"unavailable"` - Device doesn't support Apple Intelligence

```tsx
const status = await isFoundationModelsEnabled();
if (status === "available") {
  // Proceed with LLM operations
}
```

#### `configureSession(options: LLMConfigOptions): Promise<boolean>`

Configures the LLM session with system instructions and behavior.

**Parameters:**

- `options.instructions` (optional): System instructions that guide the LLM's behavior

```tsx
await configureSession({
  instructions:
    "You are an expert React Native developer. Provide concise, practical answers.",
});
```

#### `generateStructuredOutput(options: LLMGenerateOptions): Promise<any>`

Generates structured output using a JSON schema. Perfect for extracting data, creating forms, or building structured responses.

**Parameters:**

- `options.structure`: JSON schema defining the expected output structure
- `options.prompt`: The prompt/question for the LLM

```tsx
const userInfo = await generateStructuredOutput({
  structure: {
    name: { type: "string", description: "User's full name" },
    age: { type: "number", description: "User's age" },
    interests: {
      type: "object",
      properties: {
        hobbies: { type: "string" },
        skills: { type: "string" },
      },
    },
  },
  prompt:
    "Extract user information: John is 25 years old and loves programming and photography",
});
```

#### `generateText(options: LLMGenerateTextOptions): Promise<string>`

Generates natural text responses from the LLM.

**Parameters:**

- `options.prompt`: The prompt/question for the LLM

**Returns:** Generated text as a string

```tsx
const explanation = await generateText({
  prompt: "Explain the benefits of on-device AI processing",
});
```

#### `resetSession(): Promise<boolean>`

Resets the current LLM session, clearing any previous context or instructions.

```tsx
await resetSession();
// Session is now fresh and ready for new instructions
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
```

## 💡 Advanced Examples

### Building a Smart Recipe Parser

```tsx
const parseRecipe = async (recipeText: string) => {
  await configureSession({
    instructions:
      "Extract recipe information accurately. Focus on ingredients and steps.",
  });

  const recipe = await generateStructuredOutput({
    structure: {
      title: { type: "string", description: "Recipe name" },
      servings: { type: "number", description: "Number of servings" },
      ingredients: {
        type: "object",
        properties: {
          list: { type: "string", description: "Comma-separated ingredients" },
        },
      },
      instructions: {
        type: "object",
        properties: {
          steps: {
            type: "string",
            description: "Step-by-step cooking instructions",
          },
        },
      },
      cookingTime: { type: "string", description: "Total cooking time" },
    },
    prompt: `Extract recipe details from: ${recipeText}`,
  });

  return recipe;
};
```

### Creating an AI Writing Assistant

```tsx
const improveWriting = async (text: string, style: string) => {
  await configureSession({
    instructions: `You are a professional writing coach. Improve text while maintaining the author's voice.`,
  });

  const improved = await generateText({
    prompt: `Improve this text in a ${style} style: "${text}"`,
  });

  return improved;
};
```

### Building a Data Extraction Tool

```tsx
const extractContactInfo = async (businessCard: string) => {
  const contactInfo = await generateStructuredOutput({
    structure: {
      name: { type: "string", description: "Full name" },
      company: { type: "string", description: "Company name" },
      email: { type: "string", description: "Email address" },
      phone: { type: "string", description: "Phone number" },
      address: { type: "string", description: "Business address" },
      website: { type: "string", description: "Website URL" },
    },
    prompt: `Extract contact information from this business card: ${businessCard}`,
  });

  return contactInfo;
};
```

## 🔒 Privacy & Security

- **100% On-device processing** - No data leaves your device
- **No internet required** - Works completely offline
- **Apple's privacy standards** - Built on Apple's privacy-first architecture
- **No tracking or analytics** - This plugin doesn't collect any user data
- **Secure by design** - Leverages iOS security and sandboxing

## 🛠️ Troubleshooting

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
  // Apple Intelligence is downloading. Ask user to wait and try again.
}
```

**Device not supported:**

```tsx
if (status === "unavailable") {
  // Device doesn't support Apple Intelligence. Consider fallback options.
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Clone the repository
2. Install dependencies: `yarn install`
3. Build the project: `yarn build`
4. Run tests: `yarn test`

## 📄 License

MIT License - see [LICENSE.md](LICENSE.md) for details.

## 🔗 Related Projects

- [Apple's Foundation Models Documentation](https://developer.apple.com/machine-learning/)
- [React Native Documentation](https://reactnative.dev/)
- [Apple Intelligence Overview](https://www.apple.com/apple-intelligence/)

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and updates.

---

<div align="center">

**Star ⭐ this repo if you find it helpful!**

Made with ❤️ by [Ahmed Kasem](https://github.com/deveix)

</div>
