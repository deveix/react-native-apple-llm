//  AppleLLMModule.swift
//  react-native-apple-llm
//
//  Created by Ahmed Kasem on 16/06/25.

import Foundation
import React

#if canImport(FoundationModels)
  import FoundationModels
#endif

@available(iOS 26, *)
class BridgeTool: Tool, @unchecked Sendable {

  typealias Arguments = GeneratedContent

  let name: String
  let description: String
  let schema: GenerationSchema
  private weak var module: NativeAppleLLMModule?

  var parameters: GenerationSchema {
    return schema
  }

  init(
    name: String, description: String, parameters: [String: [String: Any]],
    module: NativeAppleLLMModule
  ) {
    self.name = name
    self.description = description
    self.module = module

    let rootSchema = module.dynamicSchema(from: parameters, name: name)
    self.schema = try! GenerationSchema(root: rootSchema, dependencies: [])
  }

  func call(arguments: GeneratedContent) async throws -> GeneratedContent {
    guard let module = module else {
      throw NSError(
        domain: "BridgeToolError", code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Module reference lost"])
    }

    let invocationArgs = try module.flattenGeneratedContent(arguments) as? [String: Any] ?? [:]

    let id = UUID().uuidString
    return GeneratedContent(
      try await module.invokeTool(name: name, id: id, parameters: invocationArgs))
  }
}

@objc(NativeAppleLLMModule)
@available(iOS 26, *)
@objcMembers
public class NativeAppleLLMModule: NSObject {

  @nonobjc private var session: LanguageModelSession?
  @nonobjc private var registeredTools: [String: BridgeTool] = [:]
  @nonobjc private var toolHandlers: [String: (String, [String: Any]) -> Void] = [:]
  @nonobjc private var toolTimeout: Int = 30000

  // Event emitter callbacks
  @nonobjc private var onTextGenerationChunk: ((NSDictionary) -> Void)?
  @nonobjc private var onToolInvocation: ((NSDictionary) -> Void)?

  public init(
    onTextGenerationChunk: @escaping (NSDictionary) -> Void,
    onToolInvocation: @escaping (NSDictionary) -> Void
  ) {
    self.onTextGenerationChunk = onTextGenerationChunk
    self.onToolInvocation = onToolInvocation
    super.init()
  }

  public func isFoundationModelsEnabled(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    #if canImport(FoundationModels)
      if #available(iOS 26, *) {
        // SystemLanguageModel is available in FoundationModels
        let model = SystemLanguageModel.default
        switch model.availability {
        case .available:
          resolve("available")
        case .unavailable(.appleIntelligenceNotEnabled):
          resolve("appleIntelligenceNotEnabled")
        case .unavailable(.modelNotReady):
          resolve("modelNotReady")
        default:
          resolve("unavailable")
        }
      } else {
        resolve("unavailable")
      }
    #else
      resolve("unavailable")
    #endif
  }

  public func configureSession(
    _ config: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let model = SystemLanguageModel.default
    if model.availability != .available {
      reject("UNAVAILABLE", "Foundation Models are not available", nil)
      return
    }
    let instructions = Instructions {
      if let prompt = config["instructions"] as? String {
        prompt
      } else {
        "You are a helpful assistant that returns structured JSON data based on a given schema."
      }
    }

    let tools = Array(self.registeredTools.values)
    self.session = LanguageModelSession(tools: tools, instructions: instructions)
    resolve(true)
  }

  // Generables for Premitives
  @Generable
  struct GenerableString: Codable {
    @Guide(description: "A string value")
    var value: String
  }

  @Generable
  struct GenerableInt: Codable {
    @Guide(description: "An integer value")
    var value: Int
  }

  @Generable
  struct GenerableNumber: Codable {
    @Guide(description: "A floating-point number")
    var value: Double
  }

  @Generable
  struct GenerableBool: Codable {
    @Guide(description: "A boolean value")
    var value: Bool
  }

  func dynamicSchema(from json: [String: Any], name: String = "Root") -> DynamicGenerationSchema {
    var properties: [DynamicGenerationSchema.Property] = []

    for (key, raw) in json {
      guard let field = raw as? [String: Any] else { continue }
      let type = field["type"] as? String
      let description = field["description"] as? String
      let enumValues = field["enum"] as? [String]

      var childProperty: DynamicGenerationSchema.Property

      if let enumValues = enumValues {
        let childSchema = DynamicGenerationSchema(
          name: key,
          description: description,
          anyOf: enumValues
        )
        childProperty = DynamicGenerationSchema.Property(
          name: key, description: description, schema: childSchema)
      } else if type == "object", let nested = field["properties"] as? [String: Any] {
        let nestedSchema = dynamicSchema(from: nested, name: key)
        childProperty = DynamicGenerationSchema.Property(
          name: key, description: description, schema: nestedSchema)
      }
      // TODO: handle array?
      else {
        childProperty = schemaForType(name: key, type: type ?? "string", description: description)
      }

      properties.append(childProperty)
    }

    return DynamicGenerationSchema(name: name, properties: properties)
  }

