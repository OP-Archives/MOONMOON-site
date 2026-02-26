const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = function override(config, env) {
  config.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: './stats.json',
    })
  );
  return config;
};
