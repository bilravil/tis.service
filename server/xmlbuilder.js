const builder = require('xmlbuilder');
var bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const multiparty = require('multiparty');
const fs = require('fs');
const exec = require('child_process').execFile;

exports.Run = function(config,api, callback){  

	const path = config.easyecg.easyecginputdir;
	const configPath ='./';
	const atesExe = config.easyecg.easyecgpath;

	let buildAtesXml = (data) =>{
		let sex = data.task['patient.sex'] === 1 ? 'М' : 'Ж';
		let tmp = data.task['patient.birthday'].toString();
		let birthday = `${tmp.substring(6)}.${tmp.substring(4,6)}.${tmp.substring(0,4)}`;
		let full_name = `${data.task['patient.first']} ${data.task['patient.middle']} ${data.task['patient.last']}`;
		api.GetLogger().write(`Начато обследование пациента - ${full_name}`);
		var xml = builder.create('REQUEST').att('Type','PATIENT_ADD')
	  		.ele('PATIENT_DATA').att('XML_VERSION','1.0')
	    		.ele('PAT_DB_ID', '-1')
	    		.up()
    			.ele('PAT_CODE', data.task['patient.uuid'])
    			.up()
	    		.ele('PAT_FULL_NAME', full_name)
	    		.up()
	    		.ele('PAT_LAST_NAME', data.task['patient.first'])
	    		.up()
	    		.ele('PAT_FIRST_NAME',data.task['patient.middle'])
	    		.up()
	    		.ele('PAT_MIDDLE_NAME',data.task['patient.last'])
	    		.up()
	    		.ele('PAT_SEX', sex)
	    		.up()
	    		.ele('PAT_BIRTH_DATE',birthday)
	    		.up()
	    		.ele('PAT_PROFESSION',' ' )
	    		.up()
	    		.ele('PAT_CITY',' ' )
	    		.up()
	    		.ele('PAT_REGION', ' ')
	    		.up()
	    		.ele('PAT_ZIP', ' ')
	    		.up()
	    		.ele('PAT_ADDRESS', ' ')
	    		.up()
	    		.ele('PAT_PHONE',' ' )
	    		.up()
	    		.ele('PAT_WEIGHT',' ' )
	    		.up()
	    		.ele('PAT_WEIGHT_UNITS', ' ')
	    		.up()
	    		.ele('PAT_HEIGHT',' ' )
	    		.up()
	    		.ele('PAT_HEIGHT_UNITS',' ' )
	    		.up()
	    		.ele('PAT_SYST', ' ')
	    		.up()
	    		.ele('PAT_DIAST', ' ')
	    		.up()
	    		.ele('PAT_NOTES', data.task.uuid)
	    		.up()
	    		.up()
			.ele('EXAM_FILE_FORMAT', 'ECG')
			.up()
			.ele('DO_EXAM', 'TRUE')
			.up()
			.ele('START_ACQ', 'TRUE')
		  	.end({ pretty: true});

	  	fs.writeFile(path + data.task['patient.uuid'] + '.xml', xml, function(err) {}) 
	}

	let buildConfig = (data) =>{
		var json = {

			main : {
				server : data.server,
				port : data.port
			},
			easyecg : {
				easyecgsernum : data.easyecgsernum,
				easyecginputdir : data.easyecginputdir,
				easyecgoutputdir : data.easyecgoutputdir,
				easyecgpath : data.easyecgpath
			}
			
		}

	  	fs.writeFile('./config.json', JSON.stringify(json), function(err) {}) 
	}

	let readConfig = () => {
		return new Promise(function(resolve,reject){
            if (!fs.existsSync('./config.json')) { resolve(['']); return;}
            fs.readFile('./config.json', 'utf8', function(err, data) {
                resolve(JSON.parse(data));
            });  
        })   
	}

	let runAtesMedicaExe = () => {
	  	exec(atesExe, function(err, data) {  
	  		if(err!== null) api.GetLogger().write(`Ошибка при запуске программы Ates. Проверьте в настройках путь к программе.`);                
	    });
	}

    api.GetExpress().post('/tis/run/ecg.rest', jsonParser, function(req, res) {
        if (!req.body) return res.send({ success: false, message: "Invalid arguments" });
        if (req.method === 'POST') {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
            	runAtesMedicaExe();
            	var data = JSON.parse(fields.jsonData[0]);
                buildAtesXml(data);
                let param = {
                	uuidTest : data.task.uuid,
                	uuidPatient : data.task['patient.uuid'],
                	state: 'registered'
                }
                api.GetDB().test.Create(param);
                res.send({ success: true});
            });
            return;
        }
    });

    api.GetExpress().post('/tis/writeConfig', jsonParser, function(req, res) {
        if (!req.body) return res.send({ success: false, message: "Invalid arguments" });
        if (req.method === 'POST') {
            buildConfig(req.body);
            res.send({ success: true} );
            return;
        }
    });

    api.GetExpress().post('/tis/readConfig', jsonParser, function(req, res) {
        if (!req.body) return res.send({ success: false, message: "Invalid arguments" });
        if (req.method === 'POST') {
            readConfig().then(result=>{
            	res.send({ success: true , msg : result} );
            })
        }
    });

    callback = callback || function() {};
    callback("Xmlbuilder started");
};