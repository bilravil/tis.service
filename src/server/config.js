/*
	Contains functions for work with config - read and write from WEB
*/
var fs = require('fs');

class Config{
	constructor(api){
		this.api = api;
	}

	buildConfig(data) {
		var json = {
			main: {
				server: data.server,
				port: data.port,
				version: data.version
			},
			easyecg: {
				easyecgsernum: data.easyecgsernum,
				easyecginputdir: data.easyecginputdir,
				easyecgoutputdir: data.easyecgoutputdir,
				easyecgpath: data.easyecgpath
			}

		};

		fs.writeFile('./config.json', JSON.stringify(json), function (err) {});
	}

	readConfig() {
		return new Promise(function (resolve, reject) {
			if (!fs.existsSync('./config.json')) {
				resolve(['']);return;
			}
			fs.readFile('./config.json', 'utf8', function (err, data) {
				resolve(JSON.parse(data));
			});
		});
	}

	// this.api.GetExpress().post('/tis/writeConfig', jsonParser, function (req, res) {
	// 	if (!req.body) return res.send({ success: false, message: "Invalid arguments" });
	// 	if (req.method === 'POST') {
	// 		buildConfig(req.body);
	// 		res.send({ success: true });
	// 		return;
	// 	}
	// })
	
	// this.api.GetExpress().post('/tis/readConfig', jsonParser, function (req, res) {
	// 	if (!req.body) return res.send({ success: false, message: "Invalid arguments" });
	// 	if (req.method === 'POST') {
	// 		readConfig().then(function (result) {
	// 			res.send({ success: true, msg: result });
	// 		});
	// 	}
	// })
}