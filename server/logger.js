'use strict';

var fs = require('fs');
var path = require('path');
var logPath = './logs.txt';

function write(tmp) {
  if (fs.existsSync(logPath)) {
    fs.appendFile(logPath, '\n' + tmp, function (err) {});
  } else fs.writeFile(logPath, tmp, function (err) {});
}

module.exports.write = write;