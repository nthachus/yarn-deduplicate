const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

const patches = [
  '\\bObject\\.keys\\(json\\)\\.forEach\\(.*?, packageName, requestedVersion\\] = match;',
  `let resolvable = null;
  if (includeScopes.length) {
    includeScopes = includeScopes.filter(v => !['^', '~', '*'].includes(v) || !(resolvable = v));
  }
  $&
  if (resolvable === '*') {
    requestedVersion = '*';
  } else if (resolvable === '^' && /(^|\\s|\\|)~\\s*\\d/.test(requestedVersion)) {
    requestedVersion = requestedVersion.replace(/(^|\\s|\\|)~\\s*(\\d)/g, '$$1^$$2');
  } else if (resolvable && /^\\d[\\w.-]*$$/.test(requestedVersion = semver.clean(requestedVersion))) {
    requestedVersion = resolvable + requestedVersion.replace(/^(0)\\..*$$/, '$$1');
  }`,
];

module.exports = {
  mode: 'production',
  entry: './node_modules/yarn-deduplicate/cli',
  output: {
    path: __dirname,
    filename: 'index.js',
  },
  context: __dirname,
  target: 'node',
  node: {
    __filename: false,
    __dirname: false,
  },
  // externals: [],
  module: {
    rules: [
      {
        // transpile ES6-8 into ES5
        test: /\.m?js$/,
        // exclude: /node_modules\b/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: [
            ['@babel/preset-env', { targets: { node: pkg.engines.node.replace('>=', '') } }], // esmodules
          ],
        },
      },
      {
        test: path.resolve(__dirname, 'node_modules/yarn-deduplicate/index.js'),
        loader: 'string-replace-loader',
        options: { search: patches[0], flags: 's', replace: patches[1] },
      },
      {
        test: path.resolve(__dirname, 'node_modules/yarn-deduplicate/cli.js'),
        loader: 'string-replace-loader',
        options: {
          multiple: [
            { search: '^#!.*[\\r\\n]+', flags: '', replace: '' },
            { search: "require('./package.json').version", replace: `'${pkg.version}'` },
          ],
        },
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
  ],
  optimization: {
    nodeEnv: false,
    // minimize: false,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: { mangle: false, output: { beautify: true } },
      }),
    ],
  },
};
