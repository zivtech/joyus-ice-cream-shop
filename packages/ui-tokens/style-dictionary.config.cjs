module.exports = {
  source: ["tokens.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            selector: ":root"
          }
        }
      ]
    },
    json: {
      transformGroup: "js",
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.json",
          format: "json/nested"
        }
      ]
    }
  }
};
