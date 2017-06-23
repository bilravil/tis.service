/*
    app updater. compares local and remote version and if is difference download files and unzip to directory. At the end starts main module (app.js)
*/
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var app = require('./app.js');
var unzip = require('unzip');
var httpD = require('http');
var request = require('request');
var config = require('./config.json');
var fs = require('fs');
var path = require('path');

var Updater = function () {
    function Updater() {
        _classCallCheck(this, Updater);

        this.checkUpdates = this.checkUpdates.bind(this);
    }

    _createClass(Updater, [{
        key: 'checkUpdates',
        value: function checkUpdates(callback) {
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
                } else callback(true);
            });
        }
    }]);

    return Updater;
}();

var main = new Updater();
main.checkUpdates(function () {
    app.Run(function (msg) {});
});