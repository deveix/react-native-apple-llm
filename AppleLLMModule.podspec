require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name                    = "AppleLLMModule"
  s.version                 = package['version']
  s.summary                 = package["description"]
  s.homepage                = "https://github.com/deveix/react-native-apple-llm"
  s.license                 = { :type => package["license"], :file => "LICENSE.md" }
  s.authors                 = { package["author"]["name"] => package["author"]["email"] }

  s.ios.deployment_target   = '13.0'
  s.source                  = { :git => "https://github.com/deveix/react-native-apple-llm.git", :tag => "v#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"

  s.swift_version = '5.9'

  s.pod_target_xcconfig    = {
    "DEFINES_MODULE" => "YES",
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
    "OTHER_CPLUSPLUSFLAGS" => "-DRCT_NEW_ARCH_ENABLED=1"
  }

  install_modules_dependencies(s)
end 