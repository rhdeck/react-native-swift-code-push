import ReactNativeSwiftRegistry
@objc
open class RNSCodePush:NSObject, RNSStartable {
    @objc public static func runOnStart() -> Void {
        let _ = RNSMainRegistry.addEvent(type: "app.getSourceURL", key: "codepush") { data in
            #if DEBUG
            #else
            if let url = CodePush.bundleURL() {
                let string = url.absoluteString
                RNSMainRegistry.setData(key: "sourceURL", value: string)
            }
            #endif
            return true;
        }
    }
}

