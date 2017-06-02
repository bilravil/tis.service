'use strict';

if (__dirname !== process.cwd()) {
    process.chdir(__dirname);
}

const express = require('express');
var app = express();
var bodyParser = require('body-parser');
const moment = require('moment-timezone');
const jsonParser = bodyParser.json()
const cookieParser = require('cookie-parser')();
const session = require('express-session');
const sessionParser = session({ secret: 'keyboard cat', resave: true, saveUninitialized: true })
const http = require('http').Server(app);

const config = require('./config.json');
const fs = require('fs');
const logger = require('./server/logger.js');
const path = require('path');
const xmlbuilder = require('./server/xmlbuilder.js');
const sender = require('./server/sender.js');
const db = require('./server/db/index.js');
const localFolder = config.easyecg.easyecgoutputdir+'/';
var api = {
    GetDB : function() {return db.GetDB();},
    GetHttp: function() { return http; },
    GetExpress: function () { return app; },  
    GetLogger : function () { return logger;} 
};

function deleteExistFiles(){
    fs.readdirSync(localFolder).forEach(file =>{
        if(path.extname(file) === '.ecg'){
            let path = localFolder + file;
            db.GetDB().test.Get({filename: path}).then(
                res=>{ 
                    if(res !== undefined) if(res.state === 'sended') fs.unlink(path);
                })
        };   
    })
        
}

function Http(port, callback) {
	app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
        if (req.method == 'OPTIONS') {
            res.status(200).end();
        } else {
            +
            next();
        }
    });
    

    app.use(cookieParser);
    app.use(sessionParser);

    app.use(express.static(__dirname + '/www'));

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));    

    app.post('/tis/getLogs', jsonParser, function(req, res) {
        if (!fs.existsSync('./logs.txt')) { res.send({ success: true , message : ''}); }
            fs.readFile('./logs.txt', 'utf8', function(err, data) {
                res.send({ success: true , message : data}); 
            }); 
    });

    http.listen(port, function () {
        (callback || function () { })();
    });
}


Http(config.main.port, function () { console.log('http service started on port ' + config.main.port + "!");  });
xmlbuilder.Run(config,api, function(){});
sender.Run(config,api, function(){});
db.Run(api, function(msg){console.log(msg);deleteExistFiles();});

process.on('uncaughtException', function(err) {
    console.log(err);
});

http.on('error', function(err) {
	console.log(err);
	logger.write(`Порт ${config.main.port} уже используется другой программой. `);
});