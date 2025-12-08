const path = require("path");
const { override, addWebpackAlias, babelInclude, addBabelPreset } = require("customize-cra");

module.exports = override(
  // keep your alias
  addWebpackAlias({
    "@": path.resolve(__dirname, "src").replace(/\\/g, "/")
  }),

  // transpile Safari-unsafe packages
  addBabelPreset("@babel/preset-env"),
  babelInclude([
    path.resolve("src"), // your app code
    path.resolve("node_modules/@mui"),
    path.resolve("node_modules/@radix-ui"),
    path.resolve("node_modules/@shadcn"),
    path.resolve("node_modules/lucide-react")
  ])
);
