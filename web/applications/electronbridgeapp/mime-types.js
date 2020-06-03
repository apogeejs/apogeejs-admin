//This source code is imported from the following link, to enable importing es modules from the local file system
// https://gist.github.com/smotaal/f1e6dbb5c0420bfd585874bd29f11c43

const { extname } = require('path');

const mime = filename =>
  mime[extname(`${filename || ''}`).toLowerCase()];

mime[''] = 'text/plain',
  mime['.js'] =
  mime['.ts'] =
  mime['.mjs'] = 'text/javascript',
  mime['.html'] =
  mime['.htm'] = 'text/html',
  mime['.json'] = 'application/json',
  mime['.css'] = 'text/css',
  mime['.svg'] = 'application/svg+xml';

module.exports = mime;