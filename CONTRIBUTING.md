# Contributing to React Native Apple LLM

Thank you for your interest in contributing to React Native Apple LLM! This document provides guidelines and information for contributors.

## 🎯 Ways to Contribute

- 🐛 **Report bugs** - Help us identify and fix issues
- 💡 **Suggest features** - Propose new functionality or improvements
- 📝 **Improve documentation** - Make our docs clearer and more comprehensive
- 🔧 **Submit code** - Fix bugs, add features, or improve performance
- 🧪 **Add tests** - Help improve test coverage
- 💬 **Help others** - Answer questions in issues and discussions

## 🚀 Getting Started

### Prerequisites

- **macOS** with Xcode 26 beta
- **iOS 26.0 beta** device or simulator with Apple Intelligence
- **React Native** development environment set up

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/react-native-apple-llm.git
   cd react-native-apple-llm
   ```

2. **Install dependencies**

   ```bash
   yarn install
   # or
   npm install
   ```

3. **Install iOS dependencies**

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Build the project**

   ```bash
   yarn build
   ```

### Project Structure

```
react-native-apple-llm/
├── src/                    # TypeScript source code
│   ├── index.tsx          # Main API exports
│   └── types.ts           # Type definitions
├── ios/                   # iOS native implementation
│   ├── AppleLLMModule.swift
│   └── AppleLLMModule.m
├── lib/                   # Built outputs (auto-generated)
├── example/               # Example app (if exists)
└── docs/                  # Documentation
```

## 📝 Development Guidelines

### TypeScript Guidelines

- Use **strict TypeScript** - all types should be properly defined
- Export types from `src/types.ts`
- Use **interface** for object shapes, **type** for unions
- Add JSDoc comments for public APIs

Example:

```typescript
/**
 * Configure the LLM session with system instructions
 * @param options Configuration options including instructions
 * @returns Promise that resolves to success status
 */
export const configureSession = async (
  options: LLMConfigOptions
): Promise<boolean> => {
  return AppleLLMModule.configureSession(options);
};
```

### Swift Guidelines

- Follow **Swift naming conventions**
- Use **@objc** annotations for React Native bridge methods
- Add proper error handling with `reject` callbacks
- Document complex logic with comments

Example:

```swift
@objc(configureSession:resolve:reject:)
func configureSession(
  options: [String: Any],
  resolve: @escaping RCTPromiseResolveBlock,
  reject: @escaping RCTPromiseRejectBlock
) {
  // Implementation
}
```

## 🐛 Reporting Bugs

Before submitting a bug report, please:

1. **Search existing issues** to avoid duplicates
2. **Test on the latest version** to ensure the bug still exists
3. **Provide minimal reproduction** steps

### Bug Report Template

````markdown
**Bug Description**
A clear description of the bug.

**Environment**

- iOS version:
- Xcode version:
- React Native version:
- Package version:
- Device: (iPhone 15 Pro, Simulator, etc.)

**Steps to Reproduce**

1. Step one
2. Step two
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Code Sample**

```typescript
// Minimal code to reproduce the issue
```
````

**Additional Context**
Screenshots, logs, or other helpful information.

````

## 💡 Suggesting Features

We welcome feature suggestions! Please:

1. **Check existing feature requests** first
2. **Explain the use case** and problem you're solving
3. **Provide implementation ideas** if you have them
4. **Consider backwards compatibility**

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature.

**Problem/Use Case**
What problem does this solve? Who would benefit?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other solutions you've considered.

**Implementation Ideas**
Technical approach (if you have ideas).
````

## 🔧 Submitting Code Changes

### Pull Request Process

1. **Create a feature branch** from `main`

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our guidelines

3. **Add tests** for new functionality

4. **Update documentation** if needed

5. **Run the full test suite**

   ```bash
   yarn test
   yarn lint
   yarn build
   ```

6. **Commit with conventional commits**

   ```bash
   git commit -m "feat: add streaming support for text generation"
   ```

7. **Push and create a pull request**

### Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (no functional changes)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:

```bash
feat: add support for streaming responses
fix: resolve session reset memory leak
docs: update installation instructions
test: add unit tests for structured output
```

### Pull Request Template

When you create a PR, please use this template:

```markdown
## Description

Brief description of changes.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] iOS simulator testing
- [ ] Device testing (if applicable)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
```

## 🧪 Testing

### Testing on iOS

1. **Use iOS Simulator** for basic testing
2. **Test on real device** for Apple Intelligence features
3. **Test different iOS versions** when possible
4. **Verify memory usage** for performance

## 📚 Documentation

### Documentation Standards

- Use **clear, concise language**
- Include **code examples** for all APIs
- Add **JSDoc comments** to public methods
- Update **README.md** for new features
- Create **guides** for complex features

### Documentation Checklist

- [ ] API methods documented with examples
- [ ] Type definitions documented
- [ ] README updated if needed
- [ ] Examples added to `/examples` if applicable

## 🚀 Release Process

_Note: This section is for maintainers_

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with changes
3. **Build and test** the package
4. **Create a release** on GitHub
5. **Publish to npm**

## 🤝 Code of Conduct

This project follows a Code of Conduct to ensure a welcoming environment for everyone. Please:

- **Be respectful** and professional
- **Be inclusive** and welcoming to all contributors
- **Focus on constructive feedback**
- **Help others learn and grow**

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and community discussions
- **Twitter/X** - Follow [@aykasem001](https://x.com/aykasem001) for updates

## 🙏 Recognition

Contributors will be:

- **Listed in our README** (if they wish)
- **Mentioned in release notes**
- **Given credit** in commit messages and PRs

Thank you for contributing to React Native Apple LLM! Your help makes this project better for everyone. 🚀
