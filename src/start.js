/*
    this class have been called by user after appoints research from WEB . Call launcher.js methods
*/
var hide = require('node-hide');
var Launcher = require('./server/launcher.js');
var config = require('./config.json');
var logger = require('./server/logger.js');
var db = require('./server/db/index.js');

class Start{
    constructor(){
        this.api = {
            GetDB: function GetDB() {
                return db.GetDB();
            },
            GetLogger: function GetLogger() {
                return logger;
            }
        };
        this.config = config;
    }

    hideWindow(){
        var handle = hide.findWindow('C:\\Program Files (x86)\\nodejs\\node.exe'); 
        hide.hideWindow(handle);
        handle = hide.findWindow('C:\\Program Files\\nodejs\\node.exe');
        hide.hideWindow(handle);
    }

    run(){
        process.argv.forEach(function (val, index, array) {
            // if args are in cmd
            if(index === 2){
                var data = new Buffer(val.substr(6), 'base64').toString('utf8');
                var launcher = new Launcher(this.api,this.config.easyecginputdir,this.config.easyecgpath);
                launcher.buildAtesXml(JSON.parse(data));
                console.log(JSON.parse(data));
                launcher.runAtesMedicaExe();                
                
                // var param = {
                //     uuidTest: data.task.uuid,
                //     uuidPatient: data.task['patient.uuid'],
                //     state: 'registered'
                // };
                // this.api.GetDB().test.Create(param);               
            } 
        });
    }

}
var start = new Start();
start.hideWindow();
start.run();

