//  AppleLLMModule.mm
//  react-native-apple-llm
//
//  Created by Ahmed Kasem on 16/06/25.
//

#import "AppleLLMModule.h"
#import "AppleLLMModule-Swift.h"

using namespace facebook;
using namespace JS::NativeAppleLLMModule;

@implementation AppleLLMModule {
  NativeAppleLLMModule *_appleLLM;
}

+ (NSString *)moduleName {
  return @"AppleLLMModule";
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    __weak AppleLLMModule* weakSelf = self;
    
    _appleLLM = [[NativeAppleLLMModule alloc]
      initOnTextGenerationChunk:^(NSDictionary * _Nonnull values) {
        [weakSelf emitOnTextGenerationChunk:values];
      }
      onToolInvocation:^(NSDictionary * _Nonnull values) {
        [weakSelf emitOnToolInvocation:values];
      }];
  }
  return self;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAppleLLMModuleSpecJSI>(params);
}

- (void)isFoundationModelsEnabled:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [_appleLLM isFoundationModelsEnabled:resolve rejecter:reject];
}

- (void)configureSession:(SessionConfig &)config resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *configDict = [NSMutableDictionary dictionary];
  NSString *instructions = config.instructions();
  if (instructions) {
    configDict[@"instructions"] = instructions;
  }
  [_appleLLM configureSession:configDict resolve:resolve rejecter:reject];
}

- (void)generateText:(GenerateTextOptions &)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *optionsDict = [NSMutableDictionary dictionary];
  optionsDict[@"prompt"] = options.prompt();
  [_appleLLM generateText:optionsDict resolve:resolve rejecter:reject];
}

- (void)generateStructuredOutput:(GenerateStructuredOutputOptions &)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *optionsDict = [NSMutableDictionary dictionary];
  optionsDict[@"prompt"] = options.prompt();
  optionsDict[@"structure"] = options.structure();
  [_appleLLM generateStructuredOutput:optionsDict resolve:resolve rejecter:reject];
}

- (void)generateWithTools:(GenerateWithToolsOptions &)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *optionsDict = [NSMutableDictionary dictionary];
  optionsDict[@"prompt"] = options.prompt();
  if (options.maxTokens()) {
    optionsDict[@"maxTokens"] = @(options.maxTokens().value());
  }
  if (options.temperature()) {
    optionsDict[@"temperature"] = @(options.temperature().value());
  }
  if (options.toolTimeout()) {
    optionsDict[@"toolTimeout"] = @(options.toolTimeout().value());
  }
  [_appleLLM generateWithTools:optionsDict resolve:resolve rejecter:reject];
}

- (void)registerTool:(ToolDefinition &)toolDefinition resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *toolDict = [NSMutableDictionary dictionary];
  toolDict[@"name"] = toolDefinition.name();
  toolDict[@"description"] = toolDefinition.description();
  toolDict[@"parameters"] = toolDefinition.parameters();
  [_appleLLM registerTool:toolDict resolve:resolve rejecter:reject];
}

- (void)handleToolResult:(ToolResult &)result resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *resultDict = [NSMutableDictionary dictionary];
  resultDict[@"id"] = result.id_();
  resultDict[@"success"] = @(result.success());
  if (result.result()) {
    resultDict[@"result"] = result.result();
  }
  if (result.error()) {
    resultDict[@"error"] = result.error();
  }
  [_appleLLM handleToolResult:resultDict resolve:resolve rejecter:reject];
}

- (void)resetSession:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [_appleLLM resetSession:resolve rejecter:reject];
}

@end

