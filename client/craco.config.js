const ImageminWebp = require("imagemin-webp-webpack-plugin");

module.exports = {
  webpack: {
    plugins: [
      new ImageminWebp({
        config: [{
          test: /\.(jpe?g|png)$/,
          options: { quality: 80 }
        }],
        overrideExtension: true,
        detailedLogs: false,
        silent: true,
        strict: true
      })
    ],
    configure: (webpackConfig) => {
      if (process.env.NODE_ENV === "production") {
        webpackConfig.devtool = false;
      }
      return webpackConfig;
    }
  }
};
