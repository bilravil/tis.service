'use strict';

exports.Run = function (callback) {

    if (__dirname !== process.cwd()) {
        process.chdir(__dirname);
    }

    var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');
    var moment = require('moment-timezone');
    var jsonParser = bodyParser.json();
    var cookieParser = require('cookie-parser')();
    var session = require('express-session');
    var sessionParser = session({ secret: 'keyboard cat', resave: true, saveUninitialized: true });
    var http = require('http').Server(app);
    var request = require('request');
    var config = require('./config.json');
    var fs = require('fs');
    var logger = require('./server/logger.js');
    var xmlbuilder = require('./server/xmlbuilder.js');
    var sender = require('./server/sender.js');
    var db = require('./server/db/index.js');
    var localFolder = config.easyecg.easyecgoutputdir + '/';
    var path = require('path');
    
    var api = {
        GetDB: function GetDB() {
            return db.GetDB();
        },
        GetHttp: function GetHttp() {
            return http;
        },
        GetExpress: function GetExpress() {
            return app;
        },
        GetLogger: function GetLogger() {
            return logger;
        }
    };

    function deleteExistFiles() {
        if(fs.existsSync('./logs.txt')){
            fs.unlink('./logs.txt');
        }
        if(fs.existsSync(localFolder)){
            fs.readdirSync(localFolder).forEach(function (file) {
                if (path.extname(file) === '.ecg') {
                    var _path = localFolder + file;
                    db.GetDB().test.Get({ filename: _path }).then(function (res) {
                        if (res !== undefined) if (res.state === 'sended') fs.unlink(_path);
                    });
                };
            });
        }  
    }


    function Http(port, callback) {
        app.all('*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
            if (req.method == 'OPTIONS') {
                res.status(200).end();
            } else {
                +next();
            }
        });

        app.use(cookieParser);
        app.use(sessionParser);

        app.use(express.static(__dirname + '/www'));

        app.use(bodyParser.json({ limit: '50mb' }));
        app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

        app.post('/tis/getLogs', jsonParser, function (req, res) {
            if (!fs.existsSync('./logs.txt')) {
                res.send({ success: true, message: '' });
            }
            fs.readFile('./logs.txt', 'utf8', function (err, data) {
            //data = data.reverse();
            res.send({ success: true, message: data });
        });
        });

        http.listen(port, function () {
            (callback || function () {})();
        });
    }

    Http(config.main.port, function () {
        console.log('http service started on port ' + config.main.port + "!");
        logger.write('Сервис по отправке ЭКГ запущен.');
    });
    xmlbuilder.Run(config, api, function () {});
    sender.Run(config, api, function () {});
    db.Run(api, function (msg) {
        console.log(msg);deleteExistFiles();
    });

    //setInterval(checkUpdates,10000);

    process.on('uncaughtException', function (err) {
        console.log(err);
    });

    http.on('error', function (err) {
        console.log(err);
        logger.write('Порт' + config.main.port + 'уже используется другой программой. ');
    });

    callback = callback || function () {};
    callback("Tis Service started");

}