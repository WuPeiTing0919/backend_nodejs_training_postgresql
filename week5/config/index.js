const dotenv = require('dotenv');

const result = dotenv.config();
const db = require('./db');
const web = require('./web');

if (result.error) {
  throw result.error;
}
const config = {
  db,
  web
}

class ConfigManager {
  static get (path) {
    if (!path || typeof path !== 'string') {
      throw new Error(`incorrect path: ${path}`);
    }
    const keys = path.split('.');
    let configValue = config;
    keys.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(configValue, key)) {
        throw new Error(`config ${path} not found`);
      }
      configValue = configValue[key];
    })
    return configValue;
  }
}

module.exports = ConfigManager;
