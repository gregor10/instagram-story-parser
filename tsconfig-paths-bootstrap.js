const tsConfigPaths = require('tsconfig-paths');

const baseUrl = './build'; // Either absolute or relative path. If relative it's resolved to current working directory.
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths: []
});

// When path registration is no longer needed
cleanup();
