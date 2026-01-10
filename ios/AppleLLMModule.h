#ifdef __OBJC__
#import <Foundation/Foundation.h>
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#import <AppleLLMModuleSpec/AppleLLMModuleSpec.h>
#endif

NS_ASSUME_NONNULL_BEGIN

#ifdef RCT_NEW_ARCH_ENABLED
@interface AppleLLMModule : NativeAppleLLMModuleSpecBase <NativeAppleLLMModuleSpec>
#else
@interface AppleLLMModule : NSObject
#endif

@end

NS_ASSUME_NONNULL_END

