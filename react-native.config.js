const Plist = require("plist");
const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");
const { sync: glob } = require("glob");
const { spawnSync } = require("child_process");
module.exports = {
  commands: [
    {
      name: "set-ios-code-push-key [key]",
      description:
        "set codepush key for ios. Options only available if yarn is installed",
      options: [
        {
          name: "--appName [name]",
          description: "Name of application",
          default: "",
        },
        {
          name: "--stage [stage]",
          description: "Deployment Stage",
          default: "",
        },
      ],
      func: ([key], _, { appName, stage }) => {
        if (!key) {
          if (!appName) {
            //List appnames
            const { output } = spawnSync(
              "yarn",
              ["-s", "appcenter", "apps", "list", "--output", "json"],
              { stdio: "pipe", encoding: "utf8" }
            );
            const a = JSON.parse(output.filter(Boolean).join(""));
            if (a.length > 1) {
              console.log(
                "Problem: appName not specified - try running with one of these names"
              );
              console.log(
                a
                  .map(
                    ({ name, owner: { name: ownerName } }) =>
                      "\t react-native set-ios-code-push-key --appName " +
                      [ownerName, name].join("/")
                  )
                  .join("\n")
              );
              return;
            } else {
              const {
                name,
                owner: { name: ownerName },
              } = a.pop();
              appName = [ownerName, name].join("/");
            }
          }
          const { output: output2 } = spawnSync(
            "yarn",
            [
              "-s",
              "appcenter",
              "codepush",
              "deployment",
              "list",
              "-k",
              "--app",
              appName,
              "--output",
              "json",
            ],
            { stdio: "pipe", encoding: "utf8" }
          );
          if (!output2) {
            throw "Could not find codepush stages for app " + appName;
          }
          const a2 = JSON.parse(output2.filter(Boolean).join(""));
          if (stage) {
            const myStage = a2.find(([thisStage, key]) => thisStage === stage);
            if (myStage) {
              key = myStage[1];
            } else {
              throw "This stage does not exist in the app " + appName;
            }
          } else if (a2.length > 1) {
            console.log(
              "Problem: stage not specified, and there is more than one. Try using:"
            );
            console.log(
              a2
                .map(
                  ([stage]) =>
                    "\treact-native set-ios-code-push-key --appName " +
                    appName +
                    " --stage " +
                    stage
                )
                .join("\n")
            );
            return;
          } else {
            const [[, newKey]] = stages;
            key = newKey;
          }
        }
        if (key) {
          const paths = glob(
            join(process.cwd(), "ios", "*", "Info.plist")
          ).filter(
            (path) => !path.includes("/Pods/") && !path.includes("-tvOS")
          );
          paths.forEach((path) => {
            const xml = readFileSync(path, { encoding: "utf8" });
            const o = Plist.parse(xml);
            o.CodePushDeploymentKey = key;
            const out = Plist.build(o);
            writeFileSync(path, out);
            console.log("Added deployment key", key, "to", path);
          });
        }
      },
    },
  ],
};
