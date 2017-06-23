/*
	install and start TIS service for send ECG files to Server. Service runs updater.js

	function rewrite() - create .reg file for windows registry and then runs in cmd.	
						.reg file set the URI settings.
*/

'use strict';

var config = require('./config.json');
var Service = require('node-windows').Service;
var fs = require('fs');

function setAtesExePath() {
  var regedit = require('regedit');
  regedit.list('HKCU\\SOFTWARE\\ATES Medica soft\\Easy ECG Rest', function (err, result) {
    var atesPath = result['HKCU\\SOFTWARE\\ATES Medica soft\\Easy ECG Rest'].values['Path'].value + '\\ht_ecgv.exe';
    var config = require('./config.json');
    config.easyecg.easyecgpath = atesPath;
    fs.writeFile('./config.json', JSON.stringify(config), function (err) {});
  });
}

var svc = new Service({
  name: 'TisService',
  description: 'Service to send ECG files to TIS Server',
  script: './updater.js'
});

function rewrite() {
  var regedit = require('regedit');
  regedit.list('HKLM\\SOFTWARE\\Node.js', function (err, result) {
    var nodePath = '\"\\\"' + result['HKLM\\SOFTWARE\\Node.js'].values['InstallPath'].value + '\\node.exe\"';
    var appPath = ' \\ \"' + path.dirname(require.main.filename) + '\\start.js"';

    var tmp = nodePath + appPath;
    tmp = tmp.replace(/\\/g, '\\\\');
    var tmp = 'Windows Registry Editor Version 5.00 \r\n\r\n' + '[HKEY_CLASSES_ROOT\\tis]\r\n' + '@="URL:tis Protocol"\r\n' + '"URL Protocol"="" \r\n\r\n' + '[HKEY_CLASSES_ROOT\\tis\\shell]\r\n\r\n' + '[HKEY_CLASSES_ROOT\\tis\\shell\\open]\r\n\r\n' + '[HKEY_CLASSES_ROOT\\tis\\shell\\open\\command]\r\n' + '@=' + tmp + ' \\"%1\\""';
    fs.writeFile('./tis.reg', tmp, function (err) {
      var exec = require('child_process').exec;
      var cmd = 'tis.reg';

      exec(cmd, function (error, stdout, stderr) {});
    });
  });
}

svc.on('install', function () {
  setAtesExePath();
  rewrite();
  svc.start();
});

svc.on('alreadyinstalled', function () {});

svc.on('invalidinstallation', function () {});

svc.on('uninstall', function () {
  console.log('Uninstall complete.');
  console.log('The service exists: ', svc.exists);
});

//svc.uninstall();
svc.install();