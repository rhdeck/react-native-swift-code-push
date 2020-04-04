require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "RNSCodePush"
  s.version      = package['version']
  s.summary      = package['description']

  s.authors      = "Ray Deck"
  s.homepage     = package['homepage']
  s.license      = package['license']
  s.platform     = :ios, "9.0"

  s.module_name  = 'RNSCodePush'

  s.source       = { :git => "https://github.com/rhdeck/react-native-swift-code-push.git", :tag => "#{s.version}" }
  s.source_files  = "ios/**/*.{h,m,swift}"

  s.dependency 'React'
  s.dependency 'ReactNativeSwiftRegistry'
  s.frameworks = 'UIKit'
end