  private func schemaForType(name: String, type: String, description: String? = nil)
    -> DynamicGenerationSchema.Property {
    return schemaForPrimitiveType(name: name, type: type, description: description)
  }

  private func schemaForPrimitiveType(
    name: String,
    type: String,
    description: String? = nil
  ) -> DynamicGenerationSchema.Property {
    let schema: DynamicGenerationSchema

    switch type {
    case "string":
      schema = DynamicGenerationSchema(
        type: GenerableString.self,
      )
    case "integer":
      schema = DynamicGenerationSchema(
        type: GenerableInt.self,
      )
    case "number":
      schema = DynamicGenerationSchema(
        type: GenerableNumber.self,
      )
    case "boolean":
      schema = DynamicGenerationSchema(
        type: GenerableBool.self,
      )
    default:
      schema = DynamicGenerationSchema(
        type: GenerableString.self,
      )
    }

    return DynamicGenerationSchema.Property(
      name: name,
      description: description,
      schema: schema
    )
  }
  func flattenGeneratedContent(_ content: GeneratedContent) throws -> Any {
    // Try extracting known primitive types
    if let stringVal = try? content.value(String.self) {
      return stringVal
    }
    if let intVal = try? content.value(Int.self) {
      return intVal
    }
    if let doubleVal = try? content.value(Double.self) {
      return doubleVal
    }
    if let boolVal = try? content.value(Bool.self) {
      return boolVal
    }

    if let jsonString = content.jsonString.data(using: .utf8) {
      if let dict = try? JSONSerialization.jsonObject(with: jsonString) as? [String: Any] {
        return dict
      }
    }

    return "failed to parse content"
  }

  public func generateStructuredOutput(
    _ options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let session = session else {
      reject("SESSION_NOT_CONFIGURED", "Call configureSession first", nil)
      return
    }

    guard let schema = options["structure"] as? [String: Any] else {
      reject("INVALID_INPUT", "Missing 'structure' field", nil)
      return
    }

    guard let prompt = options["prompt"] as? String else {
      reject("INVALID_INPUT", "Missing 'prompt' field", nil)
      return
    }
    let _dynamicSchema: GenerationSchema
    do {
      _dynamicSchema = try GenerationSchema(root: dynamicSchema(from: schema), dependencies: [])
    } catch {
      reject(
        "GENERATION_SCHEMA_ERROR", "Failed to create schema: \(error.localizedDescription)", error)
      return
    }

    Task {
      do {
        let result = try await session.respond(
          to: prompt,
          schema: _dynamicSchema,
          includeSchemaInPrompt: false,
          options: GenerationOptions(sampling: .greedy)
        )
        print("result: \((result.content))")
        let flattened = try flattenGeneratedContent(result.content)
        resolve(flattened)

      } catch {
        reject(
          "GENERATION_FAILED", "Failed to generate output: \(error.localizedDescription)", error)
      }
    }
  }

  public func generateText(
    _ options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let session = session else {
      reject("SESSION_NOT_CONFIGURED", "Call configureSession first", nil)
      return
    }

    guard let prompt = options["prompt"] as? String else {
      reject("INVALID_INPUT", "Missing 'prompt' field", nil)
      return
    }

    let shouldStream = options["shouldStream"] != nil

    Task {
      do {
        let stream = session.streamResponse(
          to: prompt,
          options: GenerationOptions(sampling: .greedy)
        )

        var fullContent = ""
        for try await snapshot in stream {
          let chunk = snapshot.content
          fullContent = chunk

          if shouldStream {
            DispatchQueue.main.async {
              self.onTextGenerationChunk?([
                "chunk": chunk
              ])
            }
          }
        }

        print("result: \(fullContent)")
        resolve(fullContent)

      } catch let error {
        let errorMessage = handleGeneratedError(error as! LanguageModelSession.GenerationError)
        reject(
          "GENERATION_FAILED", errorMessage, error)
      }
    }
  }

  public func registerTool(
    _ toolDefinition: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let name = toolDefinition["name"] as? String,
      let description = toolDefinition["description"] as? String,
      let parameters = toolDefinition["parameters"] as? [String: [String: Any]]
    else {
      reject("INVALID_TOOL_DEFINITION", "Invalid tool definition structure", nil)
      return
    }

    let bridgeTool = BridgeTool(
      name: name,
      description: description,
      parameters: parameters,
      module: self
    )

    registeredTools[name] = bridgeTool
    resolve(true)
  }

