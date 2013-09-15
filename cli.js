#!/usr/bin/env node
require('child_process').fork('server.js', [process.argv[2]]);