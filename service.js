'use strict';
var config = require('./config.json');
var Service = require('node-windows').Service;
var fs = require('fs');

function search() {
	var pth1 = 'C:\\Program Files (x86)\\ATES Medica\\Easy ECG Rest\\Bin\\ht_ecgv.exe';
	var pth2 = 'C:\\Program Files\\ATES Medica\\Easy ECG Rest\\Bin\\ht_ecgv.exe';

	var config = require('./config.json');
	if (fs.existsSync(pth1)) {
		config.easyecg.easyecgpath = pth1;
		fs.writeFile('./config.json', JSON.stringify(config), function (err) {});
	} else if (fs.existsSync(pth2)) {
		config.easyecg.easyecgpath = pth2;
		fs.writeFile('./config.json', JSON.stringify(config), function (err) {});
	}
}

var pth = './start.js';
var svc = new Service({
	name: 'TisService',
	description: 'Service to send ECG files to TIS Server',
	script: pth
});

var wincmd = require('node-windows');

svc.on('install', function () {
	search();
	svc.start();
	fs.appendFile('./1.txt', 'service install' , function (err) {});
});

svc.on('alreadyinstalled', function () {
	fs.appendFile('./1.txt', 'service alreadyinstalled' , function (err) {});
});

svc.on('invalidinstallation', function () {
	fs.appendFile('./1.txt', 'service invalidinstallation' , function (err) {});
});

svc.on('uninstall', function () {
	console.log('Uninstall complete.');
	console.log('The service exists: ', svc.exists);
});

//svc.uninstall();
svc.install();