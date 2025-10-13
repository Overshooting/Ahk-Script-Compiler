const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const path = require("path");

module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: [path.resolve(__dirname, "../scriptstorage/scripts")],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "ahk_script_runner",
        authors: "aamel",
        exe: "ahk_script_runner.exe",
        setupExe: "AhkScriptRunnerSetup.exe",
      },
    },

    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
  ],
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