  public func handleToolResult(
    _ result: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let id = result["id"] as? String else {
      reject("INVALID_RESULT", "Missing tool call id", nil)
      return
    }

    // here we call handler and remove from pending
    if let handler = toolHandlers[id] {
      handler(id, result as! [String: Any])
      toolHandlers.removeValue(forKey: id)  // remove from pending
    }

    resolve(true)
  }

  public func generateWithTools(
    _ options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let session = session else {
      reject("SESSION_NOT_CONFIGURED", "Call configureSession first", nil)
      return
    }

    guard let prompt = options["prompt"] as? String else {
      reject("INVALID_INPUT", "Missing 'prompt' field", nil)
      return
    }

    let maxTokens = options["maxTokens"] as? Int ?? 1000 // default to 1000 tokens
    let temperature = options["temperature"] as? Double ?? 0.5 // default to 0.5
    let toolTimeout = options["toolTimeout"] as? Int ?? 30000 // default to 30 seconds
    let shouldStream = options["shouldStream"] != nil
    self.toolTimeout = toolTimeout

    Task {
      do {
        var generationOptions = GenerationOptions(sampling: .greedy)

        generationOptions = GenerationOptions(
          sampling: generationOptions.sampling,
          temperature: temperature,
          maximumResponseTokens: maxTokens
        )

        // Generate response with tools enabled using streaming
        let stream = session.streamResponse(
          to: prompt,
          options: generationOptions
        )

        var fullContent = ""
        for try await snapshot in stream {
          let chunk = snapshot.content
          fullContent = chunk

          if shouldStream {
            DispatchQueue.main.async {
              self.onTextGenerationChunk?([
                "chunk": chunk
              ])
            }
          }
        }

        resolve(fullContent)

      } catch let error {
        let errorMessage = handleGeneratedError(error as! LanguageModelSession.GenerationError)
        reject(
          "GENERATION_FAILED",
          errorMessage,
          error
        )
      }
    }
  }

  func invokeTool(name: String, id: String, parameters: [String: Any]) async throws -> String {
    return try await withCheckedThrowingContinuation { continuation in
      // Store the continuation to resolve
      let continuationKey = id

      // Create a handler to resolve 
      let handler = { (resultId: String, result: [String: Any]) in
        if resultId == id {
          if let success = result["success"] as? Bool, success {
            continuation.resume(returning: result["result"] as? String ?? "No result")
          } else {
            let error = result["error"] as? String ?? "Unknown tool execution error"
            continuation.resume(
              throwing: NSError(
                domain: "ToolExecutionError",
                code: 1,
                userInfo: [NSLocalizedDescriptionKey: error]
              ))
          }
        }
      }

      toolHandlers[continuationKey] = handler

      // Send tool invocation to React Native

      DispatchQueue.main.async {
        self.onToolInvocation?([
          "name": name,
          "id": id,
          "parameters": parameters,
        ])
      }

      // Set up a timeout in case the tool never returns, maybe there is a better way to do this? also possibly let the user set the timeout 
      Task {
        try await Task.sleep(nanoseconds: UInt64(self.toolTimeout) * 1_000_000) // Convert ms to ns

        if self.toolHandlers[continuationKey] != nil {
          self.toolHandlers.removeValue(forKey: continuationKey)
          continuation.resume(
            throwing: NSError(
              domain: "ToolExecutionError",
              code: 2,
              userInfo: [NSLocalizedDescriptionKey: "Tool execution timeout"]
            ))
        }
      }
    }
  }

  public func resetSession(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    session = nil
    registeredTools.removeAll()
    toolHandlers.removeAll()
    resolve(true)
  }
}

// refernce: https://developer.apple.com/forums/thread/792076?answerId=848076022#848076022
@available(iOS 26.0, *)
private func handleGeneratedError(_ error: LanguageModelSession.GenerationError) -> String {
  switch error {
  case .exceededContextWindowSize(let context):
    return presentGeneratedError(error, context: context)
  case .assetsUnavailable(let context):
    return presentGeneratedError(error, context: context)
  case .guardrailViolation(let context):
    return presentGeneratedError(error, context: context)
  case .unsupportedGuide(let context):
    return presentGeneratedError(error, context: context)
  case .unsupportedLanguageOrLocale(let context):
    return presentGeneratedError(error, context: context)
  case .decodingFailure(let context):
    return presentGeneratedError(error, context: context)
  case .rateLimited(let context):
    return presentGeneratedError(error, context: context)
  default:
    return "Failed to respond: \(error.localizedDescription)"
  }
}

@available(iOS 26.0, *)
private func presentGeneratedError(
  _ error: LanguageModelSession.GenerationError,
  context: LanguageModelSession.GenerationError.Context
) -> String {
  return """
    Failed to respond: \(error.localizedDescription).
    Failure reason: \(String(describing: error.failureReason)).
    Recovery suggestion: \(String(describing: error.recoverySuggestion)).
    Context: \(context)
    """
}
