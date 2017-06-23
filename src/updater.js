/*
    app updater. compares local and remote version and if is difference download files and unzip to directory. At the end starts main module (app.js)
*/
'use strict';
var app = require('./app.js');
var unzip = require('unzip');
var httpD = require('http');
var request = require('request');
var config = require('./config.json');
var fs = require('fs');
var path = require('path');

class Updater{
    constructor(){
        this.checkUpdates = this.checkUpdates.bind(this);
    }

    checkUpdates(callback) {
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
                    config.main.version = remoteBody;
                    fs.writeFile('./config.json', JSON.stringify(config), function (err) {});
                    callback(true);
                });
            }else callback(true);
        });
    }
}

var main = new Updater();
main.checkUpdates(function(){ 
    app.Run(function (msg) { }); 
});
