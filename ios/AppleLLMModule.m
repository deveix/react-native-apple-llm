//  AppleLLMModule.m
//  react-native-apple-llm
//
//  Created by Ahmed Kasem on 16/06/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (AppleLLMModule, NSObject)

// Generate structured model from LLM based on input options
RCT_EXTERN_METHOD(generateStructuredOutput : (NSDictionary *)options resolve : (
    RCTPromiseResolveBlock)resolve rejecter : (RCTPromiseRejectBlock)reject)

// Optionally: reset or configure model session
RCT_EXTERN_METHOD(configureSession : (NSDictionary *)config resolve : (
    RCTPromiseResolveBlock)resolve rejecter : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(resetSession : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isFoundationModelsEnabled : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject)

@end
