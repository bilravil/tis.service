const fs = require('fs');
const path = require('path');
const request = require('request');

exports.Run = function(config,api, callback){  

	const localFolder = config.easyecg.easyecgoutputdir;
	const remoteServer = config.main.server;

	const logFile = localFolder + 'log.txt';

	let check = () =>{
		fs.readdirSync(localFolder).forEach(file => {
			if(path.extname(file) === '.ecg'){
				search(file).then(res =>{
					if(res) return;
					else send(localFolder+file);
				})
			}  	
		})
	}

	let send = (filepath) => {   
		api.GetLogger().write(`Обнаружен файл ЭКГ - ${filepath}`); 
        var url = remoteServer;
        var req = request.post({url: url }, function (err, remoteResponse, remoteBody) {
            if (err) {               
                api.GetLogger().write(`Ошибка при отправке файла на сервер - ${err} . Проверьте адрес сервера в настройках.`);
                return;              
            }          
        });
        var form = req.form();
	    form.append('data', fs.createReadStream(filepath));   
	    api.GetLogger().write(`Файл отправлен на сервер - ${filepath}`); 
	    writeToFile(filepath);
	}

	function search(tmp){
		return new Promise(function(resolve,reject){
			if (fs.existsSync(logFile)) {
				fs.readFile(logFile, 'utf8', function(err, data) {
		            if(data.indexOf(tmp) >= 0){
					   resolve(true);
				  	}else resolve(false);
		        });
			}else resolve(false);
        }); 
	}

	function writeToFile(tmp){
	    if (fs.existsSync(logFile)) {
	        fs.appendFile(logFile, `\n${tmp}`, function(err) {})
	    }else fs.writeFile(logFile, tmp, function(err) {})   
	}

	setInterval(check,2000);

    callback = callback || function() {};
    callback("Sender started");
};