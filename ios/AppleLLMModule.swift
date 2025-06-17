//  AppleLLMModule.swift
//  react-native-apple-llm
//
//  Created by Ahmed Kasem on 16/06/25.
//

import Foundation
import FoundationModels
import React

@objc(AppleLLMModule)
@available(iOS 26, *)
@objcMembers
class AppleLLMModule: NSObject {

  @objc
  static func moduleName() -> String! {
    return "AppleLLMModule"
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  private var session: LanguageModelSession?

  @objc
  func isFoundationModelsEnabled(
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

  @objc
  func configureSession(
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

    self.session = LanguageModelSession(tools: [], instructions: instructions)
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
      // TODO: handle array
      // else if type == "array", let items = field["items"] as? [String: Any] {
      //   let itemSchema = dynamicSchema(from: [items], name: "\(key)Item")
      //   let arraySchema = DynamicGenerationSchema(
      //     name: key, description: description,
      //     properties: [DynamicGenerationSchema.Property(name: "items", schema: itemSchema)])
      //   childProperty = DynamicGenerationSchema.Property(
      //     name: key, description: description, schema: arraySchema)
      // }
      else {
        childProperty = schemaForType(name: key, type: type ?? "string", description: description)
      }

      properties.append(childProperty)
    }

    return DynamicGenerationSchema(name: name, properties: properties)
  }

  private func schemaForType(name: String, type: String, description: String? = nil)
    -> DynamicGenerationSchema.Property
  {
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

    // If it's an object with named properties
    if let props = try? content.properties() {
      var result: [String: Any] = [:]
      for (key, val) in props {
        result[key] = try flattenGeneratedContent(val)
      }
      return result
    }

    // If it's an array
    if let elements = try? content.elements() {
      return try elements.map { try flattenGeneratedContent($0) }
    }

    // Fallback
    return "\(content)"
  }

  @objc
  func generateStructuredOutput(
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

  @objc
  func resetSession(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    session = nil
    resolve(true)
  }
}
