const fs = require('fs');
const path = require('path');
const request = require('request');

exports.Run = function(config,api, callback){  

	var localFolder = config.easyecg.easyecgoutputdir+'/';
	var remoteServer = config.main.server;

	const logFile = localFolder + '/log.txt';

	let check = () =>{
		localFolder = config.easyecg.easyecgoutputdir+'/';
		remoteServer = config.main.server;
		fs.readdirSync(localFolder).forEach(file => {
			if(path.extname(file) === '.ecg'){
				let path = localFolder + file;
				api.GetDB().test.Get({filename:path}).then(
					res=>{ 
						if(res === undefined) send(path);
						else if(res.state !== 'sended') send(path);
					});
			}  	
		})
	}

	let send = (filepath) => {  
		var patient = parse(filepath).patient;
		var uuidPatient = patient.code;
		var uuidTest = patient.notes;
		var param = {
			'uuidTest' : patient.notes,
			'uuidUnion' : patient.notes,
			'uuidPatient' : patient.code,
			'serial' : config.easyecg.easyecgsernum.toString()
		}
		api.GetLogger().write(`Обнаружен файл ЭКГ - ${filepath}`); 
		api.GetDB().test.Update({uuidTest : patient.notes,state : 'finished'});
        var url = remoteServer + `/ates/easyecg/put?uuidTest=${patient.notes}&uuidPatient=${patient.code}&serial=${config.easyecg.easyecgsernum.toString()}`;
        
        fs.createReadStream(filepath).pipe(request.post(url,function (err, remoteResponse, remoteBody) {
        	if (err) {       
        		console.log(err);      
                api.GetLogger().write(`Ошибка при отправке файла на сервер - ${err} . Проверьте адрес сервера в настройках.`);
                return;              
            }
            let tmp = JSON.parse(remoteBody);
            if(tmp.success === true) api.GetDB().test.Update({uuidTest : patient.notes,state : 'sended',fileName:filepath});
            api.GetLogger().write(`Файл отправлен на сервер - ${filepath}`); 
            api.GetLogger().write(`Ответ от сервера - ${remoteBody}`); 
	    	
        }));	    	    
	}

	/*function search(tmp){
		return new Promise(function(resolve,reject){
			if (fs.existsSync(logFile)) {
				fs.readFile(logFile, 'utf8', function(err, data) {
		            if(data.indexOf(tmp) >= 0){
					   resolve(true);
				  	}else resolve(false);
		        });
			}else resolve(false);
        }); 
	}*/

	/*function writeToFile(tmp){
	    if (fs.existsSync(logFile)) {
	        fs.appendFile(logFile, `\n${tmp}`, function(err) {})
	    }else fs.writeFile(logFile, tmp, function(err) {})   
	}*/

	setInterval(check,3000);

	function parse(filepath) {
		var buffer = fs.readFileSync(filepath);
	    //var Iconv = require('iconv').Iconv;
	    //var iconv = new Iconv('windows-1251', 'utf-8');

	    var patient_key = [
	        { key_ates: "::p01:Patient last name:", key: "first" },
	        { key_ates: "::p02:Patient first name:", key: "middle" },
	        { key_ates: "::p03:Patient middle name:", key: "last" },
	        { key_ates: "::p04:Patient code:", key: "code" },
	        { key_ates: "::p05:Patient sex:", key: "sex" },
	        { key_ates: "::p06:Patient birthday date:", key: "birthday" },
	        { key_ates: "::p07:Patient registration date:", key: "created" },
	        { key_ates: "::p08:Patient age:", key: "age" },
	        { key_ates: "::p09:Patient phone:", key: "phone" },
	        { key_ates: "::p10:Patient address:", key: "address" },
	        { key_ates: "::p11:Patient province:", key: "province" },
	        { key_ates: "::p12:Patient zip code:", key: "zipcode" },
	        { key_ates: "::p13:Patient city:", key: "city" },
	        { key_ates: "::p14:Patient race:", key: "race" },
	        { key_ates: "::p15:Patient profession:", key: "proffession" },
	        { key_ates: "::p16:Patient weight:", key: "weight" },
	        { key_ates: "::p17:Patient weight units:", key: "weight_units" },
	        { key_ates: "::p18:Patient height:", key: "height" },
	        { key_ates: "::p19:Patient height units:", key: "height_units" },
	        { key_ates: "::p20:Patient minimum blood pressure:", key: "min_blood_pressure" },
	        { key_ates: "::p21:Patient maximum blood pressure:", key: "max_blood_pressure" },
	        { key_ates: "::p22:Patinet notes:", key: "notes" }
	    ];
	    var test_key = [
	        { key_ates: "::e01:Examine number:", key: "number" },
	        { key_ates: "::e02:Examine history:", key: "history" },
	        { key_ates: "::e03:Examine medicat:", key: "medicat" },
	        { key_ates: "::e04:Examine technic:", key: "technic" },
	        { key_ates: "::e05:Examine interpretation:", key: "interpretation" },
	        { key_ates: "::e06:Examine summary:", key: "summary" },
	        { key_ates: "::e07:Examine doctor:", key: "doctor" },
	        { key_ates: "::e08:Examine annotation:", key: "annotation" },
	        { key_ates: "::e09:Examine date and time:", key: "date" },
	        { key_ates: "::e10:Examine duration (sec):", key: "duration" },
	        { key_ates: "::e11:Patient examine weight:", key: "weight" },
	        { key_ates: "::e12:Patient examine height:", key: "height" },
	        { key_ates: "::e13:Patient minimum examine blood pressure:", key: "min_blood_pressure" },
	        { key_ates: "::e14:Patient maximum examine blood pressure:", key: "max_blood_pressure" },
	        { key_ates: "::e15:Patient examine weight units:", key: "weight_units" },
	        { key_ates: "::e16:Patient examine height units:", key: "height_units" }
	    ];

	    function isPatientKey(value) {
	        for (var i = 0; i < patient_key.length; i++) {
	            if (value.indexOf(patient_key[i].key_ates) != -1) return patient_key[i];
	        }
	    }
	    function isPropertyKey(value) {
	        for (var i = 0; i < test_key.length; i++) {
	            if (value.indexOf(test_key[i].key_ates) != -1) return test_key[i];
	        }
	    }

		var patient = {};
		var property = {};

		var index = buffer.lastIndexOf("::e17:Examine data:");
		if (index == -1) return Promise.reject("bad format");
		index += 21;
		var header = (buffer.slice(0, index )).toString();
		
		
		header = header.split("\n");
		var last_key = undefined;
		for (var i = 0;  i < header.length; i++) {
			if (header[i].indexOf("::p") != -1) {
				var result = isPatientKey(header[i]);
				if (result != undefined) {
					patient[result.key] = header[i].substring(result.key_ates.length + 1);
				}
			}
			else if (header[i].indexOf("::e") != -1) {
				var result = isPropertyKey(header[i]);
				if (result != undefined) {
					property[result.key] = header[i].substring(result.key_ates.length + 1);
					last_key = result.key;
				}
			}
			else if (last_key) {
				if (typeof property[last_key] == 'string') property[last_key] = [property[last_key].split("\r")[0]];
				property[last_key].push(header[i].split("\r")[0]);
			}
		}
		return {
            patient: patient, property: property
        }
	}

    callback = callback || function() {};
    callback("Sender started");
};