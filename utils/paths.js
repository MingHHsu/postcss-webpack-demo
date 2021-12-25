const fs = require('fs');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  dotenv: resolveApp('.env'),
  appNodeModules: resolveApp('node_modules'),
  appWebpackCache: resolveApp('node_modules/.cache'),
  appSrc: resolveApp('src'),
  appIndexJs: resolveApp('src/index.jsx'),
  appBuild: resolveApp('build'),
  appHtml: resolveApp('public/index.html'),
  appPublic: resolveApp('public'),
};
