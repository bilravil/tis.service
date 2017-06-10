var app = require('./app.js');

var unzip = require('unzip');
var httpD = require('http');
var request = require('request');
var config = require('./config.json');
var fs = require('fs');
var path = require('path');

function checkUpdates(callback) {
    var url = config.main.server;
    var version = config.main.version;
    request.get(url + '/Api/GetTisServiceVersion', function (err, remoteResponse, remoteBody) {
        if (err) {
            console.log(err);
            callback(true);
        }
        if (version !== remoteBody) {           
            var request = httpD.get(url + '/Api/GetTisServiceFiles', function (response) {
                var file = fs.createWriteStream("update.zip");
                response.pipe(file);
                fs.createReadStream('./update.zip').pipe(unzip.Extract({ path: './' }));
                callback(true);
            });
        }else callback(true);
    });
}

checkUpdates(function(){ app.Run(function (msg) { console.log(msg); }); });