const paths = require('./utils/paths');

module.exports = {
  plugins: [
    require('postcss-import')({
      path: paths.appSrc,
    }),
    require('precss'),
    require('autoprefixer'),
  ]
};
