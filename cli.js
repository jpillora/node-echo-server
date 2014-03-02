#!/usr/bin/env node
require('child_process').fork(
  require('path').join(__dirname,'server.js'),
  [process.argv[2]]
);