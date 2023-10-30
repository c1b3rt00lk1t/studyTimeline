const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

// Publish to Firebase Hosting space
const dist = path.join(__dirname, "public");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";

  return {
    mode: isDevelopment ? "development" : "production",
    // The entry point file described above
    entry: "./src/js/main.js",
    // The location of the build folder described above
    output: {
      path: dist,
      filename: "bundle.js",
    },
    // optimization with terser and comment extraction
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
            sourceMap: false,
          },
          extractComments: false,
        }),
      ],
    },
    // plugin to copy html and css code to final folder
    plugins: [
      // Copy index.html and index.css from src to dist
      new CopyWebpackPlugin({
        patterns: [
          { from: "src/index.html", to: "index.html" },
          { from: "src/css/index.css", to: "css/index.css" },
          { from: "src/app.webmanifest", to: "app.webmanifest" },
          { from: "src/sw.js", to: "sw.js" },
          // { from: "src/img/*.png", to: "img/[name][ext]" },
          { from: "src/icons/capture.png", to: "icons/capture.png" },
        ],
      }),
    ],
    // Optional and for development only. This provides the ability to
    // map the built code back to the original source format when debugging.
    devtool: isDevelopment ? "eval-source-map" : false,
  };
};
