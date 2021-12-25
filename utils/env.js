const fs = require('fs');
const paths = require('./paths');

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) throw new Error('The NODE_ENV is required but was not specified.');

const REACT_APP = /^REACT_APP_/i;

[
  paths.dotenv,
  `${paths.dotenv}.local`,
  `${paths.dotenv}.${NODE_ENV}`,
  `${paths.dotenv}.${NODE_ENV}.local`,
].forEach((dotenvFile) => {
  if(fs.existsSync(dotenvFile)) {
    require('dotenv-expand')(
      require('dotenv').config({
        path: dotenvFile,
      })
    );
  }
});

module.exports = function() {
  const raw = Object.keys(process.env)
    .filter((key) => REACT_APP.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        NODE_ENV: NODE_ENV || 'development',
      }
    );
  const stringified = {
    'process.env': Object.keys(raw)
      .reduce((env, key) => {
        env[key] = JSON.stringify(raw[key]);
        return env;
      }, {}),
  };
  return { raw, stringified };
}
