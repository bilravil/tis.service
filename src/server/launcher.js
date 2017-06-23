/*
	This class is responsible for creation XML file and then run Easy ECG Soft for monitoring ECG
*/

'use strict';

var builder = require('xmlbuilder');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var multiparty = require('multiparty');
var fs = require('fs');
var elevate = require('node-windows').elevate;

class Launcher{
	constructor(api,ecgInDir,atesExePath){
		this.api = api;
		this.ecgInDir = ecgInDir;
		this.atesExePath = atesExePath;
	}

	buildAtesXml(data) {
		var sex = data['patient.sex'] === 1 ? 'М' : 'Ж';
		var tmp = data['patient.birthday'].toString();
		var birthday = tmp.substring(6) + '.' + tmp.substring(4, 6) + '.' + tmp.substring(0, 4);
		var full_name = data['patient.first'] + ' ' + data['patient.middle'] + ' ' + data['patient.last'];
		this.api.GetLogger().write('Начато обследование пациента - ' + full_name);
		var xml = builder.create('REQUEST').att('Type', 'PATIENT_ADD')
			.ele('PATIENT_DATA').att('XML_VERSION', '1.0')
				.ele('PAT_DB_ID', '-1')
				.up()
				.ele('PAT_CODE', data['patient.uuid'])
				.up()
				.ele('PAT_FULL_NAME', full_name)
				.up()
				.ele('PAT_LAST_NAME', data['patient.first'])
				.up()
				.ele('PAT_FIRST_NAME', data['patient.middle'])
				.up()
				.ele('PAT_MIDDLE_NAME', data['patient.last'])
				.up()
				.ele('PAT_SEX', sex)
				.up()
				.ele('PAT_BIRTH_DATE', birthday)
				.up()
				.ele('PAT_PROFESSION', ' ')
				.up()
				.ele('PAT_CITY', ' ')
				.up()
				.ele('PAT_REGION', ' ')
				.up()
				.ele('PAT_ZIP', ' ')
				.up()
				.ele('PAT_ADDRESS', ' ')
				.up()
				.ele('PAT_PHONE', ' ')
				.up()
				.ele('PAT_WEIGHT', ' ')
				.up()
				.ele('PAT_WEIGHT_UNITS', ' ')
				.up()
				.ele('PAT_HEIGHT', ' ')
				.up()
				.ele('PAT_HEIGHT_UNITS', ' ')
				.up()
				.ele('PAT_SYST', ' ')
				.up()
				.ele('PAT_DIAST', ' ')
				.up()
				.ele('PAT_NOTES', data.uuid)
			.up()
			.up()
			.ele('EXAM_FILE_FORMAT', 'ECG')
			.up()
			.ele('DO_EXAM', 'TRUE')
			.up()
			.ele('START_ACQ', 'TRUE')
		.end({ pretty: true });

		fs.writeFile(this.ecgInDir + data['patient.uuid'] + '.xml', xml, function (err) {});
	}

	runAtesMedicaExe() {
		this.atesExePath = '\"' + atesExePath + '\"'; 
		this.api.GetLogger().write(this.atesExePath);
		elevate(this.atesExePath, function (err, data) {
			if (err !== null) this.api.GetLogger().write('Ошибка при запуске программы Ates. Проверьте в настройках путь к программе.');
		});
	}

	// api.GetExpress().post('/tis/run/ecg.rest', jsonParser, function (req, res) {
	// 	if (!req.body) return res.send({ success: false, message: "Invalid arguments" });
	// 	if (req.method === 'POST') {
			// var form = new multiparty.Form();
			// form.parse(req, function (err, fields, files) {
			// 	runAtesMedicaExe();
			// 	var data = JSON.parse(fields.jsonData[0]);
			// 	buildAtesXml(data);
			// 	var param = {
			// 		uuidTest: data.task.uuid,
			// 		uuidPatient: data.task['patient.uuid'],
			// 		state: 'registered'
			// 	};
			// 	api.GetDB().test.Create(param);
			// 	res.send({ success: true });
			// });
	// 		return;
	// 	}
	// })

}





	
