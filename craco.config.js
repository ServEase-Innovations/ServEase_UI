module.exports = {
  babel: {
    plugins: [
      ["@babel/plugin-transform-class-properties", { loose: true }],
      ["@babel/plugin-transform-private-methods", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }]
    ]
  },
  jest: {
    configure: {
      testPathIgnorePatterns: ["/node_modules/", "src/e2e/"],
      moduleNameMapper: {
        "^axios$": "axios/dist/node/axios.cjs",
        "^lucide-react$": "lucide-react/dist/cjs/lucide-react.js",
        "\\.(css|less)$": "identity-obj-proxy"
      }
    }
  }
};
