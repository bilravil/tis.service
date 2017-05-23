const fs = require('fs');
const path = require('path');
const logPath = './logs.txt';

function write(tmp) {
	if (fs.existsSync(logPath)) {
        fs.appendFile(logPath, `\n${tmp}`, function(err) {})
    }else fs.writeFile(logPath, tmp, function(err) {})
}

module.exports.write = write;