const builder = require('xmlbuilder');
var bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const multiparty = require('multiparty');
const fs = require('fs');

exports.Run = function(config,api, callback){  

	const path ='C:/ECGReceiver/Xml/In/';

	let build = (data) =>{
		let sex = data.task['patient.sex'] === 1 ? 'М' : 'Ж';
		let tmp = data.task['patient.birthday'].toString();
		let birthday = `${tmp.substring(6)}.${tmp.substring(4,6)}.${tmp.substring(0,4)}`
		var xml = builder.create('REQUEST').att('Type','PATIENT_ADD')
	  		.ele('PATIENT_DATA').att('XML_VERSION','1.0')
	    		.ele('PAT_DB_ID', '-1')
	    		.up()
    			.ele('PAT_CODE', data.task['patient.uuid'])
    			.up()
	    		.ele('PAT_FULL_NAME',`${data.task['patient.first']} ${data.task['patient.middle']} ${data.task['patient.last']}` )
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
	    		.ele('PAT_NOTES', ' ')
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

    api.GetExpress().post('/tis/run/ecg.rest', jsonParser, function(req, res) {
        if (!req.body) return res.send({ success: false, message: "Invalid arguments" });
        if (req.method === 'POST') {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                build(JSON.parse(fields.jsonData[0]));
                res.send({ success: true});
            });
            return;
        }       
    });

    callback = callback || function() {};
    callback("Xmlbuilder started");
};