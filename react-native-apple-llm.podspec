require 'json'

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name                    = package["name"]
  s.version                 = package['version']
  s.summary                 = package["description"]
  s.homepage                = "https://github.com/deveix/react-native-apple-llm"
  s.license                 = { :type => package["license"], :file => "LICENSE" }
  s.authors                 = { package["author"]["name"] => package["author"]["email"] }

  s.ios.deployment_target   = '13.0'
  s.source                  = { :git => "https://github.com/deveix/react-native-apple-llm.git", :tag => "v#{s.version}" }
  s.source_files            = "ios/**/*.{h,m,mm,swift}"
  
  s.dependency 'React-Core'

  s.swift_version = '5.9'

  # Don't install the dependencies when we run `pod install` in the old architecture.
  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
    s.pod_target_xcconfig    = {
      "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\" \"$(PODS_ROOT)/React-Core/React\" \"$(PODS_ROOT)/React-Core\"",
      "OTHER_CPLUSPLUSFLAGS" => folly_compiler_flags,
      "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
      "DEFINES_MODULE" => "YES",
    }
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
  else
    s.pod_target_xcconfig = {
      "DEFINES_MODULE" => "YES"
    }
  end

  if defined?(install_modules_dependencies) then
    Pod::UI.puts("[React Native Apple LLM] Using install_modules_dependencies")
    install_modules_dependencies(s)
  else
    Pod::UI.puts("[React Native Apple LLM] Installing manually")
    s.dependency 'React-Core'
  end
end